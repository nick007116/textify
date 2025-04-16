import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../utils/Firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Download, Clock, Book, User } from 'lucide-react';
import Sidebar from './Sidebar';
import './css/Main.css';

const Main = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        try {
          const studentDoc = await getDocs(
            query(collection(db, 'students'), where('email', '==', user?.email))
          );
          if (!studentDoc.empty) {
            const data = studentDoc.docs[0].data();
            setStudentData(data);
            fetchMaterials(data.department, data.course);
          } else {
            console.log("Student data not found in Firestore");
            localStorage.removeItem('student_token');
            sessionStorage.removeItem('student_token');
            navigate('/student-login');
          }
        } catch (error) {
          console.error('Error fetching student data:', error);
          if (error.code === 'permission-denied') {
            localStorage.removeItem('student_token');
            sessionStorage.removeItem('student_token');
            navigate('/student-login');
          }
        } finally {
          setLoading(false);
        }
      } else {
        const token = localStorage.getItem('student_token') || sessionStorage.getItem('student_token');
        if (!token) {
          navigate('/student-login');
        } else {
          navigate('/student-login');
        }
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchMaterials = async (department, course) => {
    try {
      const materialsRef = collection(db, 'materials');
      const q = query(
        materialsRef,
        where('department', '==', department),
        where('course', '==', course)
      );
      const querySnapshot = await getDocs(q);
      const materialsData = [];
      querySnapshot.forEach((doc) => {
        materialsData.push({ id: doc.id, ...doc.data() });
      });
      setMaterials(materialsData);
    } catch (error) {
      console.error('Error fetching materials:', error);
      if (error.code === 'permission-denied') {
        navigate('/student-login');
      }
    }
  };

  const getFileExtension = (filename) => {
    return filename.split('.').pop().toLowerCase();
  };

  const handleDownload = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTitleClick = (title) => {
    // Navigate to the notebook page for this material
    navigate(`/notebook?title=${encodeURIComponent(title)}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <div className="welcome-banner">
          <div className="welcome-content">
            <h1>Welcome back, {studentData?.name}!</h1>
            <p className="welcome-subtitle">
              <Book className="inline-icon" />
              {studentData?.department} - {studentData?.course}
            </p>
          </div>
        </div>

        {/* Display recent uploaded study materials */}
        <div className="materials-section">
          <h2 className="section-title">Recent Uploaded Materials</h2>
          <div className="materials-grid">
            {materials.map((material) => (
              <div
                key={material.id}
                className="material-card"
                onClick={() => handleTitleClick(material.title)}
              >
                <div className="material-card-content">
                  <div className="material-header">
                    <h3 style={{ cursor: 'pointer' }}>{material.title}</h3>
                    <span className="material-date">
                      <Clock className="inline-icon" />
                      {new Date(material.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="material-info">
                    <div className="teacher-info">
                      <User className="inline-icon" />
                      <span>{material.teacherName}</span>
                    </div>
                    <div className="files-container">
                      {material.files.slice(0, 2).map((file, index) => (
                        <div
                          key={`${material.id}-file-${index}`}
                          className="file-item"
                        >
                          <div className="file-details">
                            <Download className="file-icon" />
                            <span className="file-name">{file.name}</span>
                          </div>
                          <button 
                            className="download-btn"
                            onClick={() => handleDownload(file.url, file.name)}
                          >
                            Download
                          </button>
                        </div>
                      ))}
                      {material.files.length > 2 && (
                        <button 
                          className="more-files-btn"
                          onClick={() => handleTitleClick(material.title)}
                        >
                          +{material.files.length - 2} more files
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {materials.length === 0 && (
              <div className="no-materials">
                <Book className="empty-icon" />
                <p>No study materials available yet</p>
                <span>Check back later for updates from your teachers</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;