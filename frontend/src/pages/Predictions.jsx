/**
 * Predictions Page
 * ML-based waste prediction with gradient cards matching original UI
 */

import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiClock, FiAlertTriangle, FiMapPin, FiActivity } from 'react-icons/fi';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { binsService } from '../services/binsService';

const Predictions = () => {
    const [bins, setBins] = useState([]);
    const [selectedBin, setSelectedBin] = useState(null);
    const [timeRange, setTimeRange] = useState('24h');
    const [loading, setLoading] = useState(false);

    // Mock prediction data
    const predictionSummary = {
        predictedWaste: 4850,
        highRiskZones: 3,
        peakTime: '2:00 PM',
        confidence: 94.2
    };

    // Mock data for predicted vs actual
    const predictionVsActualData = {
        '24h': [
            { time: '00:00', predicted: 120, actual: 115 },
            { time: '04:00', predicted: 80, actual: 85 },
            { time: '08:00', predicted: 240, actual: 235 },
            { time: '12:00', predicted: 380, actual: 395 },
            { time: '16:00', predicted: 320, actual: 310 },
            { time: '20:00', predicted: 180, actual: 175 },
            { time: '23:59', predicted: 140, actual: 145 },
        ],
        '7d': [
            { time: 'Mon', predicted: 2400, actual: 2350 },
            { time: 'Tue', predicted: 2800, actual: 2900 },
            { time: 'Wed', predicted: 2200, actual: 2180 },
            { time: 'Thu', predicted: 3100, actual: 3050 },
            { time: 'Fri', predicted: 2900, actual: 2950 },
            { time: 'Sat', predicted: 3500, actual: 3600 },
            { time: 'Sun', predicted: 2000, actual: 1950 },
        ],
        '30d': [
            { time: 'Week 1', predicted: 18000, actual: 17500 },
            { time: 'Week 2', predicted: 19500, actual: 20000 },
            { time: 'Week 3', predicted: 21000, actual: 20800 },
            { time: 'Week 4', predicted: 22500, actual: 22000 },
        ]
    };

    // Zone-wise prediction data
    const zoneWiseData = [
        { zone: 'Zone A', predicted: 850, risk: 'high' },
        { zone: 'Zone B', predicted: 620, risk: 'medium' },
        { zone: 'Zone C', predicted: 1100, risk: 'high' },
        { zone: 'Zone D', predicted: 480, risk: 'low' },
        { zone: 'Zone E', predicted: 720, risk: 'medium' },
    ];

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

    return (
        <div className="min-h-screen bg-gray-900 p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <FiActivity className="text-purple-500" />
                    AI Predictions
                </h1>
                <p className="text-gray-400">
                    ML-based waste generation predictions and zone analysis
                </p>
            </div>

            {/* Controls */}
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Bin Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Select Bin
                        </label>
                        <select
                            value={selectedBin || ''}
                            onChange={(e) => setSelectedBin(e.target.value)}
                            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Time Range
                        </label>
                        <div className="flex gap-2">
                            {['24h', '7d', '30d'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${timeRange === range
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Last Updated */}
                    <div className="flex items-end">
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <FiClock />
                            <span>Model updated: 2 minutes ago</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Prediction Summary Cards - Gradient Style */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-blue-200 text-sm">Predicted Waste Today</p>
                        <span className="text-xs bg-blue-500/30 text-blue-200 px-2 py-1 rounded-full">AI Predicted</span>
                    </div>
                    <p className="text-white text-3xl font-bold">
                        {predictionSummary.predictedWaste.toLocaleString()}
                        <span className="text-lg ml-1">kg</span>
                    </p>
                    <div className="flex items-center gap-1 text-blue-200 text-sm mt-2">
                        <FiTrendingUp />
                        <span>+12% from yesterday</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-purple-200 text-sm">High-Risk Zones</p>
                        <span className="text-xs bg-purple-500/30 text-purple-200 px-2 py-1 rounded-full">Alert</span>
                    </div>
                    <p className="text-white text-3xl font-bold">{predictionSummary.highRiskZones}</p>
                    <div className="flex items-center gap-1 text-purple-200 text-sm mt-2">
                        <FiMapPin />
                        <span>Zones need attention</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-orange-200 text-sm flex items-center gap-2">
                            <FiClock /> Peak Collection Time
                        </p>
                    </div>
                    <p className="text-white text-3xl font-bold">{predictionSummary.peakTime}</p>
                    <div className="text-orange-200 text-sm mt-2">
                        Optimal collection window
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-green-200 text-sm">Model Confidence</p>
                        <span className="text-xs bg-green-500/30 text-green-200 px-2 py-1 rounded-full">AI Model</span>
                    </div>
                    <p className="text-white text-3xl font-bold">{predictionSummary.confidence}%</p>
                    <div className="text-green-200 text-sm mt-2">
                        High accuracy prediction
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="bg-gray-800 rounded-lg mb-6">
                <div className="border-b border-gray-700 p-4">
                    <h3 className="text-xl font-semibold text-white">
                        Predicted vs Actual Waste
                    </h3>
                    <p className="text-gray-400 text-sm">Comparison of ML predictions with actual data</p>
                </div>
                <div className="p-6">
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={predictionVsActualData[timeRange]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="time" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1F2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px'
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="predicted"
                                stroke="#8B5CF6"
                                strokeWidth={2}
                                dot={{ fill: '#8B5CF6', strokeWidth: 0, r: 4 }}
                                name="Predicted"
                            />
                            <Line
                                type="monotone"
                                dataKey="actual"
                                stroke="#10B981"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={{ fill: '#10B981', strokeWidth: 0, r: 4 }}
                                name="Actual"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Zone Analysis Table */}
            <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">
                    High-Risk Zone Analysis
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Zone</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Predicted Waste (kg)</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Risk Level</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Recommended Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {zoneWiseData.map((zone, index) => (
                                <tr
                                    key={index}
                                    className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                                >
                                    <td className="py-3 px-4 text-sm text-white font-medium">{zone.zone}</td>
                                    <td className="py-3 px-4 text-sm text-white">{zone.predicted}</td>
                                    <td className="py-3 px-4">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${zone.risk === 'high'
                                                    ? 'bg-red-500/20 text-red-400'
                                                    : zone.risk === 'medium'
                                                        ? 'bg-yellow-500/20 text-yellow-400'
                                                        : 'bg-green-500/20 text-green-400'
                                                }`}
                                        >
                                            {zone.risk.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-400">
                                        {zone.risk === 'high'
                                            ? 'Deploy additional vehicle'
                                            : zone.risk === 'medium'
                                                ? 'Monitor closely'
                                                : 'Standard collection'}
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
