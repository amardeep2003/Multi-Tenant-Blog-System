import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          📝 Multi-Tenant Blog
        </Link>
        
        {user && (
          <>
            <div className="navbar-nav">
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
                🏠 Dashboard
              </Link>
              {user.role === 'admin' && (
                <>
                  <Link to="/tenants" className={`nav-link ${isActive('/tenants')}`}>
                    🏢 Tenants
                  </Link>
                  <Link to="/users" className={`nav-link ${isActive('/users')}`}>
                    👥 Users
                  </Link>
                </>
              )}
              <Link to="/posts" className={`nav-link ${isActive('/posts')}`}>
                📄 Posts
              </Link>
            </div>

            <div className="navbar-right">
              <button 
                onClick={toggleTheme} 
                className="theme-toggle"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              
              <div className="navbar-user">
                <div className="user-info">
                  <div className="user-name">{user.name}</div>
                  <div className="user-meta">{user.role} • {user.tenant?.name}</div>
                </div>
                <button onClick={logout} className="btn-logout">
                  Logout
                </button>
              </div>
            </div>
          </>
        )}
        
        {!user && (
          <button 
            onClick={toggleTheme} 
            className="theme-toggle"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;