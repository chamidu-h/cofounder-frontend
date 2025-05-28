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
                const token = localStorage.getItem('auth_token');
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
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    console.warn('[ApiService] Auth error, removing token and redirecting:', error.response.status);
                    localStorage.removeItem('auth_token');
                    if (window.location.pathname !== '/') {
                        window.location.href = '/'; // Redirect to home
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    // --- Auth Routes ---
    getGithubAuthUrl(includePrivate = false) {
        // This constructs the URL; the component will do the redirect.
        const includePrivateParam = includePrivate ? 'true' : 'false';
        return `${API_BASE}/auth/github?include_private=${includePrivateParam}`;
    }

    async getUser() {
        // Corresponds to GET /api/auth/user
        const response = await this.api.get('/auth/user');
        return response.data; // Expects backend to send { user, generationCount, hasSavedProfile, canGenerate }
    }

    // --- Profile Routes ---
    async generateProfile() {
        // Corresponds to POST /api/profile/generate
        // Assuming this endpoint doesn't require a request body for generation trigger
        const response = await this.api.post('/profile/generate', {}); // Empty body if none needed
        // Expects backend to send { profile: { personal, technical }, autoSaved?, newGenerationCount? }
        return response.data;
    }

    async saveProfile(profileDetails) {
        // Corresponds to POST /api/profile/save
        // Your ProfileGeneration.js was sending { profileData: profile }
        // Let's stick to that structure as the backend might expect it.
        const response = await this.api.post('/profile/save', { profileData: profileDetails });
        return response.data; // Expects backend to send success/updated profile message
    }

    async getSavedProfile() {
        // Corresponds to GET /api/profile (to get the currently saved profile)
        // Changed from /profile/saved to align with common single resource GET
        // Ensure your backend route for getting a saved profile is GET /api/profile
        const response = await this.api.get('/profile');
        // Expects backend to send { id, user_id, profile_data: { personal, technical }, ... }
        return response.data;
    }

    async deleteProfile() {
        // Corresponds to DELETE /api/profile/delete
        // Changed from /profile/saved to be more specific for delete action
        // Ensure your backend route for deleting a profile is DELETE /api/profile/delete
        const response = await this.api.delete('/profile/delete');
        return response.data; // Expects backend to send success message
    }
}

export default new ApiService();
