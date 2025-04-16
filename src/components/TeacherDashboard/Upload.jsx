import React, { useState, useEffect } from "react";
import { FaCloudUploadAlt, FaSpinner, FaFile } from "react-icons/fa";
import { auth, db } from "../../utils/Firebase";
import { doc, addDoc, getDoc, updateDoc, collection } from "firebase/firestore";
import { supabase } from "../../utils/Supabase";

function Upload({ onSuccess, editMaterial = null }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [teacherData, setTeacherData] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    fileType: "PDF"
  });

  // Load teacher data on mount
  useEffect(() => {
    const fetchTeacherData = async () => {
      const user = auth.currentUser;
      if (user) {
        const teacherDoc = await getDoc(doc(db, "teachers", user.uid));
        if (teacherDoc.exists()) {
          setTeacherData(teacherDoc.data());
        }
      }
    };
    fetchTeacherData();
  }, []);

  // If editing, prefill form values. Existing files are retained.
  useEffect(() => {
    if (editMaterial) {
      setFormData({
        title: editMaterial.title || "",
        fileType: editMaterial.fileType || "PDF"
      });
      // Leave files empty so that if no new file is selected, old files remain.
    }
  }, [editMaterial]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    // Remove duplicate files (by name and size)
    const uniqueFiles = [];
    const fileKeys = new Set();
    selectedFiles.forEach((file) => {
      const key = file.name + "_" + file.size;
      if (!fileKeys.has(key)) {
        fileKeys.add(key);
        uniqueFiles.push(file);
      }
    });
    // Validate file extensions
    const validExtensions = ["pdf", "doc", "docx", "ppt", "pptx"];
    const validFiles = uniqueFiles.filter((file) => {
      const ext = file.name.split(".").pop().toLowerCase();
      return validExtensions.includes(ext);
    });
    if (validFiles.length !== uniqueFiles.length) {
      setMessage("Some duplicate files were removed.");
    } else {
      setMessage("");
    }
    setFiles(validFiles);
  };

  const uploadToSupabase = async (file) => {
    try {
      const filePath = `${formData.title}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from("uploaded_files")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false
        });
      if (error) {
        console.error("Supabase upload error:", error);
        throw new Error(`Upload failed: ${error.message}`);
      }
      const fileUrl = supabase.storage
        .from("uploaded_files")
        .getPublicUrl(data.path).data.publicUrl;
      return {
        url: fileUrl,
        name: file.name,
        size: file.size,
        path: data.path
      };
    } catch (error) {
      console.error("Supabase upload error:", error);
      throw error;
    }
  };

  // Rollback any uploaded files in case of error
  const rollbackUploadedFiles = async (uploadedFiles) => {
    const deletePromises = uploadedFiles.map((file) =>
      supabase.storage.from("uploaded_files").remove([file.path])
    );
    try {
      await Promise.all(deletePromises);
    } catch (err) {
      console.error("Rollback error:", err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      setMessage("Please fill in all fields.");
      return;
    }

    // Ensure teacher data is available
    let teacherInfo = teacherData;
    if (!teacherInfo) {
      const storedTeacherData = localStorage.getItem("teacherData");
      if (storedTeacherData) {
        teacherInfo = JSON.parse(storedTeacherData);
        setTeacherData(teacherInfo);
      }
    }
    if (!teacherInfo) {
      const user = auth.currentUser;
      const teacherDoc = await getDoc(doc(db, "teachers", user.uid));
      if (!teacherDoc.exists()) {
        setMessage("Teacher data not found. Please register first.");
        return;
      }
      teacherInfo = teacherDoc.data();
      setTeacherData(teacherInfo);
      localStorage.setItem("teacherData", JSON.stringify(teacherInfo));
    }

    setLoading(true);
    let uploadedFileDetails = [];
    try {
      // If new files are selected, upload them
      if (files.length > 0) {
        const uploadPromises = files.map((file) => uploadToSupabase(file));
        uploadedFileDetails = await Promise.all(uploadPromises);
      }

      if (editMaterial) {
        // For edit mode: combine existing files with new file uploads if any.
        const materialRef = doc(db, "materials", editMaterial.id);
        const updatedFiles =
          files.length > 0
            ? [...(editMaterial.files || []), ...uploadedFileDetails]
            : editMaterial.files;
        await updateDoc(materialRef, {
          title: formData.title,
          fileType: formData.fileType,
          files: updatedFiles,
          // Optionally update timestamp
          uploadedAt: new Date().toISOString()
        });
        setMessage("Material updated successfully!");
      } else {
        // New upload mode: create document entry in Firestore.
        const materialData = {
          title: formData.title,
          fileType: formData.fileType,
          department: teacherInfo?.department || "",
          course: teacherInfo?.course || "",
          teacherId: auth.currentUser.uid,
          teacherName: teacherInfo?.name || "",
          uploadedAt: new Date().toISOString(),
          files: uploadedFileDetails,
          downloads: 0,
          views: 0
        };
        await addDoc(collection(db, "materials"), materialData);
        setMessage("Files uploaded successfully!");
      }

      setFormData({ title: "", fileType: "PDF" });
      setFiles([]);
      if (onSuccess) {
        window.location.reload(); // Reload the entire page
      }
    } catch (error) {
      console.error("Upload error:", error);
      if (uploadedFileDetails.length > 0) {
        await rollbackUploadedFiles(uploadedFileDetails);
      }
      setMessage("Error uploading files. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center p-3">
      <div className="mb-4">
        <div className="bg-primary bg-opacity-10 rounded-circle p-4 d-inline-block mb-3">
          <FaCloudUploadAlt size={40} className="text-primary" />
        </div>
        <h5>{editMaterial ? "Edit Study Material" : "Upload Study Material"}</h5>
        <p className="text-muted small">
          Supported formats: PDF, DOC, DOCX, PPT, PPTX
        </p>
      </div>

      <form onSubmit={handleUpload} className="text-start">
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter material title"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">File Type</label>
          <select
            className="form-select"
            name="fileType"
            value={formData.fileType}
            onChange={handleInputChange}
            required
          >
            <option value="PDF">PDF</option>
            <option value="DOC">DOC/DOCX</option>
            <option value="PPT">PPT/PPTX</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="form-label">
            {editMaterial ? "Change Files (optional)" : "Select Files"}
          </label>
          <input
            type="file"
            className="form-control"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.ppt,.pptx"
            multiple={!editMaterial} // Allow multi-select in both modes
            required={!editMaterial}  // Required for new uploads
          />
          {files.length > 0 && (
            <div className="mt-2">
              <p className="small text-muted mb-2">Selected files:</p>
              {files.map((file, index) => (
                <div key={index} className="small text-muted">
                  <FaFile className="me-2" />
                  {file.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary rounded-pill px-4 w-100"
          disabled={loading}
        >
          {loading ? (
            <>
              <FaSpinner className="spinner-border spinner-border-sm me-2" />
              {editMaterial ? "Updating..." : "Uploading..."}
            </>
          ) : (
            editMaterial ? "Update Material" : "Upload Files"
          )}
        </button>

        {message && (
          <div className={`alert alert-${message.includes("Error") ? "danger" : "success"} mt-3`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}

export default Upload;