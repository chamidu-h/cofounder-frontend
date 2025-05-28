// src/pages/Home.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService'; // USE THIS

export default function Home() {
    const [includePrivate, setIncludePrivate] = useState(false);
    const [user, setUser] = useState(null); // Holds { user, generationCount, hasSavedProfile, canGenerate }
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const checkAuthStatus = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        if (token) {
            try {
                const userDataFromApi = await apiService.getUser();
                setUser(userDataFromApi);
            } catch (error) {
                console.error('Home: Auth check failed:', error.message);
                // Token might be invalid/expired, apiService interceptor should handle removal.
                // We ensure user state is cleared here.
                setUser(null);
                if (!error.response || (error.response.status !== 401 && error.response.status !== 403)) {
                  // Only alert if it's not an auth error handled by interceptor (which redirects)
                  // alert("Could not verify your session. Please try logging in again.");
                }
            }
        } else {
            setUser(null);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    useEffect(() => {
        const handleFocusOrLogin = () => checkAuthStatus();
        window.addEventListener('focus', handleFocusOrLogin);
        window.addEventListener('loggedIn', handleFocusOrLogin); // Listen for custom event from OAuthCallback

        return () => {
            window.removeEventListener('focus', handleFocusOrLogin);
            window.removeEventListener('loggedIn', handleFocusOrLogin);
        };
    }, [checkAuthStatus]);

    const handleGenerateOrLogin = () => {
        if (user) {
            if (user.canGenerate) {
                navigate('/generate');
            } else {
                alert('You have reached the maximum of 3 profile generations.');
            }
        } else {
            const githubAuthUrl = apiService.getGithubAuthUrl(includePrivate);
            window.location.href = githubAuthUrl;
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        setUser(null);
        // No navigation needed as we are on the home page, it will re-render.
    };

    if (loading) {
        return <div className="container"><div className="loading">Loading...</div></div>;
    }

    return (
        <div className="container">
            <h1>Cofounder Profile Generator</h1>
            {user ? (
                <div className="user-section">
                    <div className="user-info">
                        {user.user && user.user.avatar_url && (
                           <img src={user.user.avatar_url} alt="Avatar" className="user-avatar" />
                        )}
                        <div>
                            <h3>Welcome, {user.user?.username || 'User'}!</h3>
                            <p>Generations used: {user.generationCount !== undefined ? user.generationCount : 'N/A'}/3</p>
                            {user.hasSavedProfile && (
                                <p className="saved-indicator">✓ You have a saved profile</p>
                            )}
                        </div>
                    </div>
                    <div className="action-buttons">
                        {user.canGenerate ? (
                            <button onClick={() => navigate('/generate')} className="primary-button">
                                Generate New Profile
                            </button>
                        ) : (
                            <button disabled className="disabled-button">
                                Generation Limit Reached
                            </button>
                        )}
                        {user.hasSavedProfile && (
                            <button onClick={() => navigate('/profile')} className="secondary-button">
                                View Saved Profile
                            </button>
                        )}
                        <button onClick={handleLogout} className="logout-button">
                            Logout
                        </button>
                    </div>
                </div>
            ) : (
                <div className="auth-section">
                    <label>
                        <input
                            type="checkbox"
                            checked={includePrivate}
                            onChange={() => setIncludePrivate(p => !p)}
                        />
                        Include private repositories data for profile generation
                    </label>
                    <button onClick={handleGenerateOrLogin} className="primary-button">
                        Login with GitHub & Generate Profile
                    </button>
                </div>
            )}
        </div>
    );
}
