// src/pages/Home.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';

export default function Home() {
    const [includePrivate, setIncludePrivate] = useState(false); // Default to false
    const [user, setUser] = useState(null);
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
                setUser(null);
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
        window.addEventListener('loggedIn', handleFocusOrLogin);

        return () => {
            window.removeEventListener('focus', handleFocusOrLogin);
            window.removeEventListener('loggedIn', handleFocusOrLogin);
        };
    }, [checkAuthStatus]);

    const handleGenerateOrLogin = () => {
        if (user) { // This part is for when the user is already logged in.
            if (user.canGenerate) {
                navigate('/generate');
            } else {
                alert('You have reached the maximum of 3 profile generations.');
            }
        } else { // This is for when the user is NOT logged in (auth-section is shown)
            const githubAuthUrl = apiService.getGithubAuthUrl(includePrivate);
            window.location.href = githubAuthUrl;
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        setUser(null);
    };

    if (loading) {
        return <div className="container"><div className="loading">Loading...</div></div>;
    }

    return (
        <div className="container">
            {/* The h1 was previously not given a class, adding page-title for consistency with CSS */}
            <h1 className="page-title">Cofounder Profile Generator</h1> 
            
            {user ? (
                // Logged-in user view
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
                                Your Profile
                            </button>
                        )}
                        <button onClick={handleLogout} className="logout-button">
                            Logout
                        </button>
                    </div>
                </div>
            ) : (
                // Not logged-in view (Login Page) - CORRECTED ORDER
                <div className="auth-section">
                    <button onClick={handleGenerateOrLogin} className="auth-login-button">
                        Login with GitHub & Generate Profile
                    </button>
                    <label className="auth-checkbox-label">
                        <input
                            type="checkbox"
                            checked={includePrivate}
                            onChange={() => setIncludePrivate(p => !p)}
                        />
                        Include private repositories data (optional)
                    </label>
                </div>
            )}
        </div>
    );
}
