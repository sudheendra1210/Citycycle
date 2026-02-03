/**
 * Feature Importance Component
 * Horizontal bar chart showing feature importance for tree-based models
 */

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

const FeatureImportance = ({ importanceData, height = 280 }) => {
    if (!importanceData || !importanceData.features || importanceData.features.length === 0) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '256px',
                backgroundColor: '#1f2937',
                borderRadius: '0.5rem'
            }}>
                <p style={{ color: '#9ca3af' }}>No feature importance data available</p>
            </div>
        );
    }

    const { features, model_type } = importanceData;

    // Take top 10 features
    const topFeatures = features.slice(0, 10);

    // Prepare data for chart
    const chartData = topFeatures.map((f, index) => ({
        feature: formatFeatureName(f.feature),
        importance: (f.importance * 100).toFixed(2),
        rank: index + 1
    }));

    // Format feature names for display
    function formatFeatureName(name) {
        return name
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .replace('Lag', 'Lag-')
            .replace('Rolling', 'Rolling-');
    }

    // Get color based on importance
    const getColor = (importance) => {
        if (importance > 10) return '#10B981'; // High importance - green
        if (importance > 5) return '#3B82F6';  // Medium importance - blue
        return '#6B7280'; // Low importance - gray
    };

    // Custom tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div style={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #4b5563',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                }}>
                    <p style={{ color: 'white', fontWeight: 500, marginBottom: '0.25rem', margin: 0 }}>
                        #{data.rank}: {data.feature}
                    </p>
                    <p style={{ color: '#60a5fa', fontSize: '0.875rem', margin: 0 }}>
                        Importance: {data.importance}%
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ backgroundColor: '#1f2937', borderRadius: '0.5rem', padding: '1rem' }}>
            <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'white', marginBottom: '0.25rem', marginTop: 0 }}>
                    Feature Importance
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>
                    Model: {model_type ? model_type.charAt(0).toUpperCase() + model_type.slice(1) : 'Unknown'}
                </p>
            </div>

            <ResponsiveContainer width="100%" height={height}>
                <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                        type="number"
                        stroke="#9CA3AF"
                        style={{ fontSize: '12px' }}
                        label={{ value: 'Importance (%)', position: 'insideBottom', offset: -5, style: { fill: '#9CA3AF' } }}
                    />
                    <YAxis
                        type="category"
                        dataKey="feature"
                        stroke="#9CA3AF"
                        style={{ fontSize: '11px' }}
                        width={110}
                    />
                    <Tooltip content={<CustomTooltip />} />

                    <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getColor(parseFloat(entry.importance))} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1.5rem', justifyContent: 'center', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '0.25rem' }}></div>
                    <span style={{ color: '#9ca3af' }}>High (&gt;10%)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#3b82f6', borderRadius: '0.25rem' }}></div>
                    <span style={{ color: '#9ca3af' }}>Medium (5-10%)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#6b7280', borderRadius: '0.25rem' }}></div>
                    <span style={{ color: '#9ca3af' }}>Low (&lt;5%)</span>
                </div>
            </div>

            {/* Insights */}
            <div style={{ marginTop: '1rem', backgroundColor: '#374151', borderRadius: '0.5rem', padding: '0.75rem' }}>
                <p style={{ fontSize: '0.75rem', color: '#d1d5db', margin: 0 }}>
                    <span style={{ fontWeight: 500, color: 'white' }}>Key Insight:</span> The top features show which factors most influence waste bin fill levels.
                    Time-based features (hour, day) and historical patterns (lag, rolling averages) typically have high importance.
                </p>
            </div>
        </div>
    );
};

export default FeatureImportance;
