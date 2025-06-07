// src/pages/ProfileGeneration.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import ProfileHeader from '../components/ProfileHeader';
import Overview from '../components/Overview';
import TagList from '../components/TagList';
import ProjectInsights from '../components/ProjectInsights';
import LanguageStats from '../components/LanguageStats';

export default function ProfileGeneration() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [regenerating, setRegenerating] = useState(false);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [animationTriggered, setAnimationTriggered] = useState(false);
    const navigate = useNavigate();
    const pageRef = useRef(null);

    const performProfileGeneration = useCallback(async (currentUserData, isRegeneration = false) => {
        if (isRegeneration) {
            setRegenerating(true);
        } else {
            setLoading(true);
        }
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
                
                // Trigger animations after profile is set
                setTimeout(() => setAnimationTriggered(true), 300);
            } else {
                throw new Error("Profile data not found in generation response.");
            }
        } catch (err) {
            console.error('ProfileGeneration: Generation error:', err);
            setError(err.message || 'Failed to generate profile.');
        } finally {
            setLoading(false);
            setRegenerating(false);
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
        const token = localStorage.getItem('auth_token');
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
            await apiService.saveProfile(profile);
            alert(user?.hasSavedProfile ? 'Profile updated successfully!' : 'Profile saved successfully!');
            setUser(prevUser => ({ ...prevUser, hasSavedProfile: true }));
            navigate('/profile');
        } catch (err) {
            console.error('ProfileGeneration: Save error:', err);
            alert(err.message || 'Failed to save profile.');
        } finally {
            setSaving(false);
        }
    };

    const handleRegenerate = () => {
        if (user && user.canGenerate) {
            setAnimationTriggered(false);
            performProfileGeneration(user, true);
        } else {
            alert("Cannot generate again. Limit reached or error fetching user status.");
        }
    };

    // Loading state
    if (loading && !profile) {
        return (
            <div className="profile-page-container">
                <div className="profile-loading">
                    <div className="loading-spinner-large"></div>
                    <p>Generating your co-founder profile...</p>
                    <div className="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="profile-page-container">
                <div className="profile-error-state">
                    <div className="error-icon">⚠️</div>
                    <h2>Generation Failed</h2>
                    <p className="error-message">{error}</p>
                    {user && user.generationCount !== undefined && (
                        <p className="generation-info">Generations used: {user.generationCount}/3</p>
                    )}
                    <div className="error-actions">
                        {user?.canGenerate && (
                            <button 
                                onClick={() => fetchUserDataAndGenerate()} 
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                <span className="btn-icon">🔄</span>
                                Try Again
                            </button>
                        )}
                        <button 
                            onClick={() => navigate('/')} 
                            className="btn btn-secondary"
                        >
                            <span className="btn-icon">🏠</span>
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // No profile state
    if (!profile) {
        return (
            <div className="profile-page-container">
                <div className="profile-empty-state">
                    <div className="empty-icon">📄</div>
                    <h2>No Profile Generated</h2>
                    <p>Profile data is not available. Try generating again or go home.</p>
                    <div className="empty-actions">
                        {user?.canGenerate && (
                            <button 
                                onClick={() => fetchUserDataAndGenerate()} 
                                className="btn btn-primary" 
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="btn-spinner"></span>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <span className="btn-icon">✨</span>
                                        Generate Profile
                                    </>
                                )}
                            </button>
                        )}
                        <button 
                            onClick={() => navigate('/')} 
                            className="btn btn-secondary"
                        >
                            <span className="btn-icon">🏠</span>
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    const { personal, technical } = profile;
    if (!personal || !technical) {
        return (
            <div className="profile-page-container">
                <div className="profile-error-state">
                    <div className="error-icon">🔧</div>
                    <h2>Incomplete Profile Data</h2>
                    <p>Generated profile data is incomplete. Please try generating again.</p>
                    <div className="error-actions">
                        <button 
                            onClick={handleRegenerate} 
                            className="btn btn-primary" 
                            disabled={loading || regenerating}
                        >
                            {regenerating ? (
                                <>
                                    <span className="btn-spinner"></span>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <span className="btn-icon">🔄</span>
                                    Try Generate Again
                                </>
                            )}
                        </button>
                        <button 
                            onClick={() => navigate('/')} 
                            className="btn btn-secondary"
                        >
                            <span className="btn-icon">🏠</span>
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div 
            ref={pageRef}
            className={`profile-page-container ${animationTriggered ? 'animate-in' : ''}`}
        >
            {/* Generation Header */}
            <div className="profile-page-header">
                <div className="header-content">
                    <div className="generation-title-section">
                        <h1 className="page-title">Generated Profile</h1>
                        <div className="generation-status">
                            {user && user.generationCount !== undefined && (
                                <div className="generation-counter">
                                    <span className="counter-icon">🎯</span>
                                    <span className="counter-text">Generation {user.generationCount}/3</span>
                                </div>
                            )}
                            {!user?.canGenerate && user?.generationCount >= 3 && (
                                <div className="limit-reached-badge">
                                    <span className="limit-icon">🚫</span>
                                    <span>Limit Reached</span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="header-actions">
                        {user?.canGenerate && (
                            <button 
                                onClick={handleRegenerate} 
                                className={`btn btn-secondary ${regenerating ? 'btn-loading' : ''}`}
                                disabled={loading || regenerating || saving}
                            >
                                {regenerating ? (
                                    <>
                                        <span className="btn-spinner"></span>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <span className="btn-icon">🔄</span>
                                        Generate Again
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Profile Content */}
            <div className="generation-content">
                <ProfileHeader
                    name={personal.name || 'N/A'}
                    avatar_url={personal.avatar_url}
                    html_url={personal.html_url}
                    headline={technical.headline || 'N/A'}
                />
                
                {technical.coFounderSummary && (
                    <Overview text={technical.coFounderSummary} />
                )}
                
                {technical.keyStrengths?.length > 0 && (
                    <TagList title="Key Strengths" tags={technical.keyStrengths} />
                )}
                
                {technical.potentialRoles?.length > 0 && (
                    <TagList title="Potential Roles" tags={technical.potentialRoles} />
                )}
                
                {technical.languageStats && Object.keys(technical.languageStats).length > 0 && (
                    <LanguageStats data={technical.languageStats} />
                )}
                
                {technical.projectInsights?.length > 0 && (
                    <ProjectInsights items={technical.projectInsights} />
                )}
                
                {technical.identifiedTechnologies?.length > 0 && (
                    <TagList title="Technologies" tags={technical.identifiedTechnologies} />
                )}
                
                {technical.architecturalConcepts?.length > 0 && (
                    <TagList title="Architectural Concepts" tags={technical.architecturalConcepts} />
                )}
                
                {technical.estimatedExperience && (
                    <div className="experience-section section-block">
                        <h3>Experience Level</h3>
                        <div className="experience-badge">
                            <span className="experience-icon">🎯</span>
                            <span className="experience-text">{technical.estimatedExperience}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="generation-actions section-block">
                <div className="actions-container">
                    <button 
                        onClick={handleSave} 
                        disabled={saving || loading || regenerating} 
                        className={`btn btn-primary ${saving ? 'btn-loading' : ''}`}
                    >
                        {saving ? (
                            <>
                                <span className="btn-spinner"></span>
                                Saving...
                            </>
                        ) : (
                            <>
                                <span className="btn-icon">💾</span>
                                {user?.hasSavedProfile ? 'Update Saved Profile' : 'Save This Profile'}
                            </>
                        )}
                    </button>
                    
                    <button 
                        onClick={() => navigate('/')} 
                        className="btn btn-secondary" 
                        disabled={saving || loading || regenerating}
                    >
                        <span className="btn-icon">🏠</span>
                        Back to Home
                    </button>
                    
                    {user?.hasSavedProfile && (
                        <button 
                            onClick={() => navigate('/profile')} 
                            className="btn btn-secondary" 
                            disabled={saving || loading || regenerating}
                        >
                            <span className="btn-icon">👤</span>
                            View Saved Profile
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
