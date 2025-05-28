// src/pages/OAuthCallback.js
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function OAuthCallback() {
    const navigate = useNavigate();
    const { search } = useLocation();

    useEffect(() => {
        const urlParams = new URLSearchParams(search);
        const token = urlParams.get('token');
        const error = urlParams.get('error');

        if (error) {
            console.error('OAuthCallback: Error received -', error);
            navigate(`/?error=${encodeURIComponent(error)}`);
            return;
        }

        if (token) {
            localStorage.setItem('auth_token', token);
            window.dispatchEvent(new CustomEvent('loggedIn')); // Dispatch event for Home.js or other components
            console.log("OAuthCallback: Token set, navigating to /");
            navigate('/');
        } else {
            console.error('OAuthCallback: No token found in URL parameters.');
            navigate('/?error=authentication_failed_no_token');
        }
    }, [search, navigate]);

    return (
        <div className="container">
            <div className="loading">Completing authentication, please wait...</div>
        </div>
    );
}
