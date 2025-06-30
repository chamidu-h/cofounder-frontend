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
                // Fetch both profile data and current user data
                const [profileData, currentUserData] = await Promise.all([
                    apiService.getUserPublicProfile(userId),
                    apiService.getUser()
                ]);
                
                // FIXED: No more data normalization needed
                // Both endpoints now return consistent 'id' properties
                if (currentUserData && currentUserData.user) {
                    setCurrentUser(currentUserData.user);
                } else {
                    throw new Error("Could not identify the current user.");
                }

                if (profileData && profileData.user) {
                    setViewedUser(profileData.user);
                    setProfile(profileData.profile); // Will be null if no profile exists
                    
                    // Set appropriate error message if no profile exists
                    if (!profileData.profile) {
                        setError("This user hasn't created a co-founder profile yet.");
                    }
                } else {
                    throw new Error("User profile not found or data is malformed.");
                }
                
                // FIXED: Simplified comparison logic with consistent data structure
                const isOwnProfile = String(currentUserData.user.id) === String(userId);
                
                // Only fetch connection status if viewing another user's profile
                if (!isOwnProfile) {
                    try {
                        const statusData = await apiService.getConnectionStatus(userId);
                        setConnectionStatus(statusData.status);
                    } catch (statusError) {
                        console.error("Non-critical error: Failed to fetch connection status.", statusError);
                        // Don't set error state for connection status failures
                    }
                }

            } catch (mainError) {
                console.error("Critical error occurred while loading profile page:", mainError);
                setError(mainError.response?.data?.error || mainError.message || "Failed to load user profile.");
                // MODIFIED: Removed setViewedUser(null) and setProfile(null) to prevent state reset
                // This allows checking if profile loads without fallback to empty page
                console.log("Error encountered, but states not reset for debugging. Current viewedUser:", viewedUser);
                console.log("Current profile:", profile);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();

    }, [userId, navigate]);

    const handleSendConnectionRequest = async () => {
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

    // Loading state
    if (loading) {
        return (
            <div className="container">
                <div className="loading">Loading user profile...</div>
            </div>
        );
    }

    // FIXED: Critical error handling - user data couldn't be loaded
    if (!viewedUser) {
        return (
            <div className="container error-container">
                <div className="error-message">
                    {error || "Could not load user profile."}
                </div>
                <Link to="/profile" className="secondary-button">
                    Back to My Profile
                </Link>
            </div>
        );
    }

    // FIXED: Handle case where user exists but has no profile
    if (!profile) {
        return (
            <div className="container info-message-container">
                <ProfileHeader 
                    name={viewedUser.github_username || "User"}
                    avatar_url={viewedUser.github_avatar_url}
                    html_url={viewedUser.github_profile_url}
                    headline="Profile Not Created"
                />
                <div className="info-message">
                    {error || "This user has not created a co-founder profile yet."}
                </div>
                <Link to="/profile" className="secondary-button">
                    Back to My Profile
                </Link>
            </div>
        );
    }
    
    // FIXED: Reliable profile ownership check with consistent data structure
    const isOwnProfile = currentUser?.id && viewedUser?.id && 
                        String(currentUser.id) === String(viewedUser.id);

    // Extract profile data
    const { personal, technical } = profile;

    return (
        <div className="container profile-page-container">
            {/* Navigation */}
            <div style={{ marginBottom: 'var(--spacing)' }}>
                <Link to="/profile" className="secondary-button">
                    &larr; Back to My Profile & Suggestions
                </Link>
            </div>

            {/* Profile Header with Connection Actions */}
            <div className="profile-header-section">
                <h1>{viewedUser.github_username}'s Profile</h1>
                
                {/* Connection Request Button - Only show for other users */}
                {!isOwnProfile && connectionStatus === null && (
                    <button 
                        onClick={handleSendConnectionRequest} 
                        className="primary-button" 
                        disabled={isSendingRequest}
                    >
                        {isSendingRequest ? 'Sending...' : 'Send Connection Request'}
                    </button>
                )}
                
                {/* Connection Status Indicators */}
                {!isOwnProfile && connectionStatus === 'pending' && (
                    <button className="disabled-button" disabled>
                        Request Sent
                    </button>
                )}
                
                {!isOwnProfile && connectionStatus === 'accepted' && (
                    <button className="disabled-button" disabled>
                        Connected
                    </button>
                )}
            </div>

            {/* Profile Header Component */}
            <ProfileHeader
                name={personal?.name || viewedUser.github_username || 'N/A'}
                avatar_url={personal?.avatar_url || viewedUser.github_avatar_url}
                html_url={personal?.html_url || viewedUser.github_profile_url}
                headline={technical?.headline || 'N/A'}
            />
            
            {/* Profile Content - Only render if both personal and technical data exist */}
            {personal && technical ? (
                <>
                    {/* Co-founder Summary */}
                    {technical.coFounderSummary && (
                        <Overview text={technical.coFounderSummary} />
                    )}
                    
                    {/* Key Strengths */}
                    {technical.keyStrengths?.length > 0 && (
                        <TagList title="Key Strengths" tags={technical.keyStrengths} />
                    )}
                    
                    {/* Potential Roles */}
                    {technical.potentialRoles?.length > 0 && (
                        <TagList title="Potential Roles" tags={technical.potentialRoles} />
                    )}
                    
                    {/* Language Statistics */}
                    {technical.languageStats && Object.keys(technical.languageStats).length > 0 && (
                        <LanguageStats data={technical.languageStats} />
                    )}
                    
                    {/* Project Insights */}
                    {technical.projectInsights?.length > 0 && (
                        <ProjectInsights items={technical.projectInsights} />
                    )}
                </>
            ) : null}
        </div>
    );
}
