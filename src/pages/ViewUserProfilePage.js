// ViewUserProfilePage.jsx
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

  const [data, setData] = useState({
    viewedUser: null,
    profile: null,
    currentUser: null,
    connectionStatus: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  useEffect(() => {
    // Reset state on userId change
    setData({
      viewedUser: null,
      profile: null,
      currentUser: null,
      connectionStatus: null,
    });
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('auth_token');
    if (!token || !userId) {
      navigate('/');
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    const fetchConnectionStatus = async (targetUserId, signal) => {
      try {
        const statusData = await apiService.getConnectionStatus(targetUserId, signal);
        setData(prev =>
          prev
            ? { ...prev, connectionStatus: statusData.status }
            : prev
        );
      } catch (statusError) {
        if (statusError.name !== 'AbortError') {
          setData(prev =>
            prev
              ? { ...prev, connectionStatus: null }
              : prev
          );
        }
      }
    };

    const fetchProfileData = async () => {
      try {
        const [profileData, currentUserData] = await Promise.all([
          apiService.getUserPublicProfile(userId, signal),
          apiService.getUser(signal),
        ]);

        if (!currentUserData?.user) {
          throw new Error('Could not identify the current user.');
        }
        if (!profileData?.user) {
          throw new Error('User profile not found.');
        }

        const isOwnProfile = String(currentUserData.user.id) === String(userId);

        setData({
          viewedUser: profileData.user,
          profile: profileData.profile,
          currentUser: currentUserData.user,
          connectionStatus: null,
        });

        if (!profileData.profile) {
          setError("This user hasn't created a co-founder profile yet.");
        }

        if (!isOwnProfile) {
          fetchConnectionStatus(userId, signal);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load user profile.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
    return () => controller.abort();
  }, [userId, navigate]);

  const handleSendConnectionRequest = async () => {
    if (!data.viewedUser?.id) return;

    setIsSendingRequest(true);
    try {
      const response = await apiService.sendConnectionRequest(data.viewedUser.id);
      alert(response.message || 'Connection request sent!');
      setData(prev =>
        prev
          ? { ...prev, connectionStatus: 'pending' }
          : prev
      );
    } catch (err) {
      alert(`Error: ${err.message}`);
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

  // Error: user not found or fetch failed
  if (error && !data.viewedUser) {
    return (
      <div className="container error-container">
        <div className="error-message">{error}</div>
        <Link to="/profile" className="secondary-button">
          Back to My Profile
        </Link>
      </div>
    );
  }

  // Error: user found but no profile created
  if (error && data.viewedUser && !data.profile) {
    return (
      <div className="container error-container">
        <div className="error-message">{error}</div>
        <Link to="/profile" className="secondary-button">
          Back to My Profile
        </Link>
      </div>
    );
  }

  // Defensive destructuring for rendering
  const { viewedUser, profile, currentUser, connectionStatus } = data;
  const isOwnProfile =
    currentUser?.id && viewedUser?.id && String(currentUser.id) === String(viewedUser.id);
  const personal = profile?.personal || {};
  const technical = profile?.technical || {};

  return (
    <div className="container profile-page-container">
      <div style={{ marginBottom: 'var(--spacing)' }}>
        <Link to="/profile" className="secondary-button">
          &larr; Back to My Profile & Suggestions
        </Link>
      </div>

      <div className="profile-header-section">
        <h1>
          {viewedUser?.github_username
            ? `${viewedUser.github_username}'s Profile`
            : 'User Profile'}
        </h1>

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

      {/* Profile Header */}
      {viewedUser && (
        <ProfileHeader
          name={personal.name || viewedUser.github_username || 'User'}
          avatar_url={personal.avatar_url || viewedUser.github_avatar_url}
          html_url={personal.html_url || viewedUser.github_profile_url}
          headline={technical.headline || (error ? 'Profile Not Created' : 'N/A')}
        />
      )}

      {/* Info message if profile not created */}
      {error && <div className="info-message">{error}</div>}

      {/* Profile Details */}
      {personal && technical && (
        <>
          {technical.coFounderSummary && <Overview text={technical.coFounderSummary} />}
          {Array.isArray(technical.keyStrengths) && technical.keyStrengths.length > 0 && (
            <TagList title="Key Strengths" tags={technical.keyStrengths} />
          )}
          {Array.isArray(technical.potentialRoles) && technical.potentialRoles.length > 0 && (
            <TagList title="Potential Roles" tags={technical.potentialRoles} />
          )}
          {technical.languageStats && Object.keys(technical.languageStats).length > 0 && (
            <LanguageStats data={technical.languageStats} />
          )}
          {Array.isArray(technical.projectInsights) && technical.projectInsights.length > 0 && (
            <ProjectInsights items={technical.projectInsights} />
          )}
        </>
      )}
    </div>
  );
}
