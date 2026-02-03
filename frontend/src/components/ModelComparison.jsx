/**
 * Model Comparison Component
 * Bar chart comparing performance of different ML models
 */

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts';

const ModelComparison = ({ comparisonData, height = 300 }) => {
    if (!comparisonData || !comparisonData.all_metrics) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '256px',
                backgroundColor: '#1f2937',
                borderRadius: '0.5rem'
            }}>
                <p style={{ color: '#9ca3af' }}>No comparison data available</p>
            </div>
        );
    }

    const { all_metrics, recommended_model } = comparisonData;

    // Prepare data for chart
    const chartData = Object.entries(all_metrics)
        .filter(([_, metrics]) => !metrics.error)
        .map(([model, metrics]) => ({
            model: model.charAt(0).toUpperCase() + model.slice(1),
            RMSE: metrics.rmse || 0,
            MAE: metrics.mae || 0,
            'R² Score': (metrics.r2_score || 0) * 100,
            'Accuracy': metrics.accuracy_5pct || 0,
            isRecommended: model === recommended_model
        }));

    // Colors for bars
    const COLORS = {
        RMSE: '#EF4444',
        MAE: '#F59E0B',
        'R² Score': '#10B981',
        'Accuracy': '#3B82F6'
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
                    <p style={{ color: 'white', fontWeight: 500, marginBottom: '0.5rem', margin: 0 }}>
                        {data.model}
                        {data.isRecommended && (
                            <span style={{
                                marginLeft: '0.5rem',
                                fontSize: '0.75rem',
                                backgroundColor: '#16a34a',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.25rem'
                            }}>
                                Recommended
                            </span>
                        )}
                    </p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ fontSize: '0.875rem', color: entry.color, margin: '0.25rem 0' }}>
                            {entry.name}: {entry.value.toFixed(2)}
                            {entry.name === 'R² Score' || entry.name === 'Accuracy' ? '%' : ''}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ backgroundColor: '#1f2937', borderRadius: '0.5rem', padding: '1rem' }}>
            <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'white', marginBottom: '0.5rem', marginTop: 0 }}>
                    Model Performance Comparison
                </h3>
                {recommended_model && (
                    <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>
                        Recommended: <span style={{ color: '#4ade80', fontWeight: 500 }}>
                            {recommended_model.charAt(0).toUpperCase() + recommended_model.slice(1)}
                        </span>
                    </p>
                )}
            </div>

            <ResponsiveContainer width="100%" height={height}>
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                        dataKey="model"
                        stroke="#9CA3AF"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis
                        stroke="#9CA3AF"
                        style={{ fontSize: '12px' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />

                    <Bar dataKey="RMSE" fill={COLORS.RMSE} radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-rmse-${index}`} fill={entry.isRecommended ? '#DC2626' : COLORS.RMSE} />
                        ))}
                    </Bar>
                    <Bar dataKey="MAE" fill={COLORS.MAE} radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-mae-${index}`} fill={entry.isRecommended ? '#D97706' : COLORS.MAE} />
                        ))}
                    </Bar>
                    <Bar dataKey="R² Score" fill={COLORS['R² Score']} radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-r2-${index}`} fill={entry.isRecommended ? '#059669' : COLORS['R² Score']} />
                        ))}
                    </Bar>
                    <Bar dataKey="Accuracy" fill={COLORS.Accuracy} radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-acc-${index}`} fill={entry.isRecommended ? '#2563EB' : COLORS.Accuracy} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Metrics explanation */}
            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <div style={{ backgroundColor: '#374151', borderRadius: '0.5rem', padding: '0.75rem' }}>
                    <p style={{ color: '#f87171', fontWeight: 500, fontSize: '0.875rem', margin: 0 }}>RMSE (Lower is better)</p>
                    <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: 0, marginTop: '0.25rem' }}>Root Mean Squared Error</p>
                </div>
                <div style={{ backgroundColor: '#374151', borderRadius: '0.5rem', padding: '0.75rem' }}>
                    <p style={{ color: '#fb923c', fontWeight: 500, fontSize: '0.875rem', margin: 0 }}>MAE (Lower is better)</p>
                    <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: 0, marginTop: '0.25rem' }}>Mean Absolute Error</p>
                </div>
                <div style={{ backgroundColor: '#374151', borderRadius: '0.5rem', padding: '0.75rem' }}>
                    <p style={{ color: '#4ade80', fontWeight: 500, fontSize: '0.875rem', margin: 0 }}>R² Score (Higher is better)</p>
                    <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: 0, marginTop: '0.25rem' }}>Goodness of fit</p>
                </div>
                <div style={{ backgroundColor: '#374151', borderRadius: '0.5rem', padding: '0.75rem' }}>
                    <p style={{ color: '#60a5fa', fontWeight: 500, fontSize: '0.875rem', margin: 0 }}>Accuracy (Higher is better)</p>
                    <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: 0, marginTop: '0.25rem' }}>Within 5% tolerance</p>
                </div>
            </div>
        </div>
    );
};

export default ModelComparison;
