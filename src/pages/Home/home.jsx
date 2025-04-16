import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaChalkboardTeacher, 
  FaUserGraduate, 
  FaSignInAlt, 
  FaArrowRight 
} from 'react-icons/fa';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* Hero Section */}
      <div className="bg-primary bg-opacity-10 py-5">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="badge bg-primary px-3 py-2 mb-3">Educational Platform</span>
              <h1 className="display-4 fw-bold text-primary mb-3">
                Welcome to Textify <span className="display-4">📚</span>
              </h1>
              <p className="lead text-muted mb-4">
                Your comprehensive platform for managing educational resources and connecting teachers with students.
              </p>
              <button 
                className="btn btn-primary btn-lg px-4 me-2 rounded-pill shadow-sm"
                onClick={() => document.getElementById('roles').scrollIntoView({ behavior: 'smooth' })}
              >
                Get Started <FaArrowRight className="ms-2" />
              </button>
            </div>
            <div className="col-lg-6">
              <div className="p-4 bg-white rounded-4 shadow">
                <img
                  src="/assets/hero-image.png"
                  alt="Education Platform"
                  className="img-fluid rounded-3"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Section */}
      <div id="roles" className="container py-5">
        <div className="text-center mb-5">
          <h2 className="display-6 fw-bold">Choose Your Role</h2>
          <p className="lead text-muted">Select how you want to join our platform</p>
        </div>
        <div className="row g-4 justify-content-center">
          {/* Teacher Card */}
          <div className="col-md-6 col-lg-5">
            <div className="card h-100 border-0 shadow hover-shadow-lg rounded-4 transition-all">
              <div className="card-body d-flex flex-column p-4 p-xl-5">
                <div className="text-center mb-4">
                  <div className="d-inline-flex p-3 rounded-circle bg-primary bg-opacity-10">
                    <FaChalkboardTeacher size={40} className="text-primary" />
                  </div>
                  <h3 className="card-title h4 mt-4 mb-3">For Teachers</h3>
                  <p className="card-text text-muted mb-4">
                    Create and manage your digital classroom. Upload study materials and track student progress.
                  </p>
                </div>
                <div className="mt-auto">
                  <button 
                    className="btn btn-primary w-100 py-3 rounded-pill shadow-sm"
                    onClick={() => navigate('/login')}
                  >
                    <FaSignInAlt className="me-2" />
                    Teacher Login
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Student Card */}
          <div className="col-md-6 col-lg-5">
            <div className="card h-100 border-0 shadow hover-shadow-lg rounded-4 transition-all">
              <div className="card-body d-flex flex-column p-4 p-xl-5">
                <div className="text-center mb-4">
                  <div className="d-inline-flex p-3 rounded-circle bg-success bg-opacity-10">
                    <FaUserGraduate size={40} className="text-success" />
                  </div>
                  <h3 className="card-title h4 mt-4 mb-3">For Students</h3>
                  <p className="card-text text-muted mb-4">
                    Access quality study materials and enhance your learning experience digitally.
                  </p>
                </div>
                <div className="mt-auto">
                  <button 
                    className="btn btn-success w-100 py-3 rounded-pill shadow-sm"
                    onClick={() => navigate('/student-login')}
                  >
                    <FaSignInAlt className="me-2" />
                    Student Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-light mt-auto py-4 border-top">
        <div className="container text-center">
          <p className="text-muted mb-0">
            © {new Date().getFullYear()} Textify. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;