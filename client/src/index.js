import React from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import App from './App';
import { SERVER_URL } from './config';
import './index.css';
import './i18n/config';

// Axios configuration
axios.defaults.baseURL = SERVER_URL;
axios.defaults.withCredentials = true;

// Add a request interceptor to handle errors and common tasks
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!error.response) {
            // Network error or CORS issue
            console.error('Network/CORS error:', error);
            // You could trigger a notification here if you had a notification system
        } else if (error.response.status === 401) {
            // Unauthorized - maybe clear local storage and redirect to login
            console.warn('Unauthorized access, redirecting to login...');
        }
        return Promise.reject(error);
    }
);

const el = document.getElementById('root');
const root = createRoot(el);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
