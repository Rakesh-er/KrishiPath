import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useSocketStore } from './store/socketStore';

import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddProduce from './pages/AddProduce';
import TrackProduce from './pages/TrackProduce';
import QRScan from './pages/QRScan';
import GovDashboard from './pages/GovDashboard';

function App() {
    const { isAuthenticated, user, token, hydrated, initializeAuth } = useAuthStore();
    const connect = useSocketStore((s) => s.connect);
    const disconnect = useSocketStore((s) => s.disconnect);

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    useEffect(() => {
        if (token) {
            connect(token);
        }
        return () => disconnect();
    }, [token, connect, disconnect]);

    if (!hydrated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Router>
                <Suspense fallback={<LoadingSpinner />}>
                    {isAuthenticated && <Navbar />}

                    <Routes>
                        <Route
                            path="/login"
                            element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />}
                        />

                        <Route
                            path="/dashboard"
                            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />}
                        />

                        <Route
                            path="/add-produce"
                            element={
                                isAuthenticated && user?.role === 'farmer' ? (
                                    <AddProduce />
                                ) : (
                                    <Navigate to="/dashboard" replace />
                                )
                            }
                        />

                        <Route
                            path="/track"
                            element={isAuthenticated ? <TrackProduce /> : <Navigate to="/login" replace />}
                        />

                        <Route path="/scan" element={<QRScan />} />

                        <Route path="/verify/:batchId" element={<QRScan />} />

                        <Route
                            path="/government"
                            element={
                                isAuthenticated && user?.role === 'government' ? (
                                    <GovDashboard />
                                ) : (
                                    <Navigate to="/dashboard" replace />
                                )
                            }
                        />

                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </Suspense>
            </Router>
        </div>
    );
}

export default App;
