import React from 'react';
import { 
  FaFile, 
  FaFilePdf, 
  FaFileWord, 
  FaFilePowerpoint, 
  FaFileExcel, 
  FaFileImage, 
  FaFileAudio, 
  FaFileVideo,
  FaArrowLeft // Import the back arrow icon
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Sidenav = ({ title, files, isOpen }) => {
  const navigate = useNavigate(); // Initialize useNavigate

  const truncateFileName = (fileName, maxLength = 20) => {
    if (fileName.length <= maxLength) return fileName;
    
    const ext = fileName.split('.').pop();
    const nameWithoutExt = fileName.slice(0, fileName.lastIndexOf('.'));
    const truncatedName = nameWithoutExt.slice(0, maxLength - ext.length - 3);
    
    return `${truncatedName}...${ext}`;
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    switch (ext) {
      // Documents
      case 'pdf':
        return <FaFilePdf className="sidebar-item-icon" />;
      case 'doc':
      case 'docx':
        return <FaFileWord className="sidebar-item-icon" />;
      case 'ppt':
      case 'pptx':
        return <FaFilePowerpoint className="sidebar-item-icon" />;
      case 'xls':
      case 'xlsx':
        return <FaFileExcel className="sidebar-item-icon" />;
      
      // Images
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
        return <FaFileImage className="sidebar-item-icon" />;
      
      // Audio
      case 'mp3':
      case 'wav':
      case 'ogg':
        return <FaFileAudio className="sidebar-item-icon" />;
      
      // Video
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'wmv':
        return <FaFileVideo className="sidebar-item-icon" />;
      
      default:
        return <FaFile className="sidebar-item-icon" />;
    }
  };

  const handleFileClick = (file) => {
    // Open file in a new tab or handle preview
    if (file.url) {
      window.open(file.url, '_blank');
    }
  };

  const handleBackClick = () => {
    navigate('/student-dashboard'); // Navigate back to the dashboard
  };

  return (
    <>
      <button className="back-button" onClick={handleBackClick}>
        <FaArrowLeft />
      </button>
      <div className="sidenav-container">
        {isOpen && (
          <h3 className="sidebar-title mb-4">
            {truncateFileName(title, 30)}
          </h3>
        )}
        
        <div className="sidebar-files">
          {files.map((file, index) => (
            <div 
              key={index} 
              className="sidebar-item"
              onClick={() => handleFileClick(file)}
              title={file.name}
            >
              {getFileIcon(file.name)}
              {isOpen && (
                <span className="file-name">
                  {truncateFileName(file.name)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidenav;