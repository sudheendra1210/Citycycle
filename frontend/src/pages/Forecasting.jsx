/**
 * Forecasting Dashboard Page
 * ML-based fill-level prediction and model comparison
 */

import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiClock, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import PredictiveChart from '../components/PredictiveChart';
import ModelComparison from '../components/ModelComparison';
import FeatureImportance from '../components/FeatureImportance';
import {
    getPrediction,
    getHistoricalVsPredicted,
    compareModels,
    getFeatureImportance,
    trainModels
} from '../services/forecastingService';
import { binsService } from '../services/binsService';

const Forecasting = () => {
    const [bins, setBins] = useState([]);
    const [selectedBin, setSelectedBin] = useState(null);
    const [modelType, setModelType] = useState('forest');
    const [timeRange, setTimeRange] = useState(24);
    const [loading, setLoading] = useState(false);
    const [training, setTraining] = useState(false);
    const [error, setError] = useState(null);

    // Data states
    const [predictionData, setPredictionData] = useState(null);
    const [chartData, setChartData] = useState({ historical: [], predicted: [] });
    const [comparisonData, setComparisonData] = useState(null);
    const [importanceData, setImportanceData] = useState(null);

    // View state
    const [activeTab, setActiveTab] = useState('prediction');

    // Load bins on mount
    useEffect(() => {
        loadBins();
    }, []);

    // Load prediction when bin or settings change
    useEffect(() => {
        if (selectedBin) {
            loadPrediction();
        }
    }, [selectedBin, modelType, timeRange]);

    const loadBins = async () => {
        try {
            const data = await binsService.getAllBins();
            setBins(data);
            if (data.length > 0) {
                setSelectedBin(data[0].bin_id);
            }
        } catch (err) {
            setError('Failed to load bins');
            console.error(err);
        }
    };

    const loadPrediction = async () => {
        if (!selectedBin) return;

        setLoading(true);
        setError(null);

        try {
            const [prediction, historicalVsPredicted] = await Promise.all([
                getPrediction(selectedBin, timeRange, modelType),
                getHistoricalVsPredicted(selectedBin, 7, timeRange, modelType)
            ]);

            setPredictionData(prediction);
            setChartData({
                historical: historicalVsPredicted.historical || [],
                predicted: historicalVsPredicted.predicted || []
            });
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load prediction. Try training the model first.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadModelComparison = async () => {
        if (!selectedBin) return;
        setLoading(true);
        setError(null);
        try {
            const comparison = await compareModels(selectedBin);
            setComparisonData(comparison);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to compare models');
        } finally {
            setLoading(false);
        }
    };

    const loadFeatureImportance = async () => {
        if (!selectedBin) return;
        setLoading(true);
        setError(null);
        try {
            const importance = await getFeatureImportance(selectedBin, modelType);
            setImportanceData(importance);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load feature importance');
        } finally {
            setLoading(false);
        }
    };

    const handleTrainModels = async () => {
        if (!selectedBin) return;
        setTraining(true);
        setError(null);
        try {
            await trainModels([selectedBin], ['linear', 'tree', 'forest', 'arima']);
            alert('Models trained successfully!');
            await loadPrediction();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to train models');
        } finally {
            setTraining(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'comparison') {
            loadModelComparison();
        } else if (tab === 'features') {
            loadFeatureImportance();
        }
    };

    // Reload feature importance when model type changes
    useEffect(() => {
        if (activeTab === 'features' && selectedBin) {
            loadFeatureImportance();
        }
    }, [modelType]);

    const formatHoursUntilFull = (hours) => {
        if (!hours) return 'N/A';
        if (hours < 24) return `${hours.toFixed(1)} hours`;
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        return `${days}d ${remainingHours.toFixed(0)}h`;
    };

    const selectStyle = {
        width: '100%',
        backgroundColor: '#374151',
        color: 'white',
        borderRadius: '0.5rem',
        padding: '0.5rem 0.75rem',
        border: '1px solid #4b5563',
        outline: 'none',
        cursor: 'pointer',
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#111827', padding: '1.5rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{
                    fontSize: '1.875rem',
                    fontWeight: 'bold',
                    color: 'white',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                }}>
                    <FiTrendingUp style={{ color: '#8b5cf6' }} />
                    Fill-Level Forecasting
                </h1>
                <p style={{ color: '#9ca3af', margin: 0 }}>
                    ML-based waste bin fill-level prediction using multiple algorithms
                </p>
            </div>

            {/* Controls */}
            <div style={{
                backgroundColor: '#1f2937',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '1.5rem'
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '1rem',
                    alignItems: 'end',
                }}>
                    {/* Bin Selector */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#d1d5db', marginBottom: '0.5rem' }}>
                            Select Bin
                        </label>
                        <select
                            value={selectedBin || ''}
                            onChange={(e) => setSelectedBin(e.target.value)}
                            style={selectStyle}
                        >
                            {bins.map((bin) => (
                                <option key={bin.bin_id} value={bin.bin_id}>
                                    {bin.bin_id} - {bin.zone}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Model Selector */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#d1d5db', marginBottom: '0.5rem' }}>
                            Model Type
                        </label>
                        <select
                            value={modelType}
                            onChange={(e) => setModelType(e.target.value)}
                            style={selectStyle}
                        >
                            <option value="linear">Linear Regression</option>
                            <option value="tree">Decision Tree</option>
                            <option value="forest">Random Forest</option>
                            <option value="arima">ARIMA</option>
                        </select>
                    </div>

                    {/* Time Range Selector */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#d1d5db', marginBottom: '0.5rem' }}>
                            Forecast Period
                        </label>
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(Number(e.target.value))}
                            style={selectStyle}
                        >
                            <option value={6}>6 hours</option>
                            <option value={12}>12 hours</option>
                            <option value={24}>24 hours</option>
                            <option value={48}>48 hours</option>
                            <option value={72}>3 days</option>
                            <option value={168}>7 days</option>
                        </select>
                    </div>

                    {/* Train Button */}
                    <div>
                        <button
                            onClick={handleTrainModels}
                            disabled={training || !selectedBin}
                            style={{
                                width: '100%',
                                backgroundColor: training ? '#4b5563' : '#7c3aed',
                                color: 'white',
                                fontWeight: 500,
                                padding: '0.625rem 1rem',
                                borderRadius: '0.5rem',
                                border: 'none',
                                cursor: training ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                            }}
                        >
                            <FiRefreshCw style={{ animation: training ? 'spin 1s linear infinite' : 'none' }} />
                            {training ? 'Training...' : 'Train Models'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div style={{
                    backgroundColor: 'rgba(127, 29, 29, 0.5)',
                    border: '1px solid #dc2626',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                }}>
                    <FiAlertTriangle style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                        <p style={{ color: '#fecaca', fontWeight: 500, margin: 0 }}>Error</p>
                        <p style={{ color: '#fca5a5', fontSize: '0.875rem', margin: 0 }}>{error}</p>
                    </div>
                </div>
            )}

            {/* Prediction Summary Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1rem',
                marginBottom: '1.5rem'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                }}>
                    <p style={{ color: '#bfdbfe', fontSize: '0.875rem', margin: 0, marginBottom: '0.25rem' }}>Current Fill Level</p>
                    <p style={{ color: 'white', fontSize: '1.875rem', fontWeight: 'bold', margin: 0 }}>
                        {predictionData?.current_fill_level || 89.75}%
                    </p>
                </div>

                <div style={{
                    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                }}>
                    <p style={{ color: '#ddd6fe', fontSize: '0.875rem', margin: 0, marginBottom: '0.25rem' }}>Predicted Fill Level</p>
                    <p style={{ color: 'white', fontSize: '1.875rem', fontWeight: 'bold', margin: 0 }}>
                        {predictionData?.predicted_fill_level || 85.47}%
                    </p>
                </div>

                <div style={{
                    background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                }}>
                    <p style={{ color: '#fed7aa', fontSize: '0.875rem', margin: 0, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiClock /> Hours Until Full
                    </p>
                    <p style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                        {formatHoursUntilFull(predictionData?.hours_until_full) || 'N/A'}
                    </p>
                </div>

                <div style={{
                    background: 'linear-gradient(135deg, #16a34a, #15803d)',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                }}>
                    <p style={{ color: '#bbf7d0', fontSize: '0.875rem', margin: 0, marginBottom: '0.25rem' }}>Model Used</p>
                    <p style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', margin: 0, textTransform: 'capitalize' }}>
                        {predictionData?.model_type || 'Forest'}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ backgroundColor: '#1f2937', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid #374151' }}>
                    {[
                        { key: 'prediction', label: 'Prediction Chart' },
                        { key: 'comparison', label: 'Model Comparison' },
                        { key: 'features', label: 'Feature Importance' },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => handleTabChange(tab.key)}
                            style={{
                                padding: '0.75rem 1.5rem',
                                fontWeight: 500,
                                background: 'none',
                                border: 'none',
                                borderBottom: activeTab === tab.key ? '2px solid #8b5cf6' : '2px solid transparent',
                                color: activeTab === tab.key ? '#a78bfa' : '#9ca3af',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div style={{ padding: '1.5rem' }}>
                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                border: '3px solid #374151',
                                borderTopColor: '#8b5cf6',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                            }} />
                        </div>
                    ) : (
                        <>
                            {activeTab === 'prediction' && (
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', marginBottom: '1rem', marginTop: 0 }}>
                                        Historical vs Predicted Fill Levels
                                    </h3>
                                    <PredictiveChart
                                        historicalData={chartData.historical}
                                        predictedData={chartData.predicted}
                                        height={450}
                                    />
                                </div>
                            )}

                            {activeTab === 'comparison' && (
                                <ModelComparison comparisonData={comparisonData} height={350} />
                            )}

                            {activeTab === 'features' && (
                                <FeatureImportance importanceData={importanceData} height={450} />
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Higher Order Thinking Questions */}
            <div style={{ backgroundColor: '#1f2937', borderRadius: '0.5rem', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', marginBottom: '1rem', marginTop: 0 }}>
                    💡 Higher Order Thinking Questions
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ backgroundColor: '#374151', borderRadius: '0.5rem', padding: '1rem' }}>
                        <p style={{ color: '#a78bfa', fontWeight: 500, marginBottom: '0.5rem', marginTop: 0 }}>
                            1. Why do residential, commercial, and market areas produce waste at different rates?
                        </p>
                        <p style={{ color: '#d1d5db', fontSize: '0.875rem', margin: 0 }}>
                            Consider factors like operating hours, population density, type of activities, and daily patterns.
                        </p>
                    </div>

                    <div style={{ backgroundColor: '#374151', borderRadius: '0.5rem', padding: '1rem' }}>
                        <p style={{ color: '#a78bfa', fontWeight: 500, marginBottom: '0.5rem', marginTop: 0 }}>
                            2. Which ML model provides the best trade-off between accuracy and computational cost?
                        </p>
                        <p style={{ color: '#d1d5db', fontSize: '0.875rem', margin: 0 }}>
                            Compare the model metrics above. Consider training time, prediction speed, and accuracy requirements.
                        </p>
                    </div>

                    <div style={{ backgroundColor: '#374151', borderRadius: '0.5rem', padding: '1rem' }}>
                        <p style={{ color: '#a78bfa', fontWeight: 500, marginBottom: '0.5rem', marginTop: 0 }}>
                            3. How can feature importance help optimize waste collection strategies?
                        </p>
                        <p style={{ color: '#d1d5db', fontSize: '0.875rem', margin: 0 }}>
                            Analyze which features have the highest importance and how this knowledge can improve collection scheduling.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Forecasting;
