import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';

const TrackProduce = () => {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [updateData, setUpdateData] = useState({
        status: '',
        location: '',
        notes: ''
    });
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            const response = await axios.get('/api/produce/list');
            setBatches(response.data);
        } catch (error) {
            console.error('Error fetching batches:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (batchId) => {
        setUpdating(true);
        try {
            await axios.put(`/api/produce/update/${batchId}`, updateData);

            // Refresh batches
            await fetchBatches();

            // Reset form
            setUpdateData({ status: '', location: '', notes: '' });
            setSelectedBatch(null);

        } catch (error) {
            console.error('Error updating status:', error);
            alert(error.response?.data?.message || 'Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const getStatusOptions = () => {
        switch (user.role) {
            case 'farmer':
                return [
                    { value: 'in_transit', label: 'Send to Transporter' }
                ];
            case 'transporter':
                return [
                    { value: 'in_transit', label: 'Picked up for Transport' },
                    { value: 'at_retailer', label: 'Delivered to Retailer' }
                ];
            case 'retailer':
                return [
                    { value: 'sold', label: 'Sold to Consumer' },
                    { value: 'expired', label: 'Mark as Expired' }
                ];
            default:
                return [];
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'harvested': return 'bg-green-100 text-green-800';
            case 'in_transit': return 'bg-yellow-100 text-yellow-800';
            case 'at_retailer': return 'bg-blue-100 text-blue-800';
            case 'sold': return 'bg-gray-100 text-gray-800';
            case 'expired': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
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
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">{t('produce.trackProduce')}</h1>
                <p className="mt-2 text-gray-600">Monitor and update your produce batches</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Batch List */}
                <div className="lg:col-span-2">
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Your Batches</h3>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {batches.length > 0 ? (
                                batches.map((batch) => (
                                    <div key={batch._id} className="p-6 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-lg font-medium text-gray-900">{batch.produceName}</h4>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(batch.status)}`}>
                                                        {t('status.' + batch.status)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1">Batch ID: {batch.batchId}</p>
                                                <div className="mt-2 flex items-center text-sm text-gray-500">
                                                    <span className="mr-4">📦 {batch.quantity} {batch.unit}</span>
                                                    <span className="mr-4">📅 {new Date(batch.harvestDate).toLocaleDateString()}</span>
                                                    {batch.pricePerUnit && (
                                                        <span>💰 ₹{batch.pricePerUnit}/{batch.unit}</span>
                                                    )}
                                                </div>
                                                {batch.location?.address && (
                                                    <p className="text-sm text-gray-500 mt-1">📍 {batch.location.address}</p>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                {getStatusOptions().length > 0 && (
                                                    <button
                                                        onClick={() => setSelectedBatch(batch)}
                                                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                                                    >
                                                        Update Status
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Timeline Preview */}
                                        {batch.timeline && batch.timeline.length > 0 && (
                                            <div className="mt-4 border-t pt-4">
                                                <h5 className="text-sm font-medium text-gray-900 mb-2">Recent Updates</h5>
                                                <div className="space-y-2">
                                                    {batch.timeline.slice(-2).map((event, idx) => (
                                                        <div key={idx} className="flex items-center text-sm">
                                                            <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                                                            <span className="text-gray-600">
                                                                {event.status} - {new Date(event.timestamp).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="text-gray-400 text-6xl mb-4">📦</div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No batches found</h3>
                                    <p className="text-gray-500 mb-4">You don't have any produce batches yet.</p>
                                    {user.role === 'farmer' && (
                                        <a
                                            href="/add-produce"
                                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                        >
                                            Add Your First Batch
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Update Panel */}
                <div className="lg:col-span-1">
                    {selectedBatch ? (
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Update Status
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Batch: {selectedBatch.produceName}
                                    </label>
                                    <p className="text-sm text-gray-500">ID: {selectedBatch.batchId}</p>
                                    <p className="text-sm text-gray-500">
                                        Current Status: <span className="font-medium">{t('status.' + selectedBatch.status)}</span>
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                                        New Status *
                                    </label>
                                    <select
                                        id="status"
                                        value={updateData.status}
                                        onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                                    >
                                        <option value="">Select new status</option>
                                        {getStatusOptions().map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        id="location"
                                        value={updateData.location}
                                        onChange={(e) => setUpdateData({ ...updateData, location: e.target.value })}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                                        placeholder="Current location"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                                        Notes
                                    </label>
                                    <textarea
                                        id="notes"
                                        rows="3"
                                        value={updateData.notes}
                                        onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                                        placeholder="Additional notes about this update"
                                    />
                                </div>

                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => handleStatusUpdate(selectedBatch.batchId)}
                                        disabled={!updateData.status || updating}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {updating ? 'Updating...' : 'Update Status'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedBatch(null);
                                            setUpdateData({ status: '', location: '', notes: '' });
                                        }}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Quick Actions
                            </h3>
                            <div className="space-y-3">
                                <a
                                    href="/scan"
                                    className="block w-full px-4 py-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center">
                                        <span className="text-2xl mr-3">📱</span>
                                        <div>
                                            <p className="font-medium text-gray-900">QR Scanner</p>
                                            <p className="text-sm text-gray-500">Verify produce authenticity</p>
                                        </div>
                                    </div>
                                </a>

                                {user.role === 'farmer' && (
                                    <a
                                        href="/add-produce"
                                        className="block w-full px-4 py-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center">
                                            <span className="text-2xl mr-3">🌱</span>
                                            <div>
                                                <p className="font-medium text-gray-900">Add New Batch</p>
                                                <p className="text-sm text-gray-500">Create new produce batch</p>
                                            </div>
                                        </div>
                                    </a>
                                )}

                                <div className="pt-4 border-t border-gray-200">
                                    <h4 className="font-medium text-gray-900 mb-2">Instructions</h4>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        <li>• Click on any batch to update its status</li>
                                        <li>• Use QR scanner to verify produce</li>
                                        <li>• All updates are tracked on blockchain</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
