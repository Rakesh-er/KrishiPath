import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useSocketStore } from './store/socketStore';
import './i18n/config';

// Components
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddProduce from './pages/AddProduce';
import TrackProduce from './pages/TrackProduce';
import QRScan from './pages/QRScan';
import GovDashboard from './pages/GovDashboard';

function App() {
    const { isAuthenticated, user } = useAuthStore();

    // Initialize socket connection
    useSocketStore();

    return (
        <div className="min-h-screen bg-gray-50">
            <Router>
                <Suspense fallback={<LoadingSpinner />}>
                    {isAuthenticated && <Navbar />}

                    <Routes>
                        <Route
                            path="/login"
                            element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />}
                        />

                        <Route
                            path="/dashboard"
                            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
                        />

                        <Route
                            path="/add-produce"
                            element={isAuthenticated && user?.role === 'farmer' ? <AddProduce /> : <Navigate to="/dashboard" />}
                        />

                        <Route
                            path="/track"
                            element={isAuthenticated ? <TrackProduce /> : <Navigate to="/login" />}
                        />

                        <Route
                            path="/scan"
                            element={<QRScan />}
                        />

                        <Route
                            path="/verify/:batchId"
                            element={<QRScan />}
                        />

                        <Route
                            path="/government"
                            element={isAuthenticated && user?.role === 'government' ? <GovDashboard /> : <Navigate to="/dashboard" />}
                        />

                        <Route path="/" element={<Navigate to="/dashboard" />} />
                    </Routes>
                </Suspense>
            </Router>
        </div>
    );
}

export default App;