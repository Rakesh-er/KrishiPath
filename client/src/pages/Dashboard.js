import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { useSocketStore } from '../store/socketStore';
import axios from 'axios';

const Dashboard = () => {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const { notifications, removeNotification } = useSocketStore();
    const [stats, setStats] = useState({
        totalBatches: 0,
        activeBatches: 0,
        completedTransactions: 0,
        rewardPoints: 0
    });
    const [recentBatches, setRecentBatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [batchesRes, transactionsRes] = await Promise.all([
                axios.get('/api/produce/list'),
                axios.get('/api/transaction/history')
            ]);

            const batches = batchesRes.data;
            const transactions = transactionsRes.data;

            setStats({
                totalBatches: batches.length,
                activeBatches: batches.filter(b => b.status !== 'sold' && b.status !== 'expired').length,
                completedTransactions: transactions.filter(t => t.status === 'confirmed').length,
                rewardPoints: user.rewardPoints
            });

            setRecentBatches(batches.slice(0, 5));
            setLoading(false);
        } catch (error) {
            console.error('Dashboard data fetch error:', error);
            setLoading(false);
        }
    };

    const getRoleSpecificActions = () => {
        switch (user.role) {
            case 'farmer':
                return [
                    { title: t('produce.addProduce'), href: '/add-produce', icon: '🌱' },
                    { title: 'View My Batches', href: '/track', icon: '📦' },
                    { title: 'Quality Assessment', href: '/quality', icon: '⭐' }
                ];
            case 'transporter':
                return [
                    { title: 'Pickup Batches', href: '/pickup', icon: '🚛' },
                    { title: 'Update Status', href: '/track', icon: '📍' },
                    { title: 'Route Optimization', href: '/routes', icon: '🗺️' }
                ];
            case 'retailer':
                return [
                    { title: 'Receive Batches', href: '/receive', icon: '🏪' },
                    { title: 'Release Payments', href: '/payments', icon: '💰' },
                    { title: 'Sales Analytics', href: '/analytics', icon: '📊' }
                ];
            case 'government':
                return [
                    { title: 'System Overview', href: '/government', icon: '🏛️' },
                    { title: 'Compliance Check', href: '/compliance', icon: '✅' },
                    { title: 'Reports', href: '/reports', icon: '📋' }
                ];
            default:
                return [
                    { title: t('produce.trackProduce'), href: '/track', icon: '🔍' },
                    { title: 'QR Scan', href: '/scan', icon: '📱' }
                ];
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    {t('dashboard.welcome')}, {user.name}!
                </h1>
                <p className="mt-2 text-gray-600">
                    {t('roles.' + user.role)} Dashboard
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">📦</span>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">{t('dashboard.totalBatches')}</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.totalBatches}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">🔄</span>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">{t('dashboard.activeBatches')}</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.activeBatches}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">💰</span>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">{t('dashboard.completedTransactions')}</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.completedTransactions}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">⭐</span>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">{t('dashboard.rewardPoints')}</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.rewardPoints}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Actions */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {getRoleSpecificActions().map((action, index) => (
                                    <a
                                        key={index}
                                        href={action.href}
                                        className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="text-2xl mr-3">{action.icon}</span>
                                        <span className="text-sm font-medium text-gray-900">{action.title}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">{t('dashboard.recentActivity')}</h3>
                        </div>
                        <div className="p-6">
                            {recentBatches.length > 0 ? (
                                <div className="space-y-4">
                                    {recentBatches.map((batch) => (
                                        <div key={batch._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900">{batch.produceName}</p>
                                                <p className="text-sm text-gray-500">Batch ID: {batch.batchId}</p>
                                                <p className="text-sm text-gray-500">
                                                    Status: <span className={`px-2 py-1 rounded-full text-xs ${batch.status === 'sold' ? 'bg-green-100 text-green-800' :
                                                            batch.status === 'in_transit' ? 'bg-yellow-100 text-yellow-800' :
                                                                batch.status === 'at_retailer' ? 'bg-blue-100 text-blue-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {t('status.' + batch.status)}
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">
                                                    {new Date(batch.createdAt).toLocaleDateString()}
                                                </p>
                                                <p className="text-sm font-medium">{batch.quantity} {batch.unit}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">No recent activity</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            {notifications.length > 0 && (
                <div className="fixed bottom-4 right-4 space-y-2 z-50">
                    {notifications.slice(-3).map((notification) => (
                        <div
                            key={notification.id}
                            className="bg-white border-l-4 border-green-500 rounded-lg shadow-lg p-4 max-w-sm"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(notification.timestamp).toLocaleTimeString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => removeNotification(notification.id)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
