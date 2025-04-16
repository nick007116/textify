import React from 'react';
import { FaTimes, FaUserGraduate, FaEnvelope, FaIdCard, FaBuilding, FaBook } from 'react-icons/fa';

const Profile = ({ teacherData, onClose }) => {
  return (
    <div className="profile-overlay">
      <div className="profile-card">
        <div className="profile-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold text-white">Teacher Profile</h5>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="profile-info">
          <div className="info-item">
            <FaUserGraduate className="info-icon" />
            <div className="info-content">
              <span className="info-label">Name</span>
              <span className="info-value">{teacherData?.name}</span>
            </div>
          </div>
          
          <div className="info-item">
            <FaEnvelope className="info-icon" />
            <div className="info-content">
              <span className="info-label">Email</span>
              <span className="info-value">{teacherData?.email}</span>
            </div>
          </div>
          
          <div className="info-item">
            <FaIdCard className="info-icon" />
            <div className="info-content">
              <span className="info-label">Teacher ID</span>
              <span className="info-value">{teacherData?.tid}</span>
            </div>
          </div>
          
          <div className="info-item">
            <FaBuilding className="info-icon" />
            <div className="info-content">
              <span className="info-label">Department</span>
              <span className="info-value">{teacherData?.department}</span>
            </div>
          </div>
          
          <div className="info-item">
            <FaBook className="info-icon" />
            <div className="info-content">
              <span className="info-label">Course</span>
              <span className="info-value">{teacherData?.course}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;