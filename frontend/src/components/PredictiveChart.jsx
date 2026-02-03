/**
 * Predictive Chart Component
 * Line chart showing historical data + future predictions
 */

import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { format } from 'date-fns';

const PredictiveChart = ({ historicalData = [], predictedData = [], height = 300 }) => {
    // Combine historical and predicted data
    const chartData = [
        ...historicalData.map(d => ({
            timestamp: new Date(d.timestamp).getTime(),
            actual: d.fill_level_percent,
            predicted: null,
            type: 'actual'
        })),
        ...predictedData.map(d => ({
            timestamp: new Date(d.timestamp).getTime(),
            actual: null,
            predicted: d.fill_level_percent,
            type: 'predicted'
        }))
    ].sort((a, b) => a.timestamp - b.timestamp);

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
                    <p style={{ color: 'white', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', margin: 0 }}>
                        {format(new Date(data.timestamp), 'MMM dd, HH:mm')}
                    </p>
                    {data.actual !== null && (
                        <p style={{ color: '#60a5fa', fontSize: '0.875rem', margin: 0 }}>
                            Actual: {data.actual.toFixed(1)}%
                        </p>
                    )}
                    {data.predicted !== null && (
                        <p style={{ color: '#a78bfa', fontSize: '0.875rem', margin: 0 }}>
                            Predicted: {data.predicted.toFixed(1)}%
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    // Format X-axis
    const formatXAxis = (timestamp) => {
        return format(new Date(timestamp), 'MMM dd');
    };

    if (chartData.length === 0) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '200px',
                backgroundColor: '#1f2937',
                borderRadius: '0.5rem'
            }}>
                <p style={{ color: '#9ca3af' }}>No data available</p>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#1f2937', borderRadius: '0.5rem', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height={height}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                        dataKey="timestamp"
                        tickFormatter={formatXAxis}
                        stroke="#9CA3AF"
                        style={{ fontSize: '11px' }}
                    />
                    <YAxis
                        domain={[0, 100]}
                        stroke="#9CA3AF"
                        style={{ fontSize: '11px' }}
                        label={{ value: 'Fill Level (%)', angle: -90, position: 'insideLeft', style: { fill: '#9CA3AF', fontSize: '11px' } }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ fontSize: '12px' }}
                        iconType="line"
                    />

                    {/* Threshold line at 80% */}
                    <ReferenceLine
                        y={80}
                        stroke="#EF4444"
                        strokeDasharray="5 5"
                        label={{ value: 'Coll.', position: 'right', fill: '#EF4444', fontSize: 10 }}
                    />

                    {/* Historical data line */}
                    <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6', r: 2 }}
                        activeDot={{ r: 4 }}
                        name="Historical"
                        connectNulls={false}
                    />

                    {/* Predicted data line */}
                    <Line
                        type="monotone"
                        dataKey="predicted"
                        stroke="#A855F7"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: '#A855F7', r: 2 }}
                        activeDot={{ r: 4 }}
                        name="Predicted"
                        connectNulls={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PredictiveChart;
