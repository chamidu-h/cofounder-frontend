// src/pages/ProfileGeneration.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import ProfileHeader from '../components/ProfileHeader'; // Assuming these components exist
import Overview from '../components/Overview';
import TagList from '../components/TagList';
import ProjectInsights from '../components/ProjectInsights';
import LanguageStats from '../components/LanguageStats';

export default function ProfileGeneration() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const performProfileGeneration = useCallback(async (currentUserData) => {
        setLoading(true);
        setError(null);
        try {
            const generatedData = await apiService.generateProfile();
            if (generatedData && generatedData.profile) {
                setProfile(generatedData.profile);
                setUser(prevUser => ({
                    ...prevUser,
                    generationCount: generatedData.newGenerationCount !== undefined 
                                     ? generatedData.newGenerationCount 
                                     : (prevUser ? prevUser.generationCount + 1 : 1),
                    canGenerate: generatedData.newGenerationCount !== undefined
                                 ? generatedData.newGenerationCount < 3
                                 : (currentUserData.generationCount + 1 < 3),
                    hasSavedProfile: generatedData.autoSaved ? true : (prevUser ? prevUser.hasSavedProfile : false)
                }));
                if (generatedData.autoSaved) {
                    alert('This was your 3rd generation - profile has been automatically saved!');
                }
            } else {
                throw new Error("Profile data not found in generation response.");
            }
        } catch (err) {
            console.error('ProfileGeneration: Generation error:', err);
            setError(err.message || 'Failed to generate profile.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUserDataAndGenerate = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const userDataFromApi = await apiService.getUser();
            setUser(userDataFromApi);
            if (!userDataFromApi || !userDataFromApi.canGenerate) {
                setError(userDataFromApi ? 'Generation limit reached or you are not allowed to generate.' : 'Could not fetch user data.');
                setLoading(false);
                return;
            }
            await performProfileGeneration(userDataFromApi);
        } catch (err) {
            console.error('ProfileGeneration: Initial fetch/generate error:', err);
            setError(err.message || 'An error occurred.');
            setLoading(false);
        }
    }, [performProfileGeneration]);

    useEffect(() => {
        const token = localStorage.getItem('auth_token'); // Corrected
        if (!token) {
            navigate('/');
            return;
        }
        fetchUserDataAndGenerate();
    }, [fetchUserDataAndGenerate, navigate]);

    const handleSave = async () => {
        if (!profile) {
            alert('No profile data to save.');
            return;
        }
        setSaving(true);
        try {
            await apiService.saveProfile(profile); // apiService now handles wrapping with {profileData: profile}
            alert(user?.hasSavedProfile ? 'Profile updated successfully!' : 'Profile saved successfully!');
            setUser(prevUser => ({ ...prevUser, hasSavedProfile: true }));
            navigate('/profile'); // Navigate to the main profile display page
        } catch (err) {
            console.error('ProfileGeneration: Save error:', err);
            alert(err.message || 'Failed to save profile.');
        } finally {
            setSaving(false);
        }
    };

    const handleRegenerate = () => {
        if (user && user.canGenerate) {
            performProfileGeneration(user);
        } else {
            alert("Cannot generate again. Limit reached or error fetching user status.");
        }
    };

    if (loading && !profile) {
        return <div className="container"><div className="loading">Generating your co-founder profile...</div></div>;
    }

    if (error) {
        return (
            <div className="container error-container">
                <div className="error-message">{error}</div>
                <button onClick={() => navigate('/')} className="secondary-button">Back to Home</button>
                {user && user.generationCount !== undefined && (<p>Generations used: {user.generationCount}/3</p>)}
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="container info-message-container">
                <div className="info-message">Profile data is not available. Try generating again or go home.</div>
                {user?.canGenerate && (
                    <button onClick={handleRegenerate} className="primary-button" disabled={loading} style={{marginRight: '10px'}}>
                        {loading ? 'Generating...' : 'Generate Profile'}
                    </button>
                )}
                <button onClick={() => navigate('/')} className="secondary-button">Back to Home</button>
            </div>
        );
    }
    
    const { personal, technical } = profile;
    if (!personal || !technical) {
         return (
            <div className="container error-container">
                <div className="error-message">Generated profile data is incomplete. Please try generating again.</div>
                <button onClick={handleRegenerate} className="primary-button" disabled={loading} style={{marginRight: '10px'}}>
                    {loading ? 'Generating...' : 'Try Generate Again'}
                </button>
                <button onClick={() => navigate('/')} className="secondary-button">Back to Home</button>
            </div>
        );
    }

    return (
        <div className="container profile-page-container">
            <div className="generation-header section-block">
                <h1>Generated Profile</h1>
                <div className="generation-info">
                    {user && user.generationCount !== undefined && (
                        <span>Generation {user.generationCount}/3</span>
                    )}
                    {user?.canGenerate && (
                        <button onClick={handleRegenerate} className="secondary-button" disabled={loading}>
                            {loading ? 'Generating...' : 'Generate Again'}
                        </button>
                    )}
                     {!user?.canGenerate && user?.generationCount >=3 && (
                        <span style={{marginLeft: '10px', color: 'orange'}}>Limit Reached</span>
                    )}
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
            {technical.languageStats && Object.keys(technical.languageStats).length > 0 &&<LanguageStats data={technical.languageStats} />}
            {technical.projectInsights?.length > 0 && <ProjectInsights items={technical.projectInsights} />}
            {technical.identifiedTechnologies?.length > 0 && <TagList title="Technologies" tags={technical.identifiedTechnologies} />}
            {technical.architecturalConcepts?.length > 0 && <TagList title="Architectural Concepts" tags={technical.architecturalConcepts} />}
            {technical.estimatedExperience && (
                <div className="experience section-block">
                    <strong>Estimated Experience: </strong>{technical.estimatedExperience}
                </div>
            )}
            <div className="profile-actions section-block">
                <button onClick={handleSave} disabled={saving || loading} className="primary-button">
                    {saving ? 'Saving...' : user?.hasSavedProfile ? 'Update Saved Profile' : 'Save This Profile'}
                </button>
                <button onClick={() => navigate('/')} className="secondary-button" disabled={saving || loading}>
                    Back to Home
                </button>
            </div>
        </div>
    );
}
