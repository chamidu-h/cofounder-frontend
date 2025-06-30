// src/services/apiService.js
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';
console.log(`[ApiService] Using API_BASE: ${API_BASE}`);

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE,
    });

    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("auth_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (
          error.response &&
          (error.response.status === 401 || error.response.status === 403)
        ) {
          console.warn(
            "[ApiService] Auth error, removing token and redirecting:",
            error.response.status
          );
          localStorage.removeItem("auth_token");
          if (window.location.pathname !== "/") {
            window.location.href = "/"; // Redirect to home
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // --- Auth Routes ---
  getGithubAuthUrl(includePrivate = false) {
    const includePrivateParam = includePrivate ? "true" : "false";
    return `${API_BASE}/auth/github?include_private=${includePrivateParam}`;
  }

  async getUser() {
    const response = await this.api.get("/auth/user");
    return response.data;
  }

  // --- Profile Routes ---
  async generateProfile() {
    const response = await this.api.post("/profile/generate", {});
    return response.data;
  }

  async saveProfile(profileDetails) {
    // Backend expects { profileData: { ... } }
    const response = await this.api.post("/profile/save", {
      profileData: profileDetails,
    });
    return response.data;
  }

  async getSavedProfile() {
    // Fetches the current user's own saved profile
    const response = await this.api.get("/profile/saved", {
      // Path based on your backend's profileRoutes.js
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
    // Expects backend to send { profile: { personal, technical } }
    return response.data;
  }

  async deleteProfile() {
    const response = await this.api.delete("/profile/saved"); // Path based on your backend's profileRoutes.js
    return response.data;
  }

  // --- NEW Suggestion and Connection Methods ---
  async getSuggestions() {
    const response = await this.api.get("/profile/suggestions");
    // Expects { suggestions: [{ user_id, github_username, ... , score }, ...] }
    return response.data;
  }

  async getUserPublicProfile(userId) {
    // Calls GET /api/profile/:userId
    // No cache-busting headers needed here unless you find it becomes an issue.
    // Typically, viewing someone else's profile can be cached for a short while by the browser.
    const response = await this.api.get(`/profile/${userId}`);
    // Expects { user: {user_id, github_username, ...}, profile: { personal, technical } }
    return response.data;
  }

  async getConnectionStatus(viewedUserId) {
    // This endpoint assumes your backend can identify the current user from the auth token.
    // It makes a GET request to an endpoint like /api/profile/connections/status/4
    const response = await this.api.get(
      `/profile/connections/status/${viewedUserId}`
    );

    // The backend should return a JSON object with the status, e.g., { status: 'pending' } or { status: null }
    return response.data;
  }

  async sendConnectionRequest(addresseeId) {
    // Calls POST /api/profile/connections/request
    const response = await this.api.post("/profile/connections/request", {
      addresseeId,
    });
    return response.data;
  }

  async getPendingRequests() {
    // Incoming requests for the current user
    // Calls GET /api/profile/connections/pending
    const response = await this.api.get("/profile/connections/pending");
    // Expects { pendingRequests: [{ id (connection_id), requester_id, requester_username, ... }, ...] }
    return response.data;
  }

  async getSentRequests() {
    // Outgoing requests sent by the current user
    // Calls GET /api/profile/connections/sent
    const response = await this.api.get("/profile/connections/sent");
    // Expects { sentRequests: [{ id (connection_id), addressee_id, addressee_username, ... }, ...] }
    return response.data;
  }

  async acceptConnectionRequest(requesterId) {
    // Calls POST /api/profile/connections/accept (no ID in path for MVP)
    // Body will contain { requesterId: ID_OF_USER_WHO_SENT_REQUEST }
    const response = await this.api.post("/profile/connections/accept", {
      requesterId,
    });
    return response.data;
  }

  async declineOrCancelRequest(connectionId) {
    // Calls DELETE /api/profile/connections/:connectionId/decline
    const response = await this.api.delete(
      `/profile/connections/${connectionId}/decline`
    );
    return response.data;
  }

  async getActiveConnections() {
    // Calls GET /api/profile/connections/active
    const response = await this.api.get("/profile/connections/active");
    // Expects { activeConnections: [{ id (user_id), github_username, ... }, ...] }
    return response.data;
  }

  // --- NEW: Job and CV Matching Methods ---

  /**
   * Fetches all job postings for the public job board.
   */
  async getAllJobs() {
    const response = await this.api.get("/jobs"); // Corresponds to GET /api/jobs
    return response.data;
  }

  /**
   * Fetches the current user's saved CV information (filename, last updated).
   */
  async getUserCvInfo() {
    const response = await this.api.get("/cv/info"); // A new endpoint to get CV metadata
    return response.data;
  }

  /**
   * Uploads a new CV file for the authenticated user.
   * @param {FormData} formData - The form data containing the CV file.
   */
  async uploadUserCv(formData) {
    const response = await this.api.post("/cv/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  /**
   * Triggers the job matching process for the authenticated user's saved CV.
   */
  async getMatchesForUser() {
    const response = await this.api.get("/cv/match");
    return response.data;
  }
}

export default new ApiService();
