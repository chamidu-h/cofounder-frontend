// src/pages/ProfilePage.js
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import ProfileHeader from '../components/ProfileHeader';
import Overview from '../components/Overview';
import TagList from '../components/TagList';
import ProjectInsights from '../components/ProjectInsights';
import LanguageStats from '../components/LanguageStats';

export default function ProfilePage() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);

    // In ProfilePage.js, loadProfileData function:
const loadProfileData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
        const responseData = await apiService.getSavedProfile(); // This should be { profile: { ... } }
        
        // DEBUGGING: Log what responseData actually is
        console.log("ProfilePage responseData:", responseData); 

        if (responseData && responseData.profile) { // This is the key condition
            setProfile(responseData.profile);    
        } else {
            setProfile(null);
            setError("No saved profile data found or the data format is unexpected. You can generate one.");
        }
    } catch (err) {
        // ... error handling ...
        setProfile(null);
    } finally {
        setLoading(false);
    }
}, []);


    useEffect(() => {
        const token = localStorage.getItem('auth_token'); // Corrected
        if (!token) {
            navigate('/');
            return;
        }
        loadProfileData();
    }, [loadProfileData, navigate]);

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete your saved profile? This action cannot be undone.')) {
            return;
        }
        setDeleting(true);
        try {
            // apiService.deleteProfile() now hits DELETE /api/profile/saved
            const response = await apiService.deleteProfile();
            alert(response.message || 'Profile deleted successfully!');
            navigate('/');
        } catch (err) {
            console.error('ProfilePage: Delete error:', err);
            alert(err.message || 'Failed to delete profile. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return <div className="container"><div className="loading">Loading your profile...</div></div>;
    }

    if (error && !profile) {
        return (
            <div className="container error-container">
                <div className="error-message">{error}</div>
                <button onClick={() => navigate('/generate')} className="primary-button" style={{ marginRight: '10px' }}>
                    Generate Profile
                </button>
                <button onClick={() => navigate('/')} className="secondary-button">
                    Back to Home
                </button>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="container info-message-container">
                <div className="info-message">No profile data is available to display.</div>
                 <button onClick={() => navigate('/generate')} className="primary-button" style={{ marginRight: '10px' }}>
                    Generate Profile
                </button>
                <button onClick={() => navigate('/')} className="secondary-button">
                    Back to Home
                </button>
            </div>
        );
    }

    const { personal, technical } = profile;
    if (!personal || !technical) {
        return (
            <div className="container error-container">
                <div className="error-message">Profile data is incomplete.</div>
                <button onClick={() => navigate('/')} className="secondary-button">Back to Home</button>
            </div>
        );
    }

    return (
        <div className="container profile-page-container">
            <div className="profile-header-section section-block">
                <h1>Your Co-founder Profile</h1>
                <div className="profile-actions">
                    <button onClick={() => navigate('/generate')} className="primary-button">
                        Generate New / Update
                    </button>
                    <button onClick={handleDelete} disabled={deleting || loading} className="delete-button">
                        {deleting ? 'Deleting...' : 'Delete This Profile'}
                    </button>
                    <button onClick={() => navigate('/')} className="secondary-button">
                        Back to Home
                    </button>
                </div>
            </div>
            <ProfileHeader
                name={personal.name || 'N/A'}
                avatar_url={personal.avatar_url}
                html_url={personal.html_url}
                headline={technical.headline || 'N/A'}
            />
            {technical.coFounderSummary && <Overview text={technical.coFounderSummary} />}
            {technical.keyStrengths?.length > 0 && <TagList title="Key Strengths" tags={technical.keyStrengths} />}
            {technical.potentialRoles?.length > 0 && <TagList title="Potential Roles" tags={technical.potentialRoles} />}
            {technical.languageStats && Object.keys(technical.languageStats).length > 0 && <LanguageStats data={technical.languageStats} />}
            {technical.projectInsights?.length > 0 && <ProjectInsights items={technical.projectInsights} />}
            {technical.identifiedTechnologies?.length > 0 && <TagList title="Technologies" tags={technical.identifiedTechnologies} />}
            {technical.architecturalConcepts?.length > 0 && <TagList title="Architectural Concepts" tags={technical.architecturalConcepts} />}
            {technical.estimatedExperience && (
                <div className="experience section-block">
                    <strong>Estimated Experience: </strong>{technical.estimatedExperience}
                </div>
            )}
        </div>
    );
}
