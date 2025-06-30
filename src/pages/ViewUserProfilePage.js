import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiService from '../services/apiService';
import ProfileHeader from '../components/ProfileHeader';
import Overview from '../components/Overview';
import TagList from '../components/TagList';
import ProjectInsights from '../components/ProjectInsights';
import LanguageStats from '../components/LanguageStats';

export default function ViewUserProfilePage() {
    const { userId } = useParams();
    const navigate = useNavigate();

    const [viewedUser, setViewedUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState(null);
    const [isSendingRequest, setIsSendingRequest] = useState(false);

    // This single useEffect handles all data fetching to prevent race conditions.
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            navigate('/');
            return;
        }

        if (!userId) {
            setLoading(false);
            setError("No user ID provided.");
            return;
        }

        const fetchAllData = async () => {
            setLoading(true);
            setError(null);

            try {
                // Use Promise.all to fetch essential data in parallel.
                const [profileData, currentUserData] = await Promise.all([
                    apiService.getUserPublicProfile(userId),
                    apiService.getUser()
                ]);

                // 1. Process the profile data of the user being viewed.
                if (profileData && profileData.user) {
                    setViewedUser(profileData.user);
                    if (profileData.profile) {
                        setProfile(profileData.profile);
                    } else {
                        setProfile(null);
                        setError("This user hasn't created a co-founder profile yet.");
                    }
                } else {
                    throw new Error("User profile not found or data is malformed.");
                }

                // 2. Set the current user.
                setCurrentUser(currentUserData);

                // 3. After getting both users, check if we need to fetch connection status.
                const isOwnProfile = currentUserData?.user && String(currentUserData.user.id) === String(userId);
                if (!isOwnProfile) {
                    const statusData = await apiService.getConnectionStatus(userId);
                    setConnectionStatus(statusData.status);
                }

            } catch (err) {
                console.error("ViewUserProfilePage: Load data error:", err);
                setError(err.response?.data?.error || err.message || "Failed to load user profile.");
                setViewedUser(null);
                setProfile(null);
            } finally {
                // This now only runs after ALL required API calls are complete.
                setLoading(false);
            }
        };

        fetchAllData();

    }, [userId, navigate]);

    const handleSendConnectionRequest = async () => {
        if (!viewedUser || !viewedUser.user_id) return;
        setIsSendingRequest(true);
        try {
            const response = await apiService.sendConnectionRequest(viewedUser.user_id);
            alert(response.message || "Connection request sent!");
            setConnectionStatus('pending'); // Optimistically update UI
        } catch (error) {
            alert(`Error: ${error.response?.data?.error || error.message}`);
        } finally {
            setIsSendingRequest(false);
        }
    };

    if (loading) {
        return <div className="container"><div className="loading">Loading user profile...</div></div>;
    }

    if (error && !profile) {
        return (
            <div className="container error-container">
                <div className="error-message">{error}</div>
                {viewedUser && <p>Viewing profile for: <strong>{viewedUser.github_username}</strong></p>}
                <Link to="/profile" className="secondary-button">Back to My Profile</Link>
            </div>
        );
    }
    
    if (viewedUser && !profile) {
        return (
            <div className="container info-message-container">
                <ProfileHeader 
                    name={viewedUser.github_username || "User"}
                    avatar_url={viewedUser.github_avatar_url}
                    html_url={viewedUser.github_profile_url}
                    headline="Profile Not Created"
                />
                <div className="info-message">{error || "This user has not created a co-founder profile yet."}</div>
                <Link to="/profile" className="secondary-button">Back to My Profile</Link>
            </div>
        );
    }

    if (!viewedUser || !profile) {
        return (
            <div className="container info-message-container">
                <div className="info-message">Could not load user profile.</div>
                <Link to="/profile" className="secondary-button">Back to My Profile</Link>
            </div>
        );
    }

    const { personal, technical } = profile;
    const isOwnProfile = currentUser?.user && String(currentUser.user.id) === String(viewedUser.user_id);

    return (
        <div className="container profile-page-container">
            <div style={{ marginBottom: 'var(--spacing)' }}>
                <Link to="/profile" className="secondary-button">&larr; Back to My Profile & Suggestions</Link>
            </div>

            <div className="profile-header-section">
                <h1>{viewedUser.github_username}'s Profile</h1>
                {!isOwnProfile && connectionStatus === null && (
                    <button 
                        onClick={handleSendConnectionRequest} 
                        className="primary-button"
                        disabled={isSendingRequest}
                    >
                        {isSendingRequest ? 'Sending...' : 'Send Connection Request'}
                    </button>
                )}
                {!isOwnProfile && connectionStatus === 'pending' && (
                    <button className="disabled-button" disabled>Request Sent</button>
                )}
                {!isOwnProfile && connectionStatus === 'accepted' && (
                    <button className="disabled-button" disabled>Connected</button>
                )}
            </div>

            <ProfileHeader
                name={personal?.name || viewedUser.github_username || 'N/A'}
                avatar_url={personal?.avatar_url || viewedUser.github_avatar_url}
                html_url={personal?.html_url || viewedUser.github_profile_url}
                headline={technical?.headline || 'N/A'}
            />
            
            {personal && technical ? (
                <>
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
                </>
            ) : (
                <div className="info-message section-block">This user has shared basic GitHub information but has not generated a detailed co-founder profile.</div>
            )}
        </div>
    );
}
