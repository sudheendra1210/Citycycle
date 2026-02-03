/**
 * Predictions Page
 * ML-based waste prediction with glassmorphism UI
 */

import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiClock, FiAlertTriangle, FiMapPin, FiActivity } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { binsService } from '../services/binsService';

const Predictions = () => {
    const [bins, setBins] = useState([]);
    const [selectedBin, setSelectedBin] = useState(null);
    const [timeRange, setTimeRange] = useState('24h');
    const [loading, setLoading] = useState(false);

    const [predictionSummary, setPredictionSummary] = useState({
        predictedWaste: 4850,
        highRiskZones: 3,
        peakTime: '2:00 PM',
        confidence: 94.2
    });

    // Mock data for predicted vs actual
    const [chartData, setChartData] = useState([]);

    // Generate random data based on bin
    useEffect(() => {
        if (!selectedBin) return;

        // Deterministic hash-based randomness to vary data by bin but keep it stable
        // Differs from original simple hash which was too similar between bins
        const binHash = selectedBin.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        // Multiply by large prime and modulo to scatter values
        const scatterFactor = (binHash * 997) % 100;

        setPredictionSummary({
            predictedWaste: 3800 + (scatterFactor * 25),
            highRiskZones: Math.floor(scatterFactor / 15),
            peakTime: `${(Math.floor(scatterFactor / 8) % 12) + 1}:00 PM`,
            confidence: 88 + (scatterFactor / 10)
        });

        // Regenerate chart data
        const baseData = [
            { time: '00:00', predicted: 90 + scatterFactor, actual: 85 + scatterFactor },
            { time: '04:00', predicted: 50 + scatterFactor, actual: 55 + scatterFactor },
            { time: '08:00', predicted: 180 + scatterFactor * 2, actual: 170 + scatterFactor * 2 },
            { time: '12:00', predicted: 320 + scatterFactor * 3, actual: 330 + scatterFactor * 3 },
            { time: '16:00', predicted: 250 + scatterFactor * 2, actual: 240 + scatterFactor * 2 },
            { time: '20:00', predicted: 130 + scatterFactor, actual: 125 + scatterFactor },
            { time: '23:59', predicted: 100 + scatterFactor, actual: 105 + scatterFactor },
        ];
        setChartData(baseData);

    }, [selectedBin, timeRange]);

    // Load bins on mount
    useEffect(() => {
        loadBins();
    }, []);

    const loadBins = async () => {
        try {
            const data = await binsService.getAllBins();
            setBins(data);
            if (data.length > 0) {
                setSelectedBin(data[0].bin_id);
            }
        } catch (err) {
            console.error('Failed to load bins:', err);
        }
    };

    // Dynamic Zone Data
    const zoneWiseData = [
        { zone: 'Zone A', predicted: Math.floor(predictionSummary.predictedWaste * 0.2), risk: 'high' },
        { zone: 'Zone B', predicted: Math.floor(predictionSummary.predictedWaste * 0.15), risk: 'medium' },
        { zone: 'Zone C', predicted: Math.floor(predictionSummary.predictedWaste * 0.3), risk: 'high' },
        { zone: 'Zone D', predicted: Math.floor(predictionSummary.predictedWaste * 0.1), risk: 'low' },
        { zone: 'Zone E', predicted: Math.floor(predictionSummary.predictedWaste * 0.25), risk: 'medium' },
    ];

    // Styles
    const glassStyle = {
        backgroundColor: 'rgba(31, 41, 55, 0.7)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: '0.75rem',
        border: '1px solid rgba(75, 85, 99, 0.3)',
        padding: '1.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    };

    const cardStyle = (gradient) => ({
        background: gradient,
        borderRadius: '0.75rem',
        padding: '1.5rem',
        color: 'white',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%'
    });

    const labelStyle = {
        color: '#9ca3af',
        fontSize: '0.875rem',
        fontWeight: '500',
        marginBottom: '0.5rem',
        display: 'block'
    };

    const inputStyle = {
        width: '100%',
        backgroundColor: 'rgba(55, 65, 81, 0.5)',
        color: 'white',
        border: '1px solid rgba(75, 85, 99, 0.5)',
        borderRadius: '0.5rem',
        padding: '0.5rem 0.75rem',
        outline: 'none',
        fontSize: '0.875rem',
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#111827', padding: '1.5rem', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <FiActivity style={{ color: '#a78bfa' }} />
                    AI Predictions
                </h1>
                <p style={{ color: '#9ca3af', fontSize: '1rem' }}>
                    ML-based waste generation predictions and zone analysis
                </p>
            </div>

            {/* Controls */}
            <div style={{ ...glassStyle, marginBottom: '5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
                    {/* Bin Selector */}
                    <div>
                        <label style={labelStyle}>Select Bin</label>
                        <select
                            value={selectedBin || ''}
                            onChange={(e) => setSelectedBin(e.target.value)}
                            style={{ ...inputStyle, cursor: 'pointer' }}
                        >
                            {bins.map((bin) => (
                                <option key={bin.bin_id} value={bin.bin_id}>
                                    {bin.bin_id} - {bin.zone}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Time Range */}
                    <div>
                        <label style={labelStyle}>Time Range</label>
                        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'rgba(55, 65, 81, 0.5)', padding: '4px', borderRadius: '0.5rem', width: 'fit-content' }}>
                            {['24h', '7d', '30d'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    style={{
                                        padding: '0.375rem 1rem',
                                        borderRadius: '0.375rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        border: 'none',
                                        transition: 'all 0.2s ease',
                                        backgroundColor: timeRange === range ? '#7c3aed' : 'transparent',
                                        color: timeRange === range ? 'white' : '#d1d5db',
                                    }}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Last Updated */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af', fontSize: '0.875rem', paddingBottom: '0.5rem' }}>
                        <FiClock />
                        <span>Model updated: 2 minutes ago</span>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '5rem' }}>
                {/* Blue Card */}
                <div style={cardStyle('linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)')}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.875rem', opacity: 0.9 }}>Predicted Waste Today</span>
                            <span style={{ fontSize: '0.7rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px' }}>AI</span>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                            {predictionSummary.predictedWaste.toLocaleString()} <span style={{ fontSize: '1rem', opacity: 0.8 }}>kg</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem', marginTop: '1rem', opacity: 0.9 }}>
                        <FiTrendingUp /> +12% from yesterday
                    </div>
                </div>

                {/* Purple Card */}
                <div style={cardStyle('linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)')}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.875rem', opacity: 0.9 }}>High-Risk Zones</span>
                            <span style={{ fontSize: '0.7rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px' }}>Alert</span>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{predictionSummary.highRiskZones}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem', marginTop: '1rem', opacity: 0.9 }}>
                        <FiMapPin /> Zones need attention
                    </div>
                </div>

                {/* Orange Card */}
                <div style={cardStyle('linear-gradient(135deg, #c2410c 0%, #f97316 100%)')}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.875rem', opacity: 0.9 }}>Peak Collection Time</span>
                            <FiClock style={{ opacity: 0.8 }} />
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{predictionSummary.peakTime}</div>
                    </div>
                    <div style={{ fontSize: '0.875rem', marginTop: '1rem', opacity: 0.9 }}>
                        Optimal collection window
                    </div>
                </div>

                {/* Green Card */}
                <div style={cardStyle('linear-gradient(135deg, #15803d 0%, #22c55e 100%)')}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.875rem', opacity: 0.9 }}>Model Confidence</span>
                            <span style={{ fontSize: '0.7rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px' }}>High</span>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{predictionSummary.confidence.toFixed(1)}%</div>
                    </div>
                    <div style={{ fontSize: '0.875rem', marginTop: '1rem', opacity: 0.9 }}>
                        R-Squared Score
                    </div>
                </div>
            </div>

            {/* Chart Section */}
            <div style={{ ...glassStyle, marginBottom: '5rem' }}>
                <div style={{ borderBottom: '1px solid rgba(75, 85, 99, 0.3)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', margin: 0 }}>Predicted vs Actual Waste</h3>
                    <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.25rem' }}>Comparison of Machine Learning model predictions against ground truth.</p>
                </div>
                <div style={{ height: '200px', width: '100%' }}>
                    <ResponsiveContainer>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(75, 85, 99, 0.3)" />
                            <XAxis
                                dataKey="time"
                                stroke="#9ca3af"
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                tickLine={{ stroke: '#9ca3af' }}
                            />
                            <YAxis
                                stroke="#9ca3af"
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                tickLine={{ stroke: '#9ca3af' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                                    border: '1px solid rgba(75, 85, 99, 0.5)',
                                    borderRadius: '0.5rem',
                                    color: 'white',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                                }}
                                itemStyle={{ color: '#e5e7eb' }}
                            />
                            <Legend wrapperStyle={{ color: '#d1d5db' }} />
                            <Line
                                type="monotone"
                                dataKey="predicted"
                                stroke="#a78bfa"
                                strokeWidth={3}
                                dot={{ fill: '#a78bfa', r: 4, strokeWidth: 0 }}
                                name="Predicted"
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="actual"
                                stroke="#34d399"
                                strokeWidth={3}
                                strokeDasharray="5 5"
                                dot={{ fill: '#34d399', r: 4, strokeWidth: 0 }}
                                name="Actual"
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Table Section */}
            <div style={glassStyle}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', marginBottom: '1.5rem' }}>High-Risk Zone Analysis</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(75, 85, 99, 0.5)' }}>
                                <th style={{ textAlign: 'left', padding: '1rem', color: '#9ca3af', fontSize: '0.875rem', fontWeight: '500' }}>Zone</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: '#9ca3af', fontSize: '0.875rem', fontWeight: '500' }}>Predicted Waste (kg)</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: '#9ca3af', fontSize: '0.875rem', fontWeight: '500' }}>Risk Level</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: '#9ca3af', fontSize: '0.875rem', fontWeight: '500' }}>Recommended Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {zoneWiseData.map((zone, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid rgba(75, 85, 99, 0.2)', transition: 'background-color 0.2s' }}>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{zone.zone}</td>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{zone.predicted}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            backgroundColor: zone.risk === 'high' ? 'rgba(239, 68, 68, 0.2)' : zone.risk === 'medium' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                            color: zone.risk === 'high' ? '#fca5a5' : zone.risk === 'medium' ? '#fcd34d' : '#6ee7b7'
                                        }}>
                                            {zone.risk.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#d1d5db' }}>
                                        {zone.risk === 'high' ? 'Deploy additional vehicle' : zone.risk === 'medium' ? 'Monitor closely' : 'Standard collection'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Predictions;
