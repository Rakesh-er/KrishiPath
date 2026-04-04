import React from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import App from './App';
import { SERVER_URL } from './config';
import './index.css';
import './i18n/config';

axios.defaults.baseURL = SERVER_URL;

const el = document.getElementById('root');
const root = createRoot(el);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
