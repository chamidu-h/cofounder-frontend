// src/pages/ProfilePage.js
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate,Link } from 'react-router-dom';
import apiService from '../services/apiService';
import ProfileHeader from '../components/ProfileHeader';
import Overview from '../components/Overview';
import TagList from '../components/TagList';
import ProjectInsights from '../components/ProjectInsights';
import LanguageStats from '../components/LanguageStats';

// Simple Item components for lists (can be moved to separate files later)
const SuggestionItem = ({ suggestion, onConnect }) => (
    <div className="list-item suggestion-item">
        <img src={suggestion.github_avatar_url} alt={suggestion.github_username} className="list-item-avatar" />
        <div className="list-item-info">
            {/* UPDATED: Name is now a Link */}
            <Link to={`/profile/view/${suggestion.user_id}`} className="list-item-name-link">
                <strong>{suggestion.github_username}</strong>
            </Link>
            {suggestion.headline && <p className="list-item-headline">{suggestion.headline}</p>}
            {suggestion.keyStrengths && suggestion.keyStrengths.length > 0 &&
                <p className="list-item-details">Strengths: {suggestion.keyStrengths.join(', ')}</p>}
            <small>Match Score: {suggestion.score}</small>
        </div>
        {/* "Connect" button logic remains the same or can be adapted based on connectionStatus */}
        <button onClick={() => onConnect(suggestion.user_id)} className="secondary-button list-item-action">Connect</button>
    </div>
);

const PendingRequestItem = ({ request, onAccept, onDecline }) => (
    <div className="list-item pending-request-item">
        <img src={request.requester_avatar_url} alt={request.requester_username} className="list-item-avatar" />
        <div className="list-item-info">
            <strong>{request.requester_username}</strong>
            <p className="list-item-details">wants to connect with you.</p>
        </div>
        <div className="list-item-actions-group">
            <button onClick={() => onAccept(request.requester_id)} className="primary-button">Accept</button>
            <button onClick={() => onDecline(request.id)} className="delete-button">Decline</button> {/* request.id is connection_id */}
        </div>
    </div>
);

const ActiveConnectionItem = ({ connection }) => (
     <div className="list-item active-connection-item">
        <img src={connection.github_avatar_url} alt={connection.github_username} className="list-item-avatar" />
        <div className="list-item-info">
            <strong>{connection.github_username}</strong>
            {/* Link to their GitHub profile or future app profile page */}
            {connection.github_profile_url && 
                <a href={connection.github_profile_url} target="_blank" rel="noopener noreferrer" className="list-item-link">
                    View GitHub
                </a>
            }
        </div>
        {/* Add Message button later */}
    </div>
);


export default function ProfilePage() {
    const navigate = useNavigate();
    // Existing state
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [deletingProfile, setDeletingProfile] = useState(false);
    const [profileError, setProfileError] = useState(null);

    // New state for suggestions and connections
    const [suggestions, setSuggestions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [suggestionsError, setSuggestionsError] = useState(null);

    const [pendingRequests, setPendingRequests] = useState([]);
    const [loadingPendingRequests, setLoadingPendingRequests] = useState(false);
    const [pendingRequestsError, setPendingRequestsError] = useState(null);
    
    // Optional: Sent Requests
    const [sentRequests, setSentRequests] = useState([]);
    const [loadingSentRequests, setLoadingSentRequests] = useState(false);
    const [sentRequestsError, setSentRequestsError] = useState(null);


    const [activeConnections, setActiveConnections] = useState([]);
    const [loadingActiveConnections, setLoadingActiveConnections] = useState(false);
    const [activeConnectionsError, setActiveConnectionsError] = useState(null);


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
        setLoadingSentRequests(true); // Optional
        setSentRequestsError(null);   // Optional
        setLoadingActiveConnections(true);
        setActiveConnectionsError(null);

        try {
            const [suggData, pendingData, sentData, activeData] = await Promise.all([
                apiService.getSuggestions(),
                apiService.getPendingRequests(),
                apiService.getSentRequests(), // Optional
                apiService.getActiveConnections()
            ]);

            setSuggestions(suggData.suggestions || []);
            setPendingRequests(pendingData.pendingRequests || []);
            setSentRequests(sentData.sentRequests || []); // Optional
            setActiveConnections(activeData.activeConnections || []);

        } catch (error) {
            console.error("Error fetching suggestions/connections data:", error);
            // Set a generic error or specific ones if you can distinguish
            setSuggestionsError("Could not load suggestions.");
            setPendingRequestsError("Could not load pending requests.");
            setSentRequestsError("Could not load sent requests."); // Optional
            setActiveConnectionsError("Could not load active connections.");
        } finally {
            setLoadingSuggestions(false);
            setLoadingPendingRequests(false);
            setLoadingSentRequests(false); // Optional
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
        loadSuggestionsAndConnections(); // Load these in parallel or after profile
    }, [loadProfileData, loadSuggestionsAndConnections, navigate]);

    const handleDeleteProfile = async () => {
        if (!window.confirm('Are you sure you want to delete your saved profile? This action cannot be undone.')) {
            return;
        }
        setDeletingProfile(true);
        try {
            const response = await apiService.deleteProfile();
            alert(response.message || 'Profile deleted successfully!');
            navigate('/'); // Or refresh data: loadProfileData(); loadSuggestionsAndConnections();
        } catch (err) {
            console.error('ProfilePage: Delete profile error:', err);
            alert(err.response?.data?.error || err.message || 'Failed to delete profile.');
        } finally {
            setDeletingProfile(false);
        }
    };

    // --- Connection Action Handlers ---
    const handleSendRequest = async (addresseeId) => {
        try {
            const response = await apiService.sendConnectionRequest(addresseeId);
            alert(response.message || 'Connection request sent!');
            // For MVP, user needs to refresh to see updated suggestions/sent requests.
            // Or, re-fetch relevant data:
            loadSuggestionsAndConnections(); 
        } catch (error) {
            alert(`Error sending request: ${error.response?.data?.error || error.message}`);
        }
    };
    
    const handleAcceptRequest = async (requesterId) => {
        try {
            const response = await apiService.acceptConnectionRequest(requesterId);
            alert(response.message || 'Connection accepted!');
            loadSuggestionsAndConnections(); // Re-fetch to update lists
        } catch (error) {
             alert(`Error accepting request: ${error.response?.data?.error || error.message}`);
        }
    };
    
    const handleDeclineRequest = async (connectionId) => { 
        try {
            const response = await apiService.declineOrCancelRequest(connectionId);
            alert(response.message || 'Request declined/cancelled.');
            loadSuggestionsAndConnections(); // Re-fetch to update lists
        } catch (error) {
            alert(`Error declining request: ${error.response?.data?.error || error.message}`);
        }
    };


    if (loadingProfile) {
        return <div className="container"><div className="loading">Loading your profile...</div></div>;
    }

    // Display primary profile error first if it exists
    if (profileError && !profile) {
        return (
            <div className="container error-container">
                <div className="error-message">{profileError}</div>
                <button onClick={() => navigate('/generate')} className="primary-button" style={{ marginRight: '10px' }}>
                    Generate Profile
                </button>
                <button onClick={() => navigate('/')} className="secondary-button">
                    Back to Home
                </button>
            </div>
        );
    }
    
    if (!profile) { // If still no profile after loading and no specific error
        return (
            <div className="container info-message-container">
                <div className="info-message">No profile data is available to display. Please generate and save your profile first.</div>
                 <button onClick={() => navigate('/generate')} className="primary-button" style={{ marginRight: '10px' }}>
                    Generate Profile
                </button>
                <button onClick={() => navigate('/')} className="secondary-button">
                    Back to Home
                </button>
            </div>
        );
    }
    
    // Destructure only after confirming profile exists
    const { personal, technical } = profile;
    if (!personal || !technical) { // Should not happen if profile is set correctly
        return (
            <div className="container error-container">
                <div className="error-message">Profile data is incomplete. Please try re-saving or re-generating.</div>
                <button onClick={() => navigate('/')} className="secondary-button">Back to Home</button>
            </div>
        );
    }

    return (
        <div className="container profile-page-container">
            {/* --- User's Own Profile Section --- */}
            <div className="profile-header-section"> {/* No box style */}
                <h1>Your Co-founder Profile</h1>
                <div className="profile-actions">
                    <button onClick={() => navigate('/generate')} className="primary-button">
                        Generate New / Update
                    </button>
                    <button onClick={handleDeleteProfile} disabled={deletingProfile || loadingProfile} className="delete-button">
                        {deletingProfile ? 'Deleting...' : 'Delete This Profile'}
                    </button>
                    <button onClick={() => navigate('/')} className="secondary-button">
                        Back to Home
                    </button>
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
            {/* ... other profile detail components ... */}
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

            {/* --- Suggested Co-founders Section --- */}
            <section className="suggestions-section section-block">
                <h3>Suggested Co-founders</h3>
                {loadingSuggestions && <div className="loading">Loading suggestions...</div>}
                {suggestionsError && <div className="error-message">{suggestionsError}</div>}
                {!loadingSuggestions && !suggestionsError && suggestions.length === 0 && 
                    <p className="info-message">No new suggestions right now. Check back later!</p>}
                <div className="list-container">
                    {suggestions.map(sugg => (
                        <SuggestionItem key={sugg.user_id} suggestion={sugg} onConnect={handleSendRequest} />
                    ))}
                </div>
            </section>

            {/* --- Incoming Connection Requests Section --- */}
            <section className="pending-requests-section section-block">
                <h3>Incoming Connection Requests</h3>
                {loadingPendingRequests && <div className="loading">Loading requests...</div>}
                {pendingRequestsError && <div className="error-message">{pendingRequestsError}</div>}
                {!loadingPendingRequests && !pendingRequestsError && pendingRequests.length === 0 && 
                    <p className="info-message">No incoming connection requests.</p>}
                <div className="list-container">
                    {pendingRequests.map(req => (
                        <PendingRequestItem key={req.id} request={req} onAccept={handleAcceptRequest} onDecline={handleDeclineRequest} />
                    ))}
                </div>
            </section>

            {/* --- Optional: Sent Connection Requests Section --- */}
            <section className="sent-requests-section section-block">
                <h3>Sent Connection Requests (Pending)</h3>
                {loadingSentRequests && <div className="loading">Loading sent requests...</div>}
                {sentRequestsError && <div className="error-message">{sentRequestsError}</div>}
                {!loadingSentRequests && !sentRequestsError && sentRequests.length === 0 && 
                    <p className="info-message">You haven't sent any pending requests.</p>}
                <div className="list-container">
                    {sentRequests.map(req => (
                        <div key={req.id} className="list-item sent-request-item">
                           <img src={req.addressee_avatar_url} alt={req.addressee_username} className="list-item-avatar" />
                           <div className="list-item-info">
                                <strong>{req.addressee_username}</strong>
                                <p className="list-item-details">Request sent on {new Date(req.created_at).toLocaleDateString()}</p>
                           </div>
                           <button onClick={() => handleDeclineRequest(req.id)} className="secondary-button list-item-action">Cancel Request</button>
                        </div>
                    ))}
                </div>
            </section>


            {/* --- Active Connections Section --- */}
            <section className="active-connections-section section-block">
                <h3>Your Connections</h3>
                {loadingActiveConnections && <div className="loading">Loading connections...</div>}
                {activeConnectionsError && <div className="error-message">{activeConnectionsError}</div>}
                {!loadingActiveConnections && !activeConnectionsError && activeConnections.length === 0 && 
                    <p className="info-message">You have no active connections yet.</p>}
                <div className="list-container">
                    {activeConnections.map(conn => (
                        <ActiveConnectionItem key={conn.id} connection={conn} />
                    ))}
                </div>
            </section>
        </div>
    );
}
