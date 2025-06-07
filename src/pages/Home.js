// src/pages/Home.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiService from '../services/apiService';

export default function Home() {
    const [includePrivate, setIncludePrivate] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showCareerHub, setShowCareerHub] = useState(false);
    const [animationTriggered, setAnimationTriggered] = useState(false);
    const navigate = useNavigate();
    const userSectionRef = useRef(null);
    const careerHubRef = useRef(null);

    const checkAuthStatus = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        if (token) {
            try {
                const userDataFromApi = await apiService.getUser();
                setUser(userDataFromApi);
                // Trigger career hub animation after user data loads
                setTimeout(() => {
                    setShowCareerHub(true);
                    setAnimationTriggered(true);
                }, 600);
            } catch (error) {
                console.error('Home: Auth check failed:', error.message);
                setUser(null);
                setShowCareerHub(false);
            }
        } else {
            setUser(null);
            setShowCareerHub(false);
            setTimeout(() => setAnimationTriggered(true), 300);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    useEffect(() => {
        const handleFocusOrLogin = () => checkAuthStatus();
        window.addEventListener('focus', handleFocusOrLogin);
        window.addEventListener('loggedIn', handleFocusOrLogin);

        return () => {
            window.removeEventListener('focus', handleFocusOrLogin);
            window.removeEventListener('loggedIn', handleFocusOrLogin);
        };
    }, [checkAuthStatus]);

    const handleGenerateOrLogin = async () => {
        if (user) {
            if (user.canGenerate) {
                setIsGenerating(true);
                setTimeout(() => {
                    navigate('/generate');
                }, 800);
            } else {
                alert('You have reached the maximum of 3 profile generations.');
            }
        } else {
            const githubAuthUrl = apiService.getGithubAuthUrl(includePrivate);
            window.location.href = githubAuthUrl;
        }
    };

    const handleLogout = () => {
        if (userSectionRef.current) {
            userSectionRef.current.style.transform = 'translateY(-20px)';
            userSectionRef.current.style.opacity = '0';
        }
        
        setTimeout(() => {
            localStorage.removeItem('auth_token');
            setUser(null);
            setShowCareerHub(false);
            setAnimationTriggered(false);
        }, 400);
    };

    const handleNavigation = (path) => {
        setTimeout(() => navigate(path), 200);
    };

    if (loading) {
        return (
            <div className="home-container">
                <div className="home-loading">
                    <div className="loading-spinner-large"></div>
                    <p>Loading your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="home-container">
            <div className={`home-content ${animationTriggered ? 'animate-in' : ''}`}>
                <h1 className="home-title">AI Powered Career Hub</h1>

                {user ? (
                    // LOGGED-IN USER VIEW
                    <div className="home-sections">
                        {/* User Profile Section */}
                        <div 
                            ref={userSectionRef}
                            className="user-profile-section"
                        >
                            <div className="profile-card">
                                <div className="profile-header">
                                    <div className="profile-avatar-container">
                                        {user.user && user.user.avatar_url ? (
                                            <img 
                                                src={user.user.avatar_url} 
                                                alt="Profile Avatar" 
                                                className="profile-avatar"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="profile-avatar-placeholder">
                                                <span className="avatar-icon">👤</span>
                                            </div>
                                        )}
                                        <div className="avatar-status-indicator"></div>
                                    </div>
                                    
                                    <div className="profile-info">
                                        <h2 className="profile-welcome">
                                            Welcome back, <span className="username">{user.user?.username || 'User'}</span>!
                                        </h2>
                                        <div className="profile-stats">
                                            <div className="stat-item">
                                                <span className="stat-label">Generations used:</span>
                                                <span className="stat-value">
                                                    {user.generationCount !== undefined ? user.generationCount : 'N/A'}/3
                                                </span>
                                            </div>
                                            {user.hasSavedProfile && (
                                                <div className="saved-profile-indicator">
                                                    <span className="check-icon">✓</span>
                                                    <span>Profile saved</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="profile-actions">
                                    {user.canGenerate ? (
                                        <button 
                                            onClick={handleGenerateOrLogin} 
                                            className={`btn btn-primary ${isGenerating ? 'btn-loading' : ''}`}
                                            disabled={isGenerating}
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <span className="btn-spinner"></span>
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <span className="btn-icon">✨</span>
                                                    Generate New Profile
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <button disabled className="btn btn-disabled">
                                            <span className="btn-icon">🚫</span>
                                            Generation Limit Reached
                                        </button>
                                    )}
                                    
                                    {user.hasSavedProfile && (
                                        <button 
                                            onClick={() => handleNavigation('/profile')} 
                                            className="btn btn-secondary"
                                        >
                                            <span className="btn-icon">👤</span>
                                            View Profile
                                        </button>
                                    )}
                                    
                                    <button onClick={handleLogout} className="btn btn-logout">
                                        <span className="btn-icon">🚪</span>
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Career Hub Section */}
                        <div 
                            ref={careerHubRef}
                            className={`career-hub-section ${showCareerHub ? 'visible' : ''}`}
                        >
                            <div className="hub-card">
                                <div className="hub-header">
                                    <div className="hub-title-container">
                                        <h2 className="hub-title">
                                            <span className="hub-icon">🚀</span>
                                            Career Hub
                                        </h2>
                                        <div className="hub-badge">
                                            <span className="ai-icon">🤖</span>
                                            AI-Powered
                                        </div>
                                    </div>
                                    
                                    <p className="hub-description">
                                        Your career, supercharged by AI. Upload your resume to unlock a prioritized list of jobs where your skills give you the highest chance of getting hired.
                                    </p>
                                </div>
                                
                                <div className="hub-features">
                                    <div className="feature-grid">
                                        <div className="feature-item">
                                            <span className="feature-icon">🎯</span>
                                            <span className="feature-text">Smart Job Matching</span>
                                        </div>
                                        <div className="feature-item">
                                            <span className="feature-icon">📊</span>
                                            <span className="feature-text">Match Score Analysis</span>
                                        </div>
                                        <div className="feature-item">
                                            <span className="feature-icon">⚡</span>
                                            <span className="feature-text">Instant Results</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="hub-actions">
                                    <Link to="/matcher" className="btn btn-primary hub-btn">
                                        <span className="btn-icon">🔍</span>
                                        AI Job Finder
                                    </Link>
                                    <Link to="/jobs" className="btn btn-secondary hub-btn">
                                        <span className="btn-icon">📋</span>
                                        Browse Job Board
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // LOGGED-OUT VISITOR VIEW
                    <div className="auth-section">
                        <div className="auth-card">
                            <div className="auth-header">
                                <h2 className="auth-title">Get Started</h2>
                                <p className="auth-description">
                                    Connect your GitHub account to generate your professional cofounder profile and discover career opportunities.
                                </p>
                            </div>
                            
                            <div className="auth-form">
                                <button 
                                    onClick={handleGenerateOrLogin} 
                                    className="btn btn-github"
                                >
                                    <span className="github-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                        </svg>
                                    </span>
                                    Login with GitHub & Generate Profile
                                </button>
                                
                                <label className="checkbox-container">
                                    <input
                                        type="checkbox"
                                        checked={includePrivate}
                                        onChange={() => setIncludePrivate(p => !p)}
                                        className="checkbox-input"
                                    />
                                    <span className="checkbox-custom"></span>
                                    <span className="checkbox-label">Include private repositories data (optional)</span>
                                </label>
                            </div>
                            
                            <div className="auth-benefits">
                                <div className="benefits-grid">
                                    <div className="benefit-item">
                                        <span className="benefit-icon">⚡</span>
                                        <span className="benefit-text">Instant profile generation</span>
                                    </div>
                                    <div className="benefit-item">
                                        <span className="benefit-icon">🔒</span>
                                        <span className="benefit-text">Secure GitHub integration</span>
                                    </div>
                                    <div className="benefit-item">
                                        <span className="benefit-icon">🎯</span>
                                        <span className="benefit-text">AI-powered job matching</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
