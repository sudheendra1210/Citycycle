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
            <div className="flex items-center justify-center h-[256px] bg-muted/5 rounded-xl border border-dashed border-border">
                <p className="text-muted-foreground font-medium">No comparison data available</p>
            </div>
        );
    }

    const { all_metrics, recommended_model } = comparisonData;

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

    const COLORS = {
        RMSE: 'var(--color-destructive)',
        MAE: '#f59e0b',
        'R² Score': '#10b981',
        'Accuracy': 'var(--color-accent)'
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-card border border-border rounded-xl p-4 shadow-xl">
                    <p className="text-foreground font-bold text-sm mb-2">
                        {data.model}
                        {data.isRecommended && (
                            <span className="ml-2 text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                Best
                            </span>
                        )}
                    </p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-xs font-medium" style={{ color: entry.color }}>
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
        <div className="w-full">
            <ResponsiveContainer width="100%" height={height}>
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis
                        dataKey="model"
                        stroke="var(--color-muted-foreground)"
                        fontSize={12}
                        fontWeight={500}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        stroke="var(--color-muted-foreground)"
                        fontSize={12}
                        fontWeight={500}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} />

                    <Bar dataKey="RMSE" fill={COLORS.RMSE} radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="MAE" fill={COLORS.MAE} radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="R² Score" fill={COLORS['R² Score']} radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="Accuracy" fill={COLORS.Accuracy} radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
            </ResponsiveContainer>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricInfo label="RMSE" desc="Lower Error" color="text-destructive" />
                <MetricInfo label="MAE" desc="Lower Better" color="text-yellow-500" />
                <MetricInfo label="R² Score" desc="Better Fit" color="text-green-500" />
                <MetricInfo label="Accuracy" desc="Top Score" color="text-accent" />
            </div>
        </div>
    );
};

const MetricInfo = ({ label, desc, color }) => (
    <div className="bg-muted/10 rounded-lg p-3 border border-border/50 text-center">
        <p className={`text-sm font-bold ${color}`}>{label}</p>
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{desc}</p>
    </div>
);

export default ModelComparison;
