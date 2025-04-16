import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../utils/Firebase';
import { collection, addDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FaUser, FaIdCard, FaBuilding, FaBook, FaEnvelope, FaLock, FaSpinner, FaArrowLeft } from 'react-icons/fa';

function TeacherRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    tid: '',
    department: '',
    course: '',
    email: '',
    password: ''
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const departmentOptions = [
    { value: '', label: 'Select Department' },
    { value: 'computer_science', label: 'Computer Science' },
    { value: 'commerce', label: 'Commerce' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'arts', label: 'Arts' }
  ];

  const coursesMapping = {
    computer_science: [
      { value: '', label: 'Select Course' },
      { value: 'bsc_cs', label: 'BSc Computer Science' },
      { value: 'msc_cs', label: 'MSc Computer Science' }
    ],
    commerce: [
      { value: '', label: 'Select Course' },
      { value: 'bcom', label: 'BCom' },
      { value: 'mcom', label: 'MCom' }
    ],
    engineering: [
      { value: '', label: 'Select Course' },
      { value: 'btech', label: 'BTech' },
      { value: 'mtech', label: 'MTech' }
    ],
    arts: [
      { value: '', label: 'Select Course' },
      { value: 'ba', label: 'BA' },
      { value: 'ma', label: 'MA' }
    ]
  };

  useEffect(() => {
    if (formData.department in coursesMapping) {
      setCourses(coursesMapping[formData.department]);
      setFormData(prev => ({ ...prev, course: '' }));
    } else {
      setCourses([]);
      setFormData(prev => ({ ...prev, course: '' }));
    }
  }, [formData.department]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Form validation
      if (!formData.name || !formData.tid || !formData.department || 
          !formData.course || !formData.email || !formData.password) {
        throw new Error('Please fill in all fields');
      }

      // 1. Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // 2. Store teacher data in Firestore
      const teacherData = {
        uid: userCredential.user.uid,
        name: formData.name,
        tid: formData.tid,
        department: formData.department,
        course: formData.course,
        email: formData.email,
        authProvider: 'email',
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'teachers'), teacherData);
      console.log("Teacher document created with ID: ", docRef.id);

      setSuccess(true);
      // Reset form
      setFormData({
        name: '',
        tid: '',
        department: '',
        course: '',
        email: '',
        password: ''
      });

      // Navigate to login after 2 seconds
      setTimeout(() => {
        setSuccess(false);
        navigate('/login');
      }, 2000);

    } catch (err) {
      console.error('Registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already registered. Please use a different email.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
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
                <button className="btn btn-link text-decoration-none" onClick={() => navigate(-1)}>
                  <FaArrowLeft className="me-2" /> Back
                </button>
              </div>
              {/* Header Section */}
              <div className="card-header bg-primary bg-gradient text-white text-center py-4 border-0 rounded-top-4">
                <h2 className="h4 mb-2">Teacher Registration</h2>
                <p className="text-white-50 small mb-0">Join our educational platform</p>
              </div>

              {/* Alert Messages */}
              {success && (
                <div className="alert alert-success alert-dismissible fade show mx-3 mt-3 mb-0" role="alert">
                  <strong>Success!</strong> Your registration has been completed.
                  <button type="button" className="btn-close" onClick={() => setSuccess(false)}></button>
                </div>
              )}
              
              {error && (
                <div className="alert alert-danger alert-dismissible fade show mx-3 mt-3 mb-0" role="alert">
                  <strong>Error!</strong> {error}
                  <button type="button" className="btn-close" onClick={() => setError('')}></button>
                </div>
              )}

              {/* Form Section */}
              <div className="card-body p-4">
                <form onSubmit={handleSubmit} className="needs-validation">
                  {/* Input fields template - repeat for all fields */}
                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      style={{ height: '45px' }}
                      id="name"
                      name="name"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                    <label htmlFor="name" className="d-flex align-items-center small">
                      <FaUser className="me-2 text-primary" size={14} />
                      Full Name
                    </label>
                  </div>

                  {/* Teacher ID Input */}
                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className="form-control"
                      style={{ height: '50px' }}
                      id="tid"
                      name="tid"
                      placeholder="Enter teacher ID"
                      value={formData.tid}
                      onChange={handleInputChange}
                      required
                    />
                    <label htmlFor="tid" className="d-flex align-items-center">
                      <FaIdCard className="me-2 text-primary" /> Teacher ID
                    </label>
                  </div>

                  {/* Department Select */}
                  <div className="form-floating mb-3">
                    <select
                      className="form-select"
                      style={{ height: '50px' }}
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      required
                    >
                      {departmentOptions.map((dep) => (
                        <option key={dep.value} value={dep.value}>
                          {dep.label}
                        </option>
                      ))}
                    </select>
                    <label htmlFor="department" className="d-flex align-items-center">
                      <FaBuilding className="me-2 text-primary" /> Department
                    </label>
                  </div>

                  {/* Course Select */}
                  <div className="form-floating mb-3">
                    <select
                      className="form-select"
                      style={{ height: '50px' }}
                      id="course"
                      name="course"
                      value={formData.course}
                      onChange={handleInputChange}
                      required
                    >
                      {courses.map((crs) => (
                        <option key={crs.value} value={crs.value}>
                          {crs.label}
                        </option>
                      ))}
                    </select>
                    <label htmlFor="course" className="d-flex align-items-center">
                      <FaBook className="me-2 text-primary" /> Course
                    </label>
                  </div>

                  {/* Email Input */}
                  <div className="form-floating mb-3">
                    <input
                      type="email"
                      className="form-control"
                      style={{ height: '50px' }}
                      id="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                    <label htmlFor="email" className="d-flex align-items-center">
                      <FaEnvelope className="me-2 text-primary" /> Email Address
                    </label>
                  </div>

                  {/* Password Input */}
                  <div className="form-floating mb-4">
                    <input
                      type="password"
                      className="form-control"
                      style={{ height: '50px' }}
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                    <label htmlFor="password" className="d-flex align-items-center">
                      <FaLock className="me-2 text-primary" /> Password
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="d-grid">
                    <button 
                      type="submit" 
                      className="btn btn-primary rounded-pill py-2 btn-sm"
                      style={{ height: '42px' }}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <FaSpinner className="spinner-border spinner-border-sm me-2" size={14} />
                          Registering...
                        </>
                      ) : (
                        'Complete Registration'
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Already have an account link */}
              <div className="card-footer text-center py-3">
                <p className="mb-0">
                  Already have an account?{' '}
                  <button className="btn btn-link text-decoration-none" onClick={() => navigate('/login')}>
                    Click here to login
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

export default TeacherRegister;