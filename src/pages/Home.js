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
                setTimeout(() => setShowCareerHub(true), 300);
            } catch (error) {
                console.error('Home: Auth check failed:', error.message);
                setUser(null);
                setShowCareerHub(false);
            }
        } else {
            setUser(null);
            setShowCareerHub(false);
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

    // Add intersection observer for scroll animations
    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                }
            });
        }, observerOptions);

        if (userSectionRef.current) {
            observer.observe(userSectionRef.current);
        }
        if (careerHubRef.current) {
            observer.observe(careerHubRef.current);
        }

        return () => observer.disconnect();
    }, [user]);

    const handleGenerateOrLogin = async () => {
        if (user) {
            if (user.canGenerate) {
                setIsGenerating(true);
                // Add a small delay for better UX feedback
                setTimeout(() => {
                    navigate('/generate');
                }, 500);
            } else {
                // Enhanced alert with better styling (you could replace with a modal)
                alert('You have reached the maximum of 3 profile generations.');
            }
        } else {
            const githubAuthUrl = apiService.getGithubAuthUrl(includePrivate);
            window.location.href = githubAuthUrl;
        }
    };

    const handleLogout = () => {
        // Add smooth transition effect
        if (userSectionRef.current) {
            userSectionRef.current.style.transform = 'translateY(-20px)';
            userSectionRef.current.style.opacity = '0';
        }
        
        setTimeout(() => {
            localStorage.removeItem('auth_token');
            setUser(null);
            setShowCareerHub(false);
        }, 300);
    };

    const handleNavigation = (path) => {
        // Add loading state for navigation
        setTimeout(() => navigate(path), 150);
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loading">
                    Loading your profile...
                    <div className="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container home-page-container">
            <h1 className="page-title">Cofounder Profile Generator</h1>

            {user ? (
                // --- ENHANCED LOGGED-IN USER VIEW ---
                <>
                    {/* --- Enhanced User Welcome Section --- */}
                    <div 
                        ref={userSectionRef}
                        className="user-section section-block fade-in-up"
                        style={{ animationDelay: '0.1s' }}
                    >
                        <div className="user-info">
                            {user.user && user.user.avatar_url && (
                                <img 
                                    src={user.user.avatar_url} 
                                    alt="Avatar" 
                                    className="user-avatar"
                                    loading="lazy"
                                />
                            )}
                            <div className="user-details">
                                <h3>Welcome back, {user.user?.username || 'User'}!</h3>
                                <div className="user-stats">
                                    <span className="generation-count">
                                        Generations used: <strong>{user.generationCount !== undefined ? user.generationCount : 'N/A'}/3</strong>
                                    </span>
                                    {user.hasSavedProfile && (
                                        <p className="saved-indicator">
                                            <span className="checkmark">✓</span>
                                            You have a saved profile
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="action-buttons">
                            {user.canGenerate ? (
                                <button 
                                    onClick={handleGenerateOrLogin} 
                                    className={`primary-button ${isGenerating ? 'disabled-button' : ''}`}
                                    disabled={isGenerating}
                                >
                                    {isGenerating ? (
                                        <>
                                            <span className="loading-spinner"></span>
                                            Generating...
                                        </>
                                    ) : (
                                        'Generate New Profile'
                                    )}
                                </button>
                            ) : (
                                <button disabled className="disabled-button">
                                    <span className="disabled-icon">🚫</span>
                                    Generation Limit Reached
                                </button>
                            )}
                            
                            {user.hasSavedProfile && (
                                <button 
                                    onClick={() => handleNavigation('/profile')} 
                                    className="secondary-button"
                                >
                                    <span className="button-icon">👤</span>
                                    Your Profile
                                </button>
                            )}
                            
                            <button onClick={handleLogout} className="logout-button">
                                <span className="button-icon">🚪</span>
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* --- ENHANCED CAREER HUB SECTION --- */}
                    <section 
                        ref={careerHubRef}
                        className={`career-hub-section section-block ${showCareerHub ? 'fade-in-up' : ''}`}
                        style={{ 
                            animationDelay: '0.3s',
                            opacity: showCareerHub ? 1 : 0,
                            transform: showCareerHub ? 'translateY(0)' : 'translateY(30px)',
                            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    >
                        <div className="hub-header">
                            <h2>
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
                        
                        <div className="hub-features">
                            <div className="feature-item">
                                <span className="feature-icon">🎯</span>
                                <span>Smart Job Matching</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">📊</span>
                                <span>Match Score Analysis</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">⚡</span>
                                <span>Instant Results</span>
                            </div>
                        </div>
                        
                        <div className="hub-actions">
                            <Link 
                                to="/matcher" 
                                className="primary-button hub-button"
                                style={{ animationDelay: '0.5s' }}
                            >
                                <span className="button-icon">🔍</span>
                                AI Job Finder
                            </Link>
                            <Link 
                                to="/jobs" 
                                className="secondary-button hub-button"
                                style={{ animationDelay: '0.6s' }}
                            >
                                <span className="button-icon">📋</span>
                                Browse Job Board
                            </Link>
                        </div>
                    </section>
                </>
            ) : (
                // --- ENHANCED LOGGED-OUT VISITOR VIEW ---
                <div className="auth-section fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <div className="auth-welcome">
                        <h2>Get Started</h2>
                        <p>Connect your GitHub account to generate your professional cofounder profile and discover career opportunities.</p>
                    </div>
                    
                    <button 
                        onClick={handleGenerateOrLogin} 
                        className="auth-login-button"
                    >
                        <span className="github-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                        </span>
                        Login with GitHub & Generate Profile
                    </button>
                    
                    <label className="auth-checkbox-label">
                        <input
                            type="checkbox"
                            checked={includePrivate}
                            onChange={() => setIncludePrivate(p => !p)}
                        />
                        <span className="checkmark-custom"></span>
                        Include private repositories data (optional)
                    </label>
                    
                    <div className="auth-benefits">
                        <div className="benefit-item">
                            <span className="benefit-icon">⚡</span>
                            <span>Instant profile generation</span>
                        </div>
                        <div className="benefit-item">
                            <span className="benefit-icon">🔒</span>
                            <span>Secure GitHub integration</span>
                        </div>
                        <div className="benefit-item">
                            <span className="benefit-icon">🎯</span>
                            <span>AI-powered job matching</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
