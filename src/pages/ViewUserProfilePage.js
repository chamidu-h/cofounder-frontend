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

  // Animation state for CSS transitions
  const [isAnimated, setIsAnimated] = useState(false);

  const [data, setData] = useState({
    viewedUser: null,
    profile: null,
    currentUser: null,
    connectionStatus: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  // Initialize animation after component mounts
  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

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
          console.warn('Failed to fetch connection status:', statusError);
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
          console.error('Profile fetch error:', err);
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
      console.error('Connection request error:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSendingRequest(false);
    }
  };

  // Debug logging (remove in production)
  console.log('ViewUserProfilePage render state:', {
    loading,
    error,
    hasViewedUser: !!data.viewedUser,
    hasProfile: !!data.profile,
    isAnimated
  });

  // Loading state
  if (loading) {
    return (
      <div className={`container profile-page-container ${isAnimated ? 'animate-in' : ''}`}>
        <div className="profile-loading">
          <div className="loading-spinner-large"></div>
          <p>Loading user profile...</p>
        </div>
      </div>
    );
  }

  // Error: user not found or fetch failed
  if (error && !data.viewedUser) {
    return (
      <div className={`container profile-page-container ${isAnimated ? 'animate-in' : ''}`}>
        <div className="profile-error-state">
          <div className="error-icon">⚠️</div>
          <div className="error-message">{error}</div>
          <div className="error-actions">
            <Link to="/profile" className="btn btn-secondary">
              Back to My Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Error: user found but no profile created
  if (error && data.viewedUser && !data.profile) {
    return (
      <div className={`container profile-page-container ${isAnimated ? 'animate-in' : ''}`}>
        <div className="profile-empty-state">
          <div className="empty-icon">👤</div>
          <div className="error-message">{error}</div>
          <div className="empty-actions">
            <Link to="/profile" className="btn btn-secondary">
              Back to My Profile
            </Link>
          </div>
        </div>
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
    <div className={`container profile-page-container ${isAnimated ? 'animate-in' : ''}`}>
      {/* Back Navigation */}
      <div style={{ marginBottom: 'var(--spacing)' }}>
        <Link to="/profile" className="btn btn-secondary">
          ← Back to My Profile & Suggestions
        </Link>
      </div>

      {/* Profile Header Section */}
      <div className="profile-header-section">
        <div className="header-content">
          <h1 className="profile-name">
            {viewedUser?.github_username
              ? `${viewedUser.github_username}'s Profile`
              : 'User Profile'}
          </h1>

          <div className="header-actions">
            {!isOwnProfile && connectionStatus === null && (
              <button
                onClick={handleSendConnectionRequest}
                className="btn btn-primary"
                disabled={isSendingRequest}
              >
                {isSendingRequest ? (
                  <>
                    <div className="btn-spinner"></div>
                    Sending...
                  </>
                ) : (
                  'Send Connection Request'
                )}
              </button>
            )}

            {!isOwnProfile && connectionStatus === 'pending' && (
              <button className="btn btn-disabled" disabled>
                Request Sent
              </button>
            )}

            {!isOwnProfile && connectionStatus === 'accepted' && (
              <button className="btn btn-disabled" disabled>
                ✓ Connected
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Header Component */}
      {viewedUser && (
        <ProfileHeader
          name={personal.name || viewedUser.github_username || 'User'}
          avatar_url={personal.avatar_url || viewedUser.github_avatar_url}
          html_url={personal.html_url || viewedUser.github_profile_url}
          headline={technical.headline || (error ? 'Profile Not Created' : 'N/A')}
        />
      )}

      {/* Info message if profile not created */}
      {error && data.viewedUser && (
        <div className="info-message">
          <p>{error}</p>
        </div>
      )}

      {/* Profile Details - Only show if profile exists */}
      {profile && (
        <div className="profile-content-grid">
          <div className="profile-main-content">
            {/* Overview Section */}
            {technical?.coFounderSummary && (
              <Overview text={technical.coFounderSummary} />
            )}

            {/* Key Strengths */}
            {Array.isArray(technical?.keyStrengths) && technical.keyStrengths.length > 0 && (
              <TagList title="Key Strengths" tags={technical.keyStrengths} />
            )}

            {/* Potential Roles */}
            {Array.isArray(technical?.potentialRoles) && technical.potentialRoles.length > 0 && (
              <TagList title="Potential Roles" tags={technical.potentialRoles} />
            )}

            {/* Project Insights */}
            {Array.isArray(technical?.projectInsights) && technical.projectInsights.length > 0 && (
              <ProjectInsights items={technical.projectInsights} />
            )}
          </div>

          <div className="profile-sidebar">
            {/* Language Stats */}
            {technical?.languageStats && Object.keys(technical.languageStats).length > 0 && (
              <LanguageStats data={technical.languageStats} />
            )}

            {/* Experience Badge */}
            {viewedUser?.github_username && (
              <div className="experience-section">
                <div className="experience-badge">
                  <div className="experience-icon">💼</div>
                  <div className="experience-text">
                    GitHub Developer
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fallback content if no profile data */}
      {!profile && !error && viewedUser && (
        <div className="profile-empty-state">
          <div className="empty-icon">📝</div>
          <p>This user hasn't set up their co-founder profile yet.</p>
          <div className="empty-actions">
            <Link to="/profile" className="btn btn-secondary">
              Back to My Profile
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
