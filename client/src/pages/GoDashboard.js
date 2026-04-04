import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const GovDashboard = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState({
        totalBatches: 0,
        activeFarms: 0,
        totalTransactions: 0,
        complianceRate: 0
    });
    const [recentBatches, setRecentBatches] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGovData();
    }, []);

    const fetchGovData = async () => {
        try {
            const [batchesRes, transactionsRes] = await Promise.all([
                axios.get('/api/produce/list'),
                axios.get('/api/transaction/history')
            ]);

            const batches = batchesRes.data;
            const transactions = transactionsRes.data;

            // Calculate stats
            const uniqueFarmers = new Set(batches.map(b => b.farmerId?._id)).size;
            const compliantBatches = batches.filter(b =>
                b.quality?.testResults?.qualityScore >= 70 &&
                !b.quality?.testResults?.pesticides
            ).length;

            setStats({
                totalBatches: batches.length,
                activeFarms: uniqueFarmers,
                totalTransactions: transactions.length,
                complianceRate: batches.length > 0 ? Math.round((compliantBatches / batches.length) * 100) : 0
            });

            setRecentBatches(batches.slice(0, 10));

            // Generate alerts for non-compliant batches
            const nonCompliantBatches = batches.filter(b =>
                b.quality?.testResults?.qualityScore < 70 ||
                b.quality?.testResults?.pesticides
            );

            setAlerts(nonCompliantBatches.slice(0, 5).map(batch => ({
                id: batch._id,
                type: 'compliance',
                message: `Low quality batch detected: ${batch.produceName} (${batch.batchId})`,
                severity: batch.quality?.testResults?.pesticides ? 'high' : 'medium',
                batchId: batch.batchId
            })));

        } catch (error) {
            console.error('Error fetching government data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getAlertColor = (severity) => {
        switch (severity) {
            case 'high': return 'bg-red-50 border-red-200 text-red-800';
            case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'low': return 'bg-blue-50 border-blue-200 text-blue-800';
            default: return 'bg-gray-50 border-gray-200 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">🏛️ Government Dashboard</h1>
                <p className="mt-2 text-gray-600">Agricultural supply chain oversight and compliance monitoring</p>
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
                            <p className="text-sm font-medium text-gray-500">Total Batches</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.totalBatches}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">🏪</span>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Active Farms</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.activeFarms}</p>
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
                            <p className="text-sm font-medium text-gray-500">Blockchain Transactions</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.totalTransactions}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${stats.complianceRate >= 80 ? 'bg-green-500' : stats.complianceRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}>
                                <span className="text-white text-sm font-bold">✓</span>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Compliance Rate</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.complianceRate}%</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Alerts Panel */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">🚨 Compliance Alerts</h3>
                        </div>
                        <div className="p-6">
                            {alerts.length > 0 ? (
                                <div className="space-y-4">
                                    {alerts.map((alert) => (
                                        <div key={alert.id} className={`p-4 rounded-lg border ${getAlertColor(alert.severity)}`}>
                                            <div className="flex items-start">
                                                <span className="text-lg mr-2">
                                                    {alert.severity === 'high' ? '🔴' : alert.severity === 'medium' ? '🟡' : '🔵'}
                                                </span>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{alert.message}</p>
                                                    <p className="text-xs mt-1 opacity-75">
                                                        Severity: {alert.severity.toUpperCase()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-green-500 text-4xl mb-2">✅</div>
                                    <p className="text-gray-500">No compliance alerts</p>
                                    <p className="text-sm text-gray-400">All batches meet quality standards</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg shadow mt-6">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-3">
                                <button className="w-full flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <span className="text-2xl mr-3">📊</span>
                                    <div className="text-left">
                                        <p className="font-medium text-gray-900">Generate Report</p>
                                        <p className="text-sm text-gray-500">Export compliance data</p>
                                    </div>
                                </button>

                                <button className="w-full flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <span className="text-2xl mr-3">🔍</span>
                                    <div className="text-left">
                                        <p className="font-medium text-gray-900">Audit Trail</p>
                                        <p className="text-sm text-gray-500">View transaction history</p>
                                    </div>
                                </button>

                                <button className="w-full flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <span className="text-2xl mr-3">⚙️</span>
                                    <div className="text-left">
                                        <p className="font-medium text-gray-900">Settings</p>
                                        <p className="text-sm text-gray-500">Configure compliance rules</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Batches */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Recent Produce Batches</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Batch Info
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Farmer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Quality
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {recentBatches.map((batch) => (
                                        <tr key={batch._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{batch.produceName}</p>
                                                    <p className="text-sm text-gray-500">{batch.batchId}</p>
                                                    <p className="text-xs text-gray-400">
                                                        {batch.quantity} {batch.unit}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <p className="text-sm text-gray-900">{batch.farmerId?.name}</p>
                                                    <p className="text-sm text-gray-500">{batch.farmerId?.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${batch.status === 'sold' ? 'bg-green-100 text-green-800' :
                                                        batch.status === 'in_transit' ? 'bg-yellow-100 text-yellow-800' :
                                                            batch.status === 'at_retailer' ? 'bg-blue-100 text-blue-800' :
                                                                batch.status === 'expired' ? 'bg-red-100 text-red-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {batch.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className={`text-sm font-medium ${batch.quality?.grade === 'A' ? 'text-green-600' :
                                                            batch.quality?.grade === 'B' ? 'text-yellow-600' :
                                                                'text-red-600'
                                                        }`}>
                                                        Grade {batch.quality?.grade || 'N/A'}
                                                    </span>
                                                    <div className="ml-2">
                                                        {batch.quality?.testResults?.pesticides && (
                                                            <span className="text-red-500 text-xs">⚠️</span>
                                                        )}
                                                        {batch.quality?.testResults?.organicCertified && (
                                                            <span className="text-green-500 text-xs">🌿</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    Score: {batch.quality?.testResults?.qualityScore || 0}/100
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button className="text-blue-600 hover:text-blue-900 mr-2">
                                                    View
                                                </button>
                                                <button className="text-red-600 hover:text-red-900">
                                                    Flag
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GovDashboard;