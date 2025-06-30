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

    const [data, setData] = useState({ viewedUser: null, profile: null, currentUser: null, connectionStatus: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSendingRequest, setIsSendingRequest] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (!token || !userId) {
            navigate('/');
            return;
        }

        const fetchProfileData = async () => {
            setLoading(true);
            setError(null);

            try {
                const [profileData, currentUserData] = await Promise.all([
                    apiService.getUserPublicProfile(userId),
                    apiService.getUser()
                ]);

                if (!currentUserData?.user) {
                    throw new Error("Could not identify the current user.");
                }

                if (!profileData?.user) {
                    throw new Error("User profile not found.");
                }

                const isOwnProfile = String(currentUserData.user.id) === String(userId);

                setData({
                    viewedUser: profileData.user,
                    profile: profileData.profile,
                    currentUser: currentUserData.user,
                    connectionStatus: null // Initial null; will be updated separately
                });

                if (!profileData.profile) {
                    setError("This user hasn't created a co-founder profile yet.");
                }

                // Fetch connection status independently without blocking profile render
                if (!isOwnProfile) {
                    fetchConnectionStatus(userId);
                }
            } catch (err) {
                console.error("Error loading profile:", err);
                setError(err.message || "Failed to load user profile.");
            } finally {
                setLoading(false);
            }
        };

        const fetchConnectionStatus = async (targetUserId) => {
            try {
                const statusData = await apiService.getConnectionStatus(targetUserId);
                setData(prev => ({ ...prev, connectionStatus: statusData.status }));
            } catch (statusError) {
                console.error("Failed to fetch connection status (non-critical):", statusError);
                // Set to null on failure to allow "Send Request" button
                setData(prev => ({ ...prev, connectionStatus: null }));
            }
        };

        fetchProfileData();
    }, [userId, navigate]);

    const handleSendConnectionRequest = async () => {
        if (!data.viewedUser?.id) return;

        setIsSendingRequest(true);
        try {
            const response = await apiService.sendConnectionRequest(data.viewedUser.id);
            alert(response.message || "Connection request sent!");
            setData(prev => ({ ...prev, connectionStatus: 'pending' }));
        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            setIsSendingRequest(false);
        }
    };

    if (loading) {
        return <div className="container"><div className="loading">Loading user profile...</div></div>;
    }

    if (error && !data.viewedUser) {
        return (
            <div className="container error-container">
                <div className="error-message">{error}</div>
                <Link to="/profile" className="secondary-button">Back to My Profile</Link>
            </div>
        );
    }

    const { viewedUser, profile, currentUser, connectionStatus } = data;
    const isOwnProfile = currentUser?.id && viewedUser?.id && String(currentUser.id) === String(viewedUser.id);
    const { personal, technical } = profile || {};

    return (
        <div className="container profile-page-container">
            <div style={{ marginBottom: 'var(--spacing)' }}>
                <Link to="/profile" className="secondary-button">&larr; Back to My Profile & Suggestions</Link>
            </div>

            <div className="profile-header-section">
                <h1>{viewedUser?.github_username ? `${viewedUser.github_username}'s Profile` : 'User Profile'}</h1>

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
                name={personal?.name || viewedUser?.github_username || 'User'}
                avatar_url={personal?.avatar_url || viewedUser?.github_avatar_url}
                html_url={personal?.html_url || viewedUser?.github_profile_url}
                headline={technical?.headline || (error ? 'Profile Not Created' : 'N/A')}
            />

            {error && (
                <div className="info-message">{error}</div>
            )}

            {personal && technical && (
                <>
                    {technical.coFounderSummary && <Overview text={technical.coFounderSummary} />}
                    {technical.keyStrengths?.length > 0 && <TagList title="Key Strengths" tags={technical.keyStrengths} />}
                    {technical.potentialRoles?.length > 0 && <TagList title="Potential Roles" tags={technical.potentialRoles} />}
                    {technical.languageStats && Object.keys(technical.languageStats).length > 0 && <LanguageStats data={technical.languageStats} />}
                    {technical.projectInsights?.length > 0 && <ProjectInsights items={technical.projectInsights} />}
                </>
            )}
        </div>
    );
}
