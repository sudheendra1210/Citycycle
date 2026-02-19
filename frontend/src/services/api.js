import axios from 'axios';
// No longer using Supabase for auth

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
    async (config) => {
        try {
            // Try Clerk token first
            if (window.Clerk?.session) {
                const token = await window.Clerk.session.getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                    return config;
                }
            }
            // Fallback to backend token (phone auth)
            const backendToken = localStorage.getItem('citycycle_token');
            if (backendToken) {
                config.headers.Authorization = `Bearer ${backendToken}`;
            }
        } catch (error) {
            console.error('Error fetching auth token:', error);
            // Still try backend token on Clerk error
            const backendToken = localStorage.getItem('citycycle_token');
            if (backendToken) {
                config.headers.Authorization = `Bearer ${backendToken}`;
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);

        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
            // Token expired or invalid - could redirect to login
            console.warn('Authentication required');
        }

        return Promise.reject(error);
    }
);

export default api;
