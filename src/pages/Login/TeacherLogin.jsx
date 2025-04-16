import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../utils/Firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
    FaEnvelope,
    FaLock,
    FaSpinner,
    FaArrowLeft,
} from "react-icons/fa";

function TeacherLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (!formData.email || !formData.password) {
        throw new Error("Please fill in all fields");
      }

      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      if (userCredential.user) {
        // Get the Firebase JWT token (ID token)
        const token = await userCredential.user.getIdToken();
        localStorage.setItem("jwt", token);
        navigate("/teacher-dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <div className="card border-0 shadow-lg rounded-4">
              {/* Back Button */}
              <div className="card-header bg-transparent border-0">
                <button
                  className="btn btn-link text-decoration-none"
                  onClick={() => navigate(-1)}
                >
                  <FaArrowLeft className="me-2" /> Back
                </button>
              </div>
              <div className="card-header bg-primary bg-gradient text-white text-center py-4 border-0 rounded-top-4">
                <h2 className="h4 mb-2">Teacher Login</h2>
                <p className="text-white-50 small mb-0">
                  Welcome back to our platform
                </p>
              </div>
              {error && (
                <div className="alert alert-danger alert-dismissible fade show mx-3 mt-3 mb-0">
                  <strong>Error!</strong> {error}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setError("")}
                  ></button>
                </div>
              )}
              <div className="card-body p-4">
                <form onSubmit={handleEmailLogin} className="needs-validation">
                  <div className="form-floating mb-3">
                    <input
                      type="email"
                      className="form-control form-control-sm"
                      style={{ height: "45px" }}
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                    <label className="d-flex align-items-center small">
                      <FaEnvelope className="me-2 text-primary" size={14} />
                      Email Address
                    </label>
                  </div>
                  <div className="form-floating mb-4">
                    <input
                      type="password"
                      className="form-control form-control-sm"
                      style={{ height: "45px" }}
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                    <label className="d-flex align-items-center small">
                      <FaLock className="me-2 text-primary" size={14} />
                      Password
                    </label>
                  </div>
                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary rounded-pill py-2 btn-sm"
                      style={{ height: "42px" }}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <FaSpinner
                            className="spinner-border spinner-border-sm me-2"
                            size={14}
                          />
                          Logging in...
                        </>
                      ) : (
                        "Login"
                      )}
                    </button>
                  </div>
                </form>
              </div>
              {/* Register link */}
              <div className="card-footer text-center py-3">
                <p className="mb-0">
                  Don't have an account?{" "}
                  <button
                    className="btn btn-link text-decoration-none"
                    onClick={() => navigate("/register")}
                  >
                    Click here to register
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherLogin;