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
            <div className="flex items-center justify-center h-[256px] bg-muted/5 rounded-xl border border-dashed border-border">
                <p className="text-muted-foreground font-medium">No importance details available</p>
            </div>
        );
    }

    const { features, model_type } = importanceData;
    const topFeatures = features.slice(0, 8);

    const chartData = topFeatures.map((f, index) => ({
        feature: formatFeatureName(f.feature),
        importance: (f.importance * 100).toFixed(2),
        rank: index + 1
    }));

    function formatFeatureName(name) {
        return name
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-card border border-border rounded-xl p-4 shadow-xl">
                    <p className="text-foreground font-bold text-sm mb-1">
                        #{data.rank}: {data.feature}
                    </p>
                    <p className="text-accent text-xs font-bold">
                        Importance: {data.importance}%
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full">
            <ResponsiveContainer width="100%" height={height}>
                <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                    <XAxis
                        type="number"
                        stroke="var(--color-muted-foreground)"
                        fontSize={11}
                        fontWeight={500}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        type="category"
                        dataKey="feature"
                        stroke="var(--color-foreground)"
                        fontSize={11}
                        fontWeight={600}
                        width={120}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />

                    <Bar dataKey="importance" radius={[0, 8, 8, 0]} barSize={30}>
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={index === 0 ? 'var(--color-accent)' : 'var(--color-accent)/40'}
                                opacity={1 - (index * 0.1)}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            <div className="mt-6 bg-muted/20 border border-border/50 rounded-xl p-4">
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                    <span className="font-bold text-foreground not-italic mr-1">Key Insight:</span>
                    The analysis shows that <span className="text-accent font-bold uppercase tracking-tight">{chartData[0]?.feature}</span> is the most significant factor affecting fill levels for the {model_type} model.
                </p>
            </div>
        </div>
    );
};

export default FeatureImportance;
