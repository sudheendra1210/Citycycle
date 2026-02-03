import axios from 'axios';
import { supabase } from '../config/supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
            // Get current session
            const { data: { session } } = await supabase.auth.getSession();

            // Add token to headers if available
            if (session?.access_token) {
                config.headers.Authorization = `Bearer ${session.access_token}`;
            }
        } catch (error) {
            // If getting session fails, continue without auth token
            console.log('No active session');
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
