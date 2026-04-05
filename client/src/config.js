/**
 * Frontend API Integration:
 * - SERVER_URL: The base backend origin from .env (no trailing slash)
 * - API_URL: Full /api path for axios requests
 * - SOCKET_URL: Base URL for Socket.IO connection
 * All endpoints use the Render URL in production as specified in .env
 */
export const SERVER_URL =
    process.env.REACT_APP_SERVER_URL ||
    process.env.VITE_API_URL ||
    'http://localhost:5000';

export const API_URL = process.env.REACT_APP_API_URL || `${SERVER_URL.replace(/\/$/, '')}/api`;
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || SERVER_URL;

