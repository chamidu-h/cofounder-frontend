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
                const token = localStorage.getItem('auth_token'); // Corrected
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
                    localStorage.removeItem('auth_token'); // Corrected
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
        const includePrivateParam = includePrivate ? 'true' : 'false';
        return `${API_BASE}/auth/github?include_private=${includePrivateParam}`;
    }

    async getUser() {
        const response = await this.api.get('/auth/user');
        return response.data;
    }

    // --- Profile Routes ---
    async generateProfile() {
        const response = await this.api.post('/profile/generate', {});
        return response.data;
    }

    async saveProfile(profileDetails) {
        // Backend expects { profileData: { ... } }
        const response = await this.api.post('/profile/save', { profileData: profileDetails });
        return response.data;
    }

    async getSavedProfile() {
        // Aligned to match backend route: GET /api/profile/saved
        const response = await this.api.get('/profile/saved');
        return response.data;
    }

    async deleteProfile() {
        // Aligned to match backend route: DELETE /api/profile/saved
        const response = await this.api.delete('/profile/saved');
        return response.data;
    }
}

export default new ApiService();
