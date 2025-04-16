import React, { useState, useEffect } from "react";
import {
  FaFile,
  FaClock,
  FaEye,
  FaEdit,
  FaTrash,
  FaFilePdf,
  FaFileWord,
  FaFilePowerpoint,
  FaDownload,
  FaChevronRight
} from "react-icons/fa";
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../../utils/Firebase";
import { supabase } from "../../utils/Supabase";
import Upload from "./Upload";
import "./Teacher.css";

const Cards = () => {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showFilesModal, setShowFilesModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState(null);

  const fetchMaterials = async () => {
    const user = auth.currentUser;
    if (user) {
      const q = query(collection(db, "materials"), where("teacherId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setMaterials(data);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const getFileIcon = (ext) => {
    const extension = ext.toLowerCase();
    if (extension.includes("pdf")) return <FaFilePdf className="text-danger" size={24} />;
    if (extension.includes("doc")) return <FaFileWord className="text-primary" size={24} />;
    if (extension.includes("ppt")) return <FaFilePowerpoint className="text-warning" size={24} />;
    return <FaFile className="text-secondary" size={24} />;
  };

  const handleDeleteFile = async (materialId, fileToDelete) => {
    try {
      await supabase.storage.from("uploaded_files").remove([fileToDelete.path]);
      const materialRef = doc(db, "materials", materialId);
      const updatedFiles = selectedMaterial.files.filter(
        (file) => file.path !== fileToDelete.path
      );
      await updateDoc(materialRef, { files: updatedFiles });
      setSelectedMaterial((prev) => ({ ...prev, files: updatedFiles }));
      fetchMaterials();
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    try {
      const materialToDel = materials.find((m) => m.id === materialId);

      // Delete all storage files first
      if (materialToDel.files && materialToDel.files.length > 0) {
        const filePaths = materialToDel.files.map((file) => file.path);
        await supabase.storage.from("uploaded_files").remove(filePaths);
      }

      // Delete the Firestore document
      await deleteDoc(doc(db, "materials", materialId));

      // Update local state
      setMaterials(materials.filter((material) => material.id !== materialId));
      setShowDeleteConfirm(false);
      setMaterialToDelete(null);
    } catch (error) {
      console.error("Error deleting material:", error);
      alert("Error deleting material. Please try again.");
    }
  };

  const truncateFileName = (name, maxLength = 25) => {
    if (name.length <= maxLength) return name;
    const extension = name.split(".").pop();
    const nameWithoutExt = name.substring(0, name.lastIndexOf("."));
    return `${nameWithoutExt.substring(0, maxLength - extension.length - 4)}...${extension}`;
  };

  const PreviewSection = ({ file, onDelete, materialId }) => (
    <div className="file-preview-item p-3">
      <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between">
        <div className="d-flex align-items-center flex-grow-1 min-width-0 mb-2 mb-sm-0">
          {getFileIcon(file.name)}
          <span className="ms-2 text-truncate">{file.name}</span>
        </div>
        <div className="preview-actions d-flex">
          <a
            href={file.url}
            download
            className="btn btn-primary btn-sm me-2"
            onClick={(e) => e.stopPropagation()}
          >
            <FaDownload className="me-2" size={16} />
            Download
          </a>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onDelete(materialId, file)}
          >
            <FaTrash className="me-2" size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid py-4 px-3 px-md-4 bg-light">
     <div className="row g-4">
  {materials.map((material) => (
    <div key={material.id} className="col-12 col-md-6 col-lg-4">
      <div
        className="card material-card h-100 border-0 shadow-sm"
        onClick={() => {
          setSelectedMaterial(material);
          setShowFilesModal(true);
        }}
      >
        <div className="card-body p-4">
          <div className="d-flex flex-column mb-4">
            <h4 className="card-title mb-2">{material.title}</h4>
            <div className="badge bg-primary-subtle text-primary">
              {material.department} • {material.course}
            </div>
          </div>

          <div className="files-preview">
            {material.files?.slice(0, 2).map((file, idx) => (
              <div key={idx} className="file-item p-3 mb-2 rounded">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center flex-grow-1 min-width-0">
                    {getFileIcon(file.name)}
                    <span className="ms-2 text-truncate file-name">
                      {truncateFileName(file.name, 30)}
                    </span>
                  </div>
                  <a
                    href={file.url}
                    download
                    className="btn btn-sm btn-link text-primary p-1 ms-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaDownload size={16} />
                  </a>
                </div>
              </div>
            ))}
            {material.files?.length > 2 && (
              <div className="text-primary d-flex align-items-center justify-content-center mt-2">
                <small className="fw-medium">+{material.files.length - 2} more files</small>
                <FaChevronRight size={12} className="ms-1" />
              </div>
            )}
          </div>
        </div>

        <div className="card-footer bg-transparent">
          <div className="d-flex justify-content-between">
            <button
              className="btn edit-btn"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMaterial(material);
                setShowEditModal(true);
              }}
            >
              <FaEdit size={16} className="me-2" />
              Edit
            </button>
            <button
              className="btn delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                setMaterialToDelete(material.id);
                setShowDeleteConfirm(true);
              }}
            >
              <FaTrash size={16} className="me-2" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  ))}
</div>

      {/* Files Modal */}
      {showFilesModal && selectedMaterial && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 rounded-4">
              <div className="modal-header border-0">
                <div className="w-75">
                  <h5 className="modal-title fw-bold mb-1 text-truncate">{selectedMaterial.title}</h5>
                  <div className="badge bg-primary-subtle text-primary rounded-pill text-truncate">
                    <span className="d-inline-block text-truncate" style={{ maxWidth: "200px" }}>
                      {selectedMaterial.department} • {selectedMaterial.course}
                    </span>
                  </div>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowFilesModal(false)}></button>
              </div>
              <div className="modal-body p-3 p-md-4">
                <div className="row g-3">
                  {selectedMaterial.files?.map((file, index) => (
                    <div key={index} className="col-12">
                      <PreviewSection file={file} onDelete={handleDeleteFile} materialId={selectedMaterial.id} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedMaterial && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">{selectedMaterial ? "Edit Material" : "Add New Material"}</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <Upload
                  editMaterial={selectedMaterial}
                  onSuccess={() => {
                    setShowEditModal(false);
                    fetchMaterials();
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">Confirm Delete</h5>
              </div>
              <div className="modal-body">
                <p>Do you want to delete this material?</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={() => handleDeleteMaterial(materialToDelete)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cards;