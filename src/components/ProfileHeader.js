// src/components/ProfileHeader.js
import React, { useState, useRef, useEffect } from 'react';

// Enhanced GitHub Icon SVG component with animation
const GitHubIcon = ({ className = "" }) => (
  <svg
    viewBox="0 0 16 16"
    fill="currentColor"
    height="1em"
    width="1em"
    className={`github-icon ${className}`}
    style={{ 
      marginRight: '0.4em', 
      verticalAlign: 'text-bottom',
      transition: 'transform 0.2s ease'
    }}
  >
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
  </svg>
);

export default function ProfileHeader({ name, avatar_url, html_url, headline }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    // Trigger entrance animation
    if (headerRef.current) {
      headerRef.current.style.opacity = '0';
      headerRef.current.style.transform = 'translateY(20px)';
      
      const timer = setTimeout(() => {
        headerRef.current.style.opacity = '1';
        headerRef.current.style.transform = 'translateY(0)';
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  // Generate initials for fallback
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header 
      ref={headerRef}
      className="profile-header-section"
      style={{
        transition: 'opacity 0.6s ease, transform 0.6s ease'
      }}
    >
      <div className="profile-header-content">
        {/* Avatar Section */}
        <div className="profile-avatar-section">
          <div className="profile-avatar-wrapper">
            {!imageError && avatar_url ? (
              <img 
                src={avatar_url} 
                alt={`${name}'s avatar`} 
                className={`profile-main-avatar ${imageLoaded ? 'loaded' : 'loading'}`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{
                  opacity: imageLoaded ? 1 : 0,
                  transform: imageLoaded ? 'scale(1)' : 'scale(0.9)',
                  transition: 'opacity 0.4s ease, transform 0.4s ease'
                }}
              />
            ) : (
              <div className="profile-avatar-placeholder-main">
                <span className="avatar-initials">
                  {getInitials(name)}
                </span>
              </div>
            )}
            <div 
              className="avatar-status-dot"
              style={{
                animationDelay: '0.8s'
              }}
            ></div>
          </div>
        </div>
        
        {/* Profile Info Section */}
        <div className="profile-info-section">
          <div className="profile-name-container">
            <h1 
              className="profile-name"
              style={{
                opacity: 0,
                transform: 'translateX(-10px)',
                animation: 'slideInLeft 0.6s ease 0.3s forwards'
              }}
            >
              {name || 'Unknown User'}
            </h1>
            
            {html_url && (
              <a 
                href={html_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="github-link-badge"
                style={{
                  opacity: 0,
                  transform: 'translateX(-10px)',
                  animation: 'slideInLeft 0.6s ease 0.5s forwards'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.querySelector('.github-icon').style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.querySelector('.github-icon').style.transform = 'scale(1)';
                }}
              >
                <GitHubIcon />
                GitHub Profile
              </a>
            )}
          </div>
          
          {headline && (
            <p 
              className="profile-headline"
              style={{
                opacity: 0,
                transform: 'translateY(10px)',
                animation: 'fadeInUp 0.6s ease 0.7s forwards'
              }}
            >
              {headline}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
