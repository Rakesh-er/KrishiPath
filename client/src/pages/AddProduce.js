import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddProduce = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        produceName: '',
        quantity: '',
        unit: 'kg',
        harvestDate: '',
        location: {
            latitude: '',
            longitude: '',
            address: ''
        },
        quality: {
            grade: 'A',
            certifications: [],
            testResults: {
                pesticides: false,
                organicCertified: false,
                qualityScore: 85
            }
        },
        pricePerUnit: ''
    });
    const [message, setMessage] = useState('');
    const [qrCode, setQrCode] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            if (parent === 'quality' && child === 'testResults') {
                const [, , field] = name.split('.');
                setFormData(prev => ({
                    ...prev,
                    quality: {
                        ...prev.quality,
                        testResults: {
                            ...prev.quality.testResults,
                            [field]: type === 'checkbox' ? checked : value
                        }
                    }
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    [parent]: {
                        ...prev[parent],
                        [child]: value
                    }
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        location: {
                            ...prev.location,
                            latitude: position.coords.latitude.toString(),
                            longitude: position.coords.longitude.toString()
                        }
                    }));
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    setMessage('Unable to get current location');
                }
            );
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await axios.post('/api/produce/add', formData);

            setMessage(t('notifications.produceAdded'));
            setQrCode(response.data.qrCode);

            // Reset form
            setFormData({
                produceName: '',
                quantity: '',
                unit: 'kg',
                harvestDate: '',
                location: { latitude: '', longitude: '', address: '' },
                quality: {
                    grade: 'A',
                    certifications: [],
                    testResults: {
                        pesticides: false,
                        organicCertified: false,
                        qualityScore: 85
                    }
                },
                pricePerUnit: ''
            });

        } catch (error) {
            setMessage(error.response?.data?.message || 'Failed to add produce');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">{t('produce.addProduce')}</h1>
                    <p className="text-gray-600">Create a new produce batch with QR code tracking</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>

                            <div>
                                <label htmlFor="produceName" className="block text-sm font-medium text-gray-700">
                                    {t('produce.produceName')} *
                                </label>
                                <input
                                    type="text"
                                    id="produceName"
                                    name="produceName"
                                    required
                                    value={formData.produceName}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                                    placeholder="e.g., Organic Tomatoes"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                                        {t('produce.quantity')} *
                                    </label>
                                    <input
                                        type="number"
                                        id="quantity"
                                        name="quantity"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                                        {t('produce.unit')}
                                    </label>
                                    <select
                                        id="unit"
                                        name="unit"
                                        value={formData.unit}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                                    >
                                        <option value="kg">Kilograms (kg)</option>
                                        <option value="tons">Tons</option>
                                        <option value="boxes">Boxes</option>
                                        <option value="pieces">Pieces</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="harvestDate" className="block text-sm font-medium text-gray-700">
                                    {t('produce.harvestDate')} *
                                </label>
                                <input
                                    type="date"
                                    id="harvestDate"
                                    name="harvestDate"
                                    required
                                    value={formData.harvestDate}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="pricePerUnit" className="block text-sm font-medium text-gray-700">
                                    {t('produce.pricePerUnit')} (₹)
                                </label>
                                <input
                                    type="number"
                                    id="pricePerUnit"
                                    name="pricePerUnit"
                                    min="0"
                                    step="0.01"
                                    value={formData.pricePerUnit}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                                />
                            </div>
                        </div>

                        {/* Location and Quality */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900">Location & Quality</h3>

                            <div>
                                <label htmlFor="location.address" className="block text-sm font-medium text-gray-700">
                                    Farm Address *
                                </label>
                                <textarea
                                    id="location.address"
                                    name="location.address"
                                    required
                                    rows="3"
                                    value={formData.location.address}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                                    placeholder="Enter your farm address"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="location.latitude" className="block text-sm font-medium text-gray-700">
                                        Latitude
                                    </label>
                                    <input
                                        type="number"
                                        id="location.latitude"
                                        name="location.latitude"
                                        step="any"
                                        value={formData.location.latitude}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="location.longitude" className="block text-sm font-medium text-gray-700">
                                        Longitude
                                    </label>
                                    <input
                                        type="number"
                                        id="location.longitude"
                                        name="location.longitude"
                                        step="any"
                                        value={formData.location.longitude}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={getCurrentLocation}
                                className="text-sm text-green-600 hover:text-green-500"
                            >
                                📍 Use Current Location
                            </button>

                            <div>
                                <label htmlFor="quality.grade" className="block text-sm font-medium text-gray-700">
                                    Quality Grade
                                </label>
                                <select
                                    id="quality.grade"
                                    name="quality.grade"
                                    value={formData.quality.grade}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                                >
                                    <option value="A">Grade A (Premium)</option>
                                    <option value="B">Grade B (Standard)</option>
                                    <option value="C">Grade C (Basic)</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="quality.testResults.qualityScore" className="block text-sm font-medium text-gray-700">
                                    Quality Score (0-100)
                                </label>
                                <input
                                    type="range"
                                    id="quality.testResults.qualityScore"
                                    name="quality.testResults.qualityScore"
                                    min="0"
                                    max="100"
                                    value={formData.quality.testResults.qualityScore}
                                    onChange={handleChange}
                                    className="mt-1 block w-full"
                                />
                                <div className="text-center text-sm text-gray-600 mt-1">
                                    {formData.quality.testResults.qualityScore}/100
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="quality.testResults.organicCertified"
                                        checked={formData.quality.testResults.organicCertified}
                                        onChange={handleChange}
                                        className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Organic Certified</span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="quality.testResults.pesticides"
                                        checked={formData.quality.testResults.pesticides}
                                        onChange={handleChange}
                                        className="rounded border-gray-300 text-red-600 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Pesticide Residue Detected</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-md ${message.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {message}
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            {t('common.cancel')}
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                            {loading ? t('common.loading') : t('common.submit')}
                        </button>
                    </div>
                </form>

                {/* QR Code Display */}
                {qrCode && (
                    <div className="mt-8 p-6 bg-green-50 rounded-lg">
                        <h3 className="text-lg font-medium text-green-900 mb-4">
                            🎉 Batch Created Successfully!
                        </h3>
                        <div className="flex flex-col items-center">
                            <img src={qrCode} alt="Batch QR Code" className="w-48 h-48 border-2 border-green-200 rounded-lg" />
                            <p className="mt-4 text-sm text-green-700 text-center">
                                Share this QR code for batch verification and tracking
                            </p>
                            <div className="mt-4 flex space-x-4">
                                <button
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.download = `batch-qr-${Date.now()}.png`;
                                        link.href = qrCode;
                                        link.click();
                                    }}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                                >
                                    Download QR Code
                                </button>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700"
                                >
                                    Back to Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
