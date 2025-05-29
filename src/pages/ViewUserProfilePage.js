// src/pages/ViewUserProfilePage.js
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Link for "Back"
import apiService from '../services/apiService';
import ProfileHeader from '../components/ProfileHeader';
import Overview from '../components/Overview';
import TagList from '../components/TagList';
import ProjectInsights from '../components/ProjectInsights';
import LanguageStats from '../components/LanguageStats';
// You might want a button component here for "Send Connection Request"

export default function ViewUserProfilePage() {
    const { userId } = useParams(); // Get userId from URL parameter
    const navigate = useNavigate();

    const [viewedUser, setViewedUser] = useState(null); // For basic info like username, avatar
    const [profile, setProfile] = useState(null); // For the detailed co-founder profile
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Optional: Fetch current user's connection status with this viewed user
    const [currentUser, setCurrentUser] = useState(null); // To know who is viewing
    const [connectionStatus, setConnectionStatus] = useState(null); // e.g., null, 'pending', 'accepted'
    const [isSendingRequest, setIsSendingRequest] = useState(false);

    const loadViewedUserProfile = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const responseData = await apiService.getUserPublicProfile(userId);
            console.log("ViewUserProfilePage responseData:", responseData);
            if (responseData && responseData.profile && responseData.user) {
                setViewedUser(responseData.user);
                setProfile(responseData.profile);
            } else if (responseData && responseData.user && !responseData.profile) {
                // User exists but has no co-founder profile
                setViewedUser(responseData.user);
                setProfile(null);
                setError(responseData.error || "This user hasn't created a co-founder profile yet.");
            } else {
                setError("User profile not found or data is malformed.");
                setViewedUser(null);
                setProfile(null);
            }
        } catch (err) {
            console.error("ViewUserProfilePage: Load profile error:", err);
            setError(err.response?.data?.error || err.message || "Failed to load user profile.");
            setViewedUser(null);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    }, [userId]);
    
    const fetchCurrentUserAndConnectionStatus = useCallback(async () => {
        if (!userId) return;
        try {
            const me = await apiService.getUser(); // Get current logged-in user
            setCurrentUser(me);
            if (me && me.user && String(me.user.id) !== String(userId)) { // Don't check status if viewing own profile
                const status = await apiService.getConnectionStatus(me.user.id, userId); // You'll need to add getConnectionStatus to apiService
                setConnectionStatus(status);
            }
        } catch (err) {
            console.error("Error fetching current user or connection status:", err);
        }
    }, [userId]);


    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            navigate('/'); // Redirect to home if not logged in
            return;
        }
        if (userId) {
            loadViewedUserProfile();
            fetchCurrentUserAndConnectionStatus();
        }
    }, [userId, loadViewedUserProfile, fetchCurrentUserAndConnectionStatus, navigate]);

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

    if (error && !profile) { // If error and no profile data to show at all
        return (
            <div className="container error-container">
                <div className="error-message">{error}</div>
                 {viewedUser && <p>Viewing profile for: <strong>{viewedUser.github_username}</strong></p>}
                <Link to="/profile" className="secondary-button">Back to My Profile</Link>
            </div>
        );
    }
    
    // Case: User exists but no co-founder profile data (profile is null but viewedUser is not)
    if (viewedUser && !profile && !loading) {
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

    if (!viewedUser || !profile) { // Fallback if something unexpected happens
         return (
            <div className="container info-message-container">
                <div className="info-message">Could not load user profile.</div>
                <Link to="/profile" className="secondary-button">Back to My Profile</Link>
            </div>
        );
    }

    const { personal, technical } = profile;
    const isOwnProfile = currentUser && currentUser.user && String(currentUser.user.id) === String(viewedUser.user_id);


    return (
        <div className="container profile-page-container">
             {/* Back Button or Breadcrumb */}
            <div style={{ marginBottom: 'var(--spacing)' }}>
                <Link to="/profile" className="secondary-button">&larr; Back to My Profile & Suggestions</Link>
            </div>

            <div className="profile-header-section"> {/* No box style */}
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
            {/* Render profile details only if 'technical' and 'personal' objects exist */}
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
