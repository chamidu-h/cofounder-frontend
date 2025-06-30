// src/pages/ProfilePage.js
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiService from '../services/apiService';
import ProfileHeader from '../components/ProfileHeader';
import Overview from '../components/Overview';
import TagList from '../components/TagList';
import ProjectInsights from '../components/ProjectInsights';
import LanguageStats from '../components/LanguageStats';

// Enhanced Item Components with Modern Styling
const SuggestionItem = ({ suggestion, onConnect, index = 0 }) => {
    const [isConnecting, setIsConnecting] = useState(false);
    
    const handleConnect = async () => {
        setIsConnecting(true);
        try {
            await onConnect(suggestion.user_id);
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <div 
    className="cofounder-suggestion-card"
    style={{ animationDelay: `${index * 0.1}s` }}
>
    {/* Card Header with Avatar and Match Score */}
    <div className="card-header">
        <div className="avatar-section">
            <div className="avatar-wrapper">
                <img 
                    src={suggestion.github_avatar_url} 
                    alt={suggestion.github_username} 
                    className="user-avatar"
                    loading="lazy"
                />
                <div className="status-indicator online"></div>
            </div>
        </div>
        
        <div className="match-indicator">
            <div className="match-score">
                <span className="score-value">{suggestion.score}%</span>
                <span className="score-label">Match</span>
            </div>
        </div>
    </div>

    {/* Card Body with User Info */}
    <div className="card-body">
        <div className="user-info">
            <Link 
                to={`/profile/view/${suggestion.user_id}`} 
                className="username-link"
            >
                <h3 className="username">{suggestion.github_username}</h3>
            </Link>
            
            {suggestion.headline && (
                <p className="user-headline">{suggestion.headline}</p>
            )}
        </div>

        {/* Strengths Section */}
        {suggestion.keyStrengths && suggestion.keyStrengths.length > 0 && (
            <div className="strengths-section">
                <div className="strengths-header">
                    <span className="strengths-icon">💪</span>
                    <span className="strengths-title">Key Strengths</span>
                </div>
                <div className="strengths-grid">
                    {suggestion.keyStrengths.slice(0, 3).map((strength, idx) => (
                        <span key={idx} className="strength-pill">{strength}</span>
                    ))}
                    {suggestion.keyStrengths.length > 3 && (
                        <span className="strength-pill overflow">
                            +{suggestion.keyStrengths.length - 3} more
                        </span>
                    )}
                </div>
            </div>
        )}
    </div>

    {/* Card Footer with Actions */}
    <div className="card-footer">
        <button 
            onClick={handleConnect}
            disabled={isConnecting}
            className={`connect-button ${isConnecting ? 'loading' : ''}`}
        >
            {isConnecting ? (
                <>
                    <div className="loading-spinner"></div>
                    <span>Connecting...</span>
                </>
            ) : (
                <>
                    <span className="connect-icon">🤝</span>
                    <span>Connect</span>
                </>
            )}
        </button>
    </div>
</div>

    );
};

const PendingRequestItem = ({ request, onAccept, onDecline, index = 0 }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    
    const handleAccept = async () => {
        setIsProcessing(true);
        try {
            await onAccept(request.requester_id);
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleDecline = async () => {
        setIsProcessing(true);
        try {
            await onDecline(request.id);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div 
            className="pending-request-item"
            style={{ animationDelay: `${index * 0.1}s` }}
        >
            <div className="item-avatar-container">
                <img 
                    src={request.requester_avatar_url} 
                    alt={request.requester_username} 
                    className="item-avatar"
                    loading="lazy"
                />
                <div className="avatar-status pending"></div>
            </div>
            
            <div className="item-content">
                <div className="item-header">
                    <span className="item-name">{request.requester_username}</span>
                    <span className="request-time">
                        {new Date(request.created_at).toLocaleDateString()}
                    </span>
                </div>
                <p className="item-message">wants to connect with you</p>
            </div>
            
            <div className="item-actions">
                <button 
                    onClick={handleAccept}
                    disabled={isProcessing}
                    className="btn btn-primary btn-sm"
                >
                    <span className="btn-icon">✓</span>
                    Accept
                </button>
                <button 
                    onClick={handleDecline}
                    disabled={isProcessing}
                    className="btn btn-secondary btn-sm"
                >
                    <span className="btn-icon">✕</span>
                    Decline
                </button>
            </div>
        </div>
    );
};

const ActiveConnectionItem = ({ connection, index = 0 }) => (
    <div 
        className="active-connection-item"
        style={{ animationDelay: `${index * 0.1}s` }}
    >
        <div className="item-avatar-container">
            <img 
                src={connection.github_avatar_url} 
                alt={connection.github_username} 
                className="item-avatar"
                loading="lazy"
            />
            <div className="avatar-status connected"></div>
        </div>
        
        <div className="item-content">
            <div className="item-header">
                <span className="item-name">{connection.github_username}</span>
                <span className="connection-status">Connected</span>
            </div>
            <div className="item-links">
                {connection.github_profile_url && (
                    <a 
                        href={connection.github_profile_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="external-link"
                    >
                        <span className="link-icon">🔗</span>
                        View GitHub
                    </a>
                )}
            </div>
        </div>
        
        <div className="item-actions">
            <button className="btn btn-secondary btn-sm">
                <span className="btn-icon">💬</span>
                Message
            </button>
        </div>
    </div>
);

const SentRequestItem = ({ request, onCancel, index = 0 }) => {
    const [isCancelling, setIsCancelling] = useState(false);
    
    const handleCancel = async () => {
        setIsCancelling(true);
        try {
            await onCancel(request.id);
        } finally {
            setIsCancelling(false);
        }
    };

    return (
        <div 
            className="sent-request-item"
            style={{ animationDelay: `${index * 0.1}s` }}
        >
            <div className="item-avatar-container">
                <img 
                    src={request.addressee_avatar_url} 
                    alt={request.addressee_username} 
                    className="item-avatar"
                    loading="lazy"
                />
                <div className="avatar-status sent"></div>
            </div>
            
            <div className="item-content">
                <div className="item-header">
                    <span className="item-name">{request.addressee_username}</span>
                    <span className="request-time">
                        Sent {new Date(request.created_at).toLocaleDateString()}
                    </span>
                </div>
                <p className="item-message">Request pending</p>
            </div>
            
            <div className="item-actions">
                <button 
                    onClick={handleCancel}
                    disabled={isCancelling}
                    className={`btn btn-secondary btn-sm ${isCancelling ? 'btn-loading' : ''}`}
                >
                    {isCancelling ? 'Cancelling...' : 'Cancel Request'}
                </button>
            </div>
        </div>
    );
};

export default function ProfilePage() {
    const navigate = useNavigate();
    const pageRef = useRef(null);
    
    // Profile state
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [deletingProfile, setDeletingProfile] = useState(false);
    const [profileError, setProfileError] = useState(null);

    // Connections state
    const [suggestions, setSuggestions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [suggestionsError, setSuggestionsError] = useState(null);

    const [pendingRequests, setPendingRequests] = useState([]);
    const [loadingPendingRequests, setLoadingPendingRequests] = useState(false);
    const [pendingRequestsError, setPendingRequestsError] = useState(null);
    
    const [sentRequests, setSentRequests] = useState([]);
    const [loadingSentRequests, setLoadingSentRequests] = useState(false);
    const [sentRequestsError, setSentRequestsError] = useState(null);

    const [activeConnections, setActiveConnections] = useState([]);
    const [loadingActiveConnections, setLoadingActiveConnections] = useState(false);
    const [activeConnectionsError, setActiveConnectionsError] = useState(null);

    // Animation state
    const [animationTriggered, setAnimationTriggered] = useState(false);

    const loadProfileData = useCallback(async () => {
        setLoadingProfile(true);
        setProfileError(null);
        try {
            const responseData = await apiService.getSavedProfile();
            console.log("ProfilePage responseData:", responseData);
            if (responseData && responseData.profile) {
                setProfile(responseData.profile);
            } else {
                setProfile(null);
                setProfileError("No saved profile data found. Please generate or save your profile.");
            }
        } catch (err) {
            console.error("ProfilePage: Load profile error:", err);
            setProfileError(err.response?.data?.error || err.message || "Failed to load profile.");
            setProfile(null);
        } finally {
            setLoadingProfile(false);
        }
    }, []);

    const loadSuggestionsAndConnections = useCallback(async () => {
        setLoadingSuggestions(true);
        setSuggestionsError(null);
        setLoadingPendingRequests(true);
        setPendingRequestsError(null);
        setLoadingSentRequests(true);
        setSentRequestsError(null);
        setLoadingActiveConnections(true);
        setActiveConnectionsError(null);

        try {
            const [suggData, pendingData, sentData, activeData] = await Promise.all([
                apiService.getSuggestions(),
                apiService.getPendingRequests(),
                apiService.getSentRequests(),
                apiService.getActiveConnections()
            ]);

            setSuggestions(suggData.suggestions || []);
            setPendingRequests(pendingData.pendingRequests || []);
            setSentRequests(sentData.sentRequests || []);
            setActiveConnections(activeData.activeConnections || []);

        } catch (error) {
            console.error("Error fetching suggestions/connections data:", error);
            setSuggestionsError("Could not load suggestions.");
            setPendingRequestsError("Could not load pending requests.");
            setSentRequestsError("Could not load sent requests.");
            setActiveConnectionsError("Could not load active connections.");
        } finally {
            setLoadingSuggestions(false);
            setLoadingPendingRequests(false);
            setLoadingSentRequests(false);
            setLoadingActiveConnections(false);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            navigate('/');
            return;
        }
        
        loadProfileData();
        loadSuggestionsAndConnections();
        
        // Trigger animations
        setTimeout(() => setAnimationTriggered(true), 300);
    }, [loadProfileData, loadSuggestionsAndConnections, navigate]);

    const handleDeleteProfile = async () => {
        if (!window.confirm('Are you sure you want to delete your saved profile? This action cannot be undone.')) {
            return;
        }
        setDeletingProfile(true);
        try {
            const response = await apiService.deleteProfile();
            alert(response.message || 'Profile deleted successfully!');
            navigate('/');
        } catch (err) {
            console.error('ProfilePage: Delete profile error:', err);
            alert(err.response?.data?.error || err.message || 'Failed to delete profile.');
        } finally {
            setDeletingProfile(false);
        }
    };

    // Connection handlers
    const handleSendRequest = async (addresseeId) => {
        try {
            const response = await apiService.sendConnectionRequest(addresseeId);
            alert(response.message || 'Connection request sent!');
            loadSuggestionsAndConnections();
        } catch (error) {
            alert(`Error sending request: ${error.response?.data?.error || error.message}`);
        }
    };
    
    const handleAcceptRequest = async (requesterId) => {
        try {
            const response = await apiService.acceptConnectionRequest(requesterId);
            alert(response.message || 'Connection accepted!');
            loadSuggestionsAndConnections();
        } catch (error) {
            alert(`Error accepting request: ${error.response?.data?.error || error.message}`);
        }
    };
    
    const handleDeclineRequest = async (connectionId) => {
        try {
            const response = await apiService.declineOrCancelRequest(connectionId);
            alert(response.message || 'Request declined/cancelled.');
            loadSuggestionsAndConnections();
        } catch (error) {
            alert(`Error declining request: ${error.response?.data?.error || error.message}`);
        }
    };

    if (loadingProfile) {
        return (
            <div className="profile-page-container">
                <div className="profile-loading">
                    <div className="loading-spinner-large"></div>
                    <p>Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (profileError && !profile) {
        return (
            <div className="profile-page-container">
                <div className="profile-error-state">
                    <div className="error-icon">⚠️</div>
                    <h2>Profile Not Found</h2>
                    <p className="error-message">{profileError}</p>
                    <div className="error-actions">
                        <button 
                            onClick={() => navigate('/generate')} 
                            className="btn btn-primary"
                        >
                            <span className="btn-icon">✨</span>
                            Generate Profile
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
    
    if (!profile) {
        return (
            <div className="profile-page-container">
                <div className="profile-empty-state">
                    <div className="empty-icon">📄</div>
                    <h2>No Profile Available</h2>
                    <p>No profile data is available to display. Please generate and save your profile first.</p>
                    <div className="empty-actions">
                        <button 
                            onClick={() => navigate('/generate')} 
                            className="btn btn-primary"
                        >
                            <span className="btn-icon">✨</span>
                            Generate Profile
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
    
    const { personal, technical } = profile;
    if (!personal || !technical) {
        return (
            <div className="profile-page-container">
                <div className="profile-error-state">
                    <div className="error-icon">🔧</div>
                    <h2>Incomplete Profile Data</h2>
                    <p>Profile data is incomplete. Please try re-saving or re-generating.</p>
                    <button 
                        onClick={() => navigate('/')} 
                        className="btn btn-secondary"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div 
            ref={pageRef}
            className={`profile-page-container ${animationTriggered ? 'animate-in' : ''}`}
        >
            {/* Profile Header Section */}
            <div className="profile-page-header">
                <div className="header-content">
                    <h1 className="page-title">Your Co-founder Profile</h1>
                    <div className="header-actions">
                        <button 
                            onClick={() => navigate('/generate')} 
                            className="btn btn-primary"
                        >
                            <span className="btn-icon">✨</span>
                            Generate New
                        </button>
                        <button 
                            onClick={handleDeleteProfile} 
                            disabled={deletingProfile || loadingProfile} 
                            className={`btn btn-logout ${deletingProfile ? 'btn-loading' : ''}`}
                        >
                            {deletingProfile ? (
                                <>
                                    <span className="btn-spinner"></span>
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <span className="btn-icon">🗑️</span>
                                    Delete Profile
                                </>
                            )}
                        </button>
                        <button 
                            onClick={() => navigate('/')} 
                            className="btn btn-secondary"
                        >
                            <span className="btn-icon">🏠</span>
                            Home
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Profile Content */}
            <div className="profile-content-grid">
                {/* Left Column - Profile Details */}
                <div className="profile-main-content">
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

                {/* Right Column - Connections */}
                <div className="profile-sidebar">
                    {/* Suggested Co-founders */}
                    <section className="connections-section">
                        <div className="section-header">
                            <h3>
                                <span className="section-icon">🤝</span>
                                Suggested Co-founders
                            </h3>
                            {suggestions.length > 0 && (
                                <span className="count-badge">{suggestions.length}</span>
                            )}
                        </div>
                        
                        <div className="section-content">
                            {loadingSuggestions && (
                                <div className="section-loading">
                                    <div className="loading-spinner-large"></div>
                                    <p>Finding matches...</p>
                                </div>
                            )}
                            
                            {suggestionsError && (
                                <div className="section-error">
                                    <span className="error-icon">⚠️</span>
                                    <p>{suggestionsError}</p>
                                </div>
                            )}
                            
                            {!loadingSuggestions && !suggestionsError && suggestions.length === 0 && (
                                <div className="section-empty">
                                    <span className="empty-icon">🔍</span>
                                    <p>No new suggestions right now</p>
                                    <small>Check back later for new matches!</small>
                                </div>
                            )}
                            
                            <div className="items-container">
                                {suggestions.map((sugg, index) => (
                                    <SuggestionItem 
                                        key={sugg.user_id} 
                                        suggestion={sugg} 
                                        onConnect={handleSendRequest}
                                        index={index}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Incoming Requests */}
                    <section className="connections-section">
                        <div className="section-header">
                            <h3>
                                <span className="section-icon">📥</span>
                                Incoming Requests
                            </h3>
                            {pendingRequests.length > 0 && (
                                <span className="count-badge urgent">{pendingRequests.length}</span>
                            )}
                        </div>
                        
                        <div className="section-content">
                            {loadingPendingRequests && (
                                <div className="section-loading">
                                    <div className="loading-spinner-large"></div>
                                    <p>Loading requests...</p>
                                </div>
                            )}
                            
                            {pendingRequestsError && (
                                <div className="section-error">
                                    <span className="error-icon">⚠️</span>
                                    <p>{pendingRequestsError}</p>
                                </div>
                            )}
                            
                            {!loadingPendingRequests && !pendingRequestsError && pendingRequests.length === 0 && (
                                <div className="section-empty">
                                    <span className="empty-icon">📭</span>
                                    <p>No pending requests</p>
                                </div>
                            )}
                            
                            <div className="items-container">
                                {pendingRequests.map((req, index) => (
                                    <PendingRequestItem 
                                        key={req.id} 
                                        request={req} 
                                        onAccept={handleAcceptRequest} 
                                        onDecline={handleDeclineRequest}
                                        index={index}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Sent Requests */}
                    <section className="connections-section">
                        <div className="section-header">
                            <h3>
                                <span className="section-icon">📤</span>
                                Sent Requests
                            </h3>
                            {sentRequests.length > 0 && (
                                <span className="count-badge">{sentRequests.length}</span>
                            )}
                        </div>
                        
                        <div className="section-content">
                            {loadingSentRequests && (
                                <div className="section-loading">
                                    <div className="loading-spinner-large"></div>
                                    <p>Loading sent requests...</p>
                                </div>
                            )}
                            
                            {sentRequestsError && (
                                <div className="section-error">
                                    <span className="error-icon">⚠️</span>
                                    <p>{sentRequestsError}</p>
                                </div>
                            )}
                            
                            {!loadingSentRequests && !sentRequestsError && sentRequests.length === 0 && (
                                <div className="section-empty">
                                    <span className="empty-icon">📮</span>
                                    <p>No pending requests sent</p>
                                </div>
                            )}
                            
                            <div className="items-container">
                                {sentRequests.map((req, index) => (
                                    <SentRequestItem 
                                        key={req.id} 
                                        request={req} 
                                        onCancel={handleDeclineRequest}
                                        index={index}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Active Connections */}
                    <section className="connections-section">
                        <div className="section-header">
                            <h3>
                                <span className="section-icon">👥</span>
                                Your Connections
                            </h3>
                            {activeConnections.length > 0 && (
                                <span className="count-badge success">{activeConnections.length}</span>
                            )}
                        </div>
                        
                        <div className="section-content">
                            {loadingActiveConnections && (
                                <div className="section-loading">
                                    <div className="loading-spinner-large"></div>
                                    <p>Loading connections...</p>
                                </div>
                            )}
                            
                            {activeConnectionsError && (
                                <div className="section-error">
                                    <span className="error-icon">⚠️</span>
                                    <p>{activeConnectionsError}</p>
                                </div>
                            )}
                            
                            {!loadingActiveConnections && !activeConnectionsError && activeConnections.length === 0 && (
                                <div className="section-empty">
                                    <span className="empty-icon">👤</span>
                                    <p>No connections yet</p>
                                    <small>Start connecting with suggested co-founders!</small>
                                </div>
                            )}
                            
                            <div className="items-container">
                                {activeConnections.map((conn, index) => (
                                    <ActiveConnectionItem 
                                        key={conn.id} 
                                        connection={conn}
                                        index={index}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
