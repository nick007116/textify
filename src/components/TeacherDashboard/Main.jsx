import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cards from "./Cards";
import Upload from "./Upload";
import { auth, db } from "../../utils/Firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { FaSignOutAlt, FaUser, FaBook, FaPlus } from "react-icons/fa";
import Profile from "./Profile";
import "./Profile.css";
import "./Teacher.css";

function TeacherDashboard() {
  const navigate = useNavigate();
  const [teacherData, setTeacherData] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false); // State to control profile card visibility
  const [materials, setMaterials] = useState([]);

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
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      try {
        if (!user) {
          const token = localStorage.getItem("jwt");
          if (!token) {
            navigate("/login");
            return;
          }
        } else {
          // Try getting teacher data by UID first
          let teacherDoc = await getDoc(doc(db, "teachers", user.uid));

          // If not found, try by email
          if (!teacherDoc.exists()) {
            const q = query(
              collection(db, "teachers"),
              where("email", "==", user.email)
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              teacherDoc = querySnapshot.docs[0];
            }
          }

          if (teacherDoc.exists()) {
            const data = teacherDoc.data();
            setTeacherData(data);
            localStorage.setItem("teacherData", JSON.stringify(data));
          }
        }
      } catch (error) {
        console.error("Error fetching teacher data:", error);
        // Try to get from localStorage backup
        const savedData = localStorage.getItem("teacherData");
        if (savedData) {
          setTeacherData(JSON.parse(savedData));
        }
      } finally {
        setLoading(false);
        fetchMaterials();
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = () => {
    auth.signOut();
    localStorage.removeItem("jwt");
    localStorage.removeItem("teacherData");
    navigate("/login");
  };

  const toggleProfile = () => {
    setShowProfile(!showProfile);
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
        <div className="spinner-grow text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Improved Navbar */}
      <nav className="navbar navbar-light bg-white shadow-sm sticky-top navbar-expand-lg">
        <div className="container-fluid px-4">
          <div className="d-flex w-100 align-items-center justify-content-between py-2">
            {/* Brand Section */}
            <div className="navbar-brand d-flex align-items-center">
              <div className="brand-icon-wrapper position-relative">
                <div className="brand-icon-bg"></div>
                <FaBook className="brand-icon" size={24} />
              </div>
              <span className="brand-text ms-3">Textify</span>
            </div>
            
            {/* Right Section */}
            <div className="d-flex align-items-center gap-4">
              {/* Profile Trigger */}
              <div 
                className="profile-trigger-new"
                onClick={toggleProfile}
              >
                <div className="profile-avatar-wrapper">
                  {teacherData?.photoURL ? (
                    <img 
                      src={teacherData.photoURL} 
                      alt="profile" 
                      className="profile-image"
                    />
                  ) : (
                    <div className="profile-avatar-placeholder">
                      <FaUser size={16} />
                    </div>
                  )}
                </div>
                <span className="profile-name">
                  {teacherData?.name || "Teacher"}
                </span>
                <i className="fas fa-chevron-down ms-2"></i>
              </div>

              {/* Logout Button */}
              <button 
                className="logout-button"
                onClick={handleLogout}
              >
                <FaSignOutAlt size={16} />
                <span className="d-none d-sm-inline ms-2">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Profile Card */}
      {showProfile && (
        <div className="profile-dropdown-wrapper">
          <Profile teacherData={teacherData} onClose={toggleProfile} />
        </div>
      )}

      <div className="container py-5">
        {/* Welcome Section */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold mb-3">
            Welcome back,{" "}
            <span className="text-primary">
              {teacherData?.name || "Teacher"}
            </span>
            !
          </h1>
          <p className="lead text-muted">
            Ready to create and manage your educational content?
          </p>
        </div>

        {/* Action Cards Section */}
        <div className="row justify-content-center g-4 mb-5">
          <div className="col-md-4">
            <div
              className="card h-100 border-0 shadow-sm rounded-4 hover-shadow transition"
              style={{ border: "2px dashed #ccc", cursor: "pointer" }}
              onClick={() => setShowUpload(true)}
            >
              <div className="card-body p-5 text-center">
                <div
                  className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle mb-4"
                  style={{ width: "60px", height: "60px" }}
                >
                  <FaPlus className="text-primary" size={28} />
                </div>
                <h3 className="card-title h4 fw-bold">Create New Material</h3>
                <p className="card-text text-muted mb-0">
                  Click here to craft engaging study materials for your
                  students!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Materials Section */}
        <div className="mb-4">
          <h2 className="h4 mb-4">Recent Materials</h2>
          <Cards materials={materials} fetchMaterials={fetchMaterials} />
        </div>

        {/* Upload Modal */}
        {showUpload && (
          <div
            className="modal d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4">
                <div className="modal-header border-0">
                  <h5 className="modal-title">Upload Study Material</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowUpload(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <Upload onSuccess={() => { setShowUpload(false); fetchMaterials(); }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx="true">{`
        .hover-shadow:hover {
          transform: translateY(-5px);
          box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175) !important;
        }
        .transition {
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
}

export default TeacherDashboard;