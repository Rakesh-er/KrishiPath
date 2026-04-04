/** Backend origin (no trailing path). Used for axios and Socket.IO. */
export const SERVER_URL =
    (typeof process !== 'undefined' && process.env.REACT_APP_SERVER_URL) ||
    'http://localhost:5000';

export const API_URL = `${SERVER_URL.replace(/\/$/, '')}/api`;
