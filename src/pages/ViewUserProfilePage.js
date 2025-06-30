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
                const [profileData, currentUserData] = await Promise.all([
                    apiService.getUserPublicProfile(userId),
                    apiService.getUser()
                ]);

                // --- Root Cause Fix: Normalize User Data Structures ---
                // The API returns 'user.id' for the current user but 'user.user_id' for the viewed user.
                // We normalize both objects to use a consistent 'id' property.

                if (currentUserData && currentUserData.user) {
                    setCurrentUser({ ...currentUserData.user, id: currentUserData.user.id });
                } else {
                    throw new Error("Could not identify the current user.");
                }

                if (profileData && profileData.user) {
                    setViewedUser({ ...profileData.user, id: profileData.user.user_id });
                    setProfile(profileData.profile || null);
                    if (!profileData.profile) {
                        setError("This user hasn't created a co-founder profile yet.");
                    }
                } else {
                    throw new Error("User profile not found or data is malformed.");
                }
                
                // Now that data is normalized, we can perform reliable checks.
                const isOwnProfile = String(currentUserData.user.id) === String(userId);

                if (!isOwnProfile) {
                    try {
                        const statusData = await apiService.getConnectionStatus(userId);
                        setConnectionStatus(statusData.status);
                    } catch (statusError) {
                        console.error("Non-critical error: Failed to fetch connection status.", statusError);
                    }
                }

            } catch (mainError) {
                console.error("A critical error occurred while loading the profile page:", mainError);
                setError(mainError.response?.data?.error || mainError.message || "Failed to load user profile.");
                setViewedUser(null);
                setProfile(null);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();

    }, [userId, navigate]);

    const handleSendConnectionRequest = async () => {
        // Use the normalized 'id' property for consistency
        if (!viewedUser || !viewedUser.id) return;
        setIsSendingRequest(true);
        try {
            const response = await apiService.sendConnectionRequest(viewedUser.id);
            alert(response.message || "Connection request sent!");
            setConnectionStatus('pending');
        } catch (error) {
            alert(`Error: ${error.response?.data?.error || error.message}`);
        } finally {
            setIsSendingRequest(false);
        }
    };

    if (loading) {
        return <div className="container"><div className="loading">Loading user profile...</div></div>;
    }

    if (!viewedUser) {
        return (
            <div className="container error-container">
                <div className="error-message">{error || "Could not load user profile."}</div>
                <Link to="/profile" className="secondary-button">Back to My Profile</Link>
            </div>
        );
    }

    if (!profile) {
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
    
    const { personal, technical } = profile;
    // This check is now robust because both objects are guaranteed to have an 'id' property.
    const isOwnProfile = currentUser?.id && viewedUser?.id && String(currentUser.id) === String(viewedUser.id);

    return (
        <div className="container profile-page-container">
            <div style={{ marginBottom: 'var(--spacing)' }}>
                <Link to="/profile" className="secondary-button">&larr; Back to My Profile & Suggestions</Link>
            </div>

            <div className="profile-header-section">
                <h1>{viewedUser.github_username}'s Profile</h1>
                {!isOwnProfile && connectionStatus === null && (
                    <button onClick={handleSendConnectionRequest} className="primary-button" disabled={isSendingRequest}>
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
                    {/* Render other components */}
                </>
            ) : null}
        </div>
    );
}

