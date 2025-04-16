import React, { useState } from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { Calendar, FileType } from 'lucide-react';
import './css/Search.css';

const Search = ({ onSearch, onFilterChange }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    fileType: 'all',
  });

  const handleSearchChange = (e) => {
    onSearch(e.target.value, filters);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="search-wrapper">
      <div className="search-container">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search materials, files, or topics..." 
            className="search-input"
            onChange={handleSearchChange}
          />
          <button 
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter />
          </button>
        </div>
        
        {showFilters && (
          <div className="filter-panel">
            <div className="filter-section">
              <Calendar className="filter-icon" />
              <select 
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                value={filters.dateRange}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            <div className="filter-section">
              <FileType className="filter-icon" />
              <select 
                onChange={(e) => handleFilterChange('fileType', e.target.value)}
                value={filters.fileType}
              >
                <option value="all">All Files</option>
                <option value="pdf">PDF</option>
                <option value="doc">Documents</option>
                <option value="ppt">Presentations</option>
                <option value="media">Media</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;