import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { QrReader } from 'react-qr-reader';
import axios from 'axios';

const QRScan = () => {
    const { batchId } = useParams();
    const { t } = useTranslation();
    const [scanResult, setScanResult] = useState(null);
    const [batchDetails, setBatchDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showScanner, setShowScanner] = useState(!batchId);

    useEffect(() => {
        if (batchId) {
            fetchBatchDetails(batchId);
        }
    }, [batchId]);

    const fetchBatchDetails = async (id) => {
        setLoading(true);
        setError('');

        try {
            const response = await axios.get(`/api/produce/${id}`);
            setBatchDetails(response.data);
        } catch (error) {
            setError(error.response?.data?.message || 'Batch not found');
        } finally {
            setLoading(false);
        }
    };

    const handleScan = (result, error) => {
        if (result) {
            try {
                const data = JSON.parse(result.text);
                if (data.batchId) {
                    setScanResult(data);
                    setShowScanner(false);
                    fetchBatchDetails(data.batchId);
                }
            } catch (e) {
                // If not JSON, treat as direct batch ID
                setScanResult({ batchId: result.text });
                setShowScanner(false);
                fetchBatchDetails(result.text);
            }
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

    const getQualityColor = (grade) => {
        switch (grade) {
            case 'A': return 'text-green-600';
            case 'B': return 'text-yellow-600';
            case 'C': return 'text-orange-600';
            default: return 'text-gray-600';
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        🔍 Produce Verification
                    </h1>
                    <p className="text-gray-600">Scan QR code to verify produce authenticity and track supply chain</p>
                </div>

                {showScanner && (
                    <div className="mb-8">
                        <div className="max-w-md mx-auto">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
                                Scan QR Code
                            </h3>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                <QrReader
                                    onResult={handleScan}
                                    style={{ width: '100%' }}
                                    constraints={{ facingMode: 'environment' }}
                                />
                            </div>
                            <p className="text-sm text-gray-500 text-center mt-2">
                                Position the QR code within the camera frame
                            </p>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <span className="text-red-600 text-2xl mr-3">❌</span>
                            <div>
                                <h3 className="text-lg font-medium text-red-800">Verification Failed</h3>
                                <p className="text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {batchDetails && (
                    <div className="space-y-6">
                        {/* Verification Status */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <span className="text-green-600 text-3xl mr-4">✅</span>
                                    <div>
                                        <h3 className="text-xl font-bold text-green-800">Verified Authentic</h3>
                                        <p className="text-green-700">This produce batch is legitimate and tracked on blockchain</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-green-600">Batch ID</p>
                                    <p className="font-mono text-lg font-bold text-green-800">{batchDetails.batchId}</p>
                                </div>
                            </div>
                        </div>

                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Product Information</h4>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-sm text-gray-500">Product Name:</span>
                                        <p className="font-medium text-gray-900">{batchDetails.produceName}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Quantity:</span>
                                        <p className="font-medium text-gray-900">{batchDetails.quantity} {batchDetails.unit}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Harvest Date:</span>
                                        <p className="font-medium text-gray-900">
                                            {new Date(batchDetails.harvestDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Current Status:</span>
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(batchDetails.status)}`}>
                                            {t('status.' + batchDetails.status)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-6">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Quality Information</h4>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-sm text-gray-500">Quality Grade:</span>
                                        <p className={`font-bold text-2xl ${getQualityColor(batchDetails.quality?.grade)}`}>
                                            Grade {batchDetails.quality?.grade || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Quality Score:</span>
                                        <div className="flex items-center">
                                            <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                                                <div
                                                    className="bg-green-600 h-2 rounded-full"
                                                    style={{ width: `${batchDetails.quality?.testResults?.qualityScore || 0}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-medium">
                                                {batchDetails.quality?.testResults?.qualityScore || 0}/100
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center">
                                            <span className={`w-3 h-3 rounded-full mr-2 ${batchDetails.quality?.testResults?.organicCertified ? 'bg-green-500' : 'bg-gray-300'
                                                }`}></span>
                                            <span className="text-sm text-gray-700">Organic Certified</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className={`w-3 h-3 rounded-full mr-2 ${!batchDetails.quality?.testResults?.pesticides ? 'bg-green-500' : 'bg-red-500'
                                                }`}></span>
                                            <span className="text-sm text-gray-700">Pesticide Free</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Farmer Information */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">👨‍🌾 Farmer Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-gray-500">Farmer Name:</span>
                                    <p className="font-medium text-gray-900">{batchDetails.farmerId?.name}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Contact:</span>
                                    <p className="font-medium text-gray-900">{batchDetails.farmerId?.email}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <span className="text-sm text-gray-500">Farm Location:</span>
                                    <p className="font-medium text-gray-900">{batchDetails.location?.address}</p>
                                </div>
                            </div>
                        </div>

                        {/* Supply Chain Timeline */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">🚛 Supply Chain Timeline</h4>
                            <div className="flow-root">
                                <ul className="-mb-8">
                                    {batchDetails.timeline?.map((event, eventIdx) => (
                                        <li key={eventIdx}>
                                            <div className="relative pb-8">
                                                {eventIdx !== batchDetails.timeline.length - 1 ? (
                                                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                                ) : null}
                                                <div className="relative flex space-x-3">
                                                    <div>
                                                        <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                                                            <span className="text-white text-sm">✓</span>
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                        <div>
                                                            <p className="text-sm text-gray-500">
                                                                Status updated to <span className="font-medium text-gray-900">{event.status}</span>
                                                            </p>
                                                            {event.notes && (
                                                                <p className="text-sm text-gray-500 mt-1">{event.notes}</p>
                                                            )}
                                                            {event.location && (
                                                                <p className="text-xs text-gray-400 mt-1">📍 {event.location}</p>
                                                            )}
                                                        </div>
                                                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                            <time dateTime={event.timestamp}>
                                                                {new Date(event.timestamp).toLocaleString()}
                                                            </time>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Blockchain Verification */}
                        {batchDetails.blockchainTxHash && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                <h4 className="text-lg font-medium text-blue-900 mb-4">🔗 Blockchain Verification</h4>
                                <div className="space-y-2">
                                    <div>
                                        <span className="text-sm text-blue-600">Transaction Hash:</span>
                                        <p className="font-mono text-sm text-blue-900 break-all">{batchDetails.blockchainTxHash}</p>
                                    </div>
                                    <div>
                                        <a
                                            href={`https://polygonscan.com/tx/${batchDetails.blockchainTxHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                                        >
                                            View on Blockchain Explorer
                                            <span className="ml-1">↗</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={() => {
                                    setShowScanner(true);
                                    setBatchDetails(null);
                                    setScanResult(null);
                                    setError('');
                                }}
                                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                                Scan Another QR Code
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Print Certificate
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QRScan;