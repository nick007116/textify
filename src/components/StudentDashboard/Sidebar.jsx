import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { auth } from '../../utils/Firebase';
import { 
  FaHome,
  FaClock,
  FaBars,
  FaSearch,
  FaSignOutAlt 
} from 'react-icons/fa';
import './css/Sidebar.css';

const Sidebar = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isExpanded, setIsExpanded] = useState(window.innerWidth > 768);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setIsExpanded(mobile ? false : true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('student_token');
      sessionStorage.removeItem('student_token');
      navigate('/student-login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleSidebar = () => {
    setIsExpanded(prev => !prev);
  };

  const navLinks = [
    {
      path: '/student-dashboard',
      icon: <FaHome className="nav-icon" />,
      text: 'Home'
    },
    {
      path: '/recentvisit',
      icon: <FaClock className="nav-icon" />,
      text: 'Recent'
    },
    {
      path: '/search',
      icon: <FaSearch className="nav-icon" />,
      text: 'Search'
    }
  ];

  return (
    <>
      <button 
        className="toggle-btn" 
        onClick={toggleSidebar}
        aria-label="Toggle Sidebar"
      >
        <FaBars />
      </button>

      {isMobile && (
        <div 
          className={`sidebar-overlay ${isExpanded ? 'visible' : ''}`}
          onClick={() => setIsExpanded(false)}
        />
      )}

      <div className={`sidebar ${isMobile ? (isExpanded ? 'visible' : '') : (isExpanded ? 'expanded' : 'collapsed')}`}>
        <nav className="sidebar-nav">
          <ul>
            {navLinks.map((link) => (
              <li key={link.path}>
                <NavLink 
                  to={link.path}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  {link.icon}
                  <span className="nav-text">{link.text}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="sidebar-logout" onClick={handleLogout}>
          <FaSignOutAlt className="nav-icon" />
          <span className="nav-text">Logout</span>
        </div>
      </div>
    </>
  );
};

export default Sidebar;