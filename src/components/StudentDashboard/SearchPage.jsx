import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Search from './Search';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../utils/Firebase';
import { Download, Clock, Book, User } from 'lucide-react';
import './css/Main.css'; // reusing styles from Main.css
import { useNavigate } from 'react-router-dom';

const SearchPage = () => {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    dateRange: 'all',
    fileType: 'all',
  });
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); // New state
  const navigate = useNavigate();

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const materialsRef = collection(db, 'materials');
      const querySnapshot = await getDocs(materialsRef);
      const materialsData = [];
      querySnapshot.forEach((doc) => {
        materialsData.push({ id: doc.id, ...doc.data() });
      });
      setMaterials(materialsData);
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  useEffect(() => {
    const filterMaterials = () => {
      const term = searchTerm.toLowerCase();
      const filtered = materials.filter(material => {
        const titleMatch = material.title.toLowerCase().includes(term);
        const fileMatch = material.files?.some(file => file.name.toLowerCase().includes(term)) || false;

        return titleMatch || fileMatch;
      });
      setFilteredMaterials(filtered);
    };

    if (searchTerm.trim() === "") {
      setFilteredMaterials([]);
      setHasSearched(false);
    }
    else {
      setHasSearched(true);
      filterMaterials();
    }
  }, [searchTerm, filters, materials]);

  const handleTitleClick = (title) => {
    navigate(`/notebook?title=${encodeURIComponent(title)}`);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <div style={{ padding: '20px' }}>
          <Search
            onSearch={handleSearch} // Use handleSearch
            onFilterChange={(filterValues) => {
              setFilters(filterValues);
            }}
          />
        </div>
        <div className="materials-section">
          <h2 className="section-title">Search Results</h2>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="materials-grid">
              {hasSearched ? (
                filteredMaterials.length > 0 ? (
                  filteredMaterials.map((material) => (
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
                            {material.files?.slice(0, 2).map((file, index) => (
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
                                  onClick={() => window.open(file.url, '_blank')}
                                >
                                  Download
                                </button>
                              </div>
                            ))}
                            {material.files?.length > 2 && (
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
                  ))
                ) : (
                  <div className="no-materials">
                    <Book className="empty-icon" />
                    <p>No matching study materials found</p>
                  </div>
                )
              ) : (
                <div className="no-materials">
                  <Book className="empty-icon" />
                  <p>Enter a search term to find study materials</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;