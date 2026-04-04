import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../config';

export const useAuthStore = create((set, get) => ({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    /** False until `initializeAuth` has finished (persisted session or not). */
    hydrated: false,

    login: async (email, password) => {
        set({ loading: true });
        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                email,
                password
            });

            const { token, user } = response.data;
            localStorage.setItem('token', token);

            // Set axios default auth header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            set({
                user,
                token,
                isAuthenticated: true,
                loading: false
            });

            return { success: true };
        } catch (error) {
            set({ loading: false });
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    },

    register: async (userData) => {
        set({ loading: true });
        try {
            const response = await axios.post(`${API_URL}/auth/register`, userData);
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            set({
                user,
                token,
                isAuthenticated: true,
                loading: false
            });

            return { success: true };
        } catch (error) {
            set({ loading: false });
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        set({
            user: null,
            token: null,
            isAuthenticated: false
        });
    },

    initializeAuth: async () => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            try {
                const response = await axios.get(`${API_URL}/auth/profile`);
                set({
                    user: response.data,
                    token,
                    isAuthenticated: true,
                    hydrated: true
                });
            } catch {
                localStorage.removeItem('token');
                delete axios.defaults.headers.common['Authorization'];
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    hydrated: true
                });
            }
        } else {
            set({ hydrated: true });
        }
    }
}));