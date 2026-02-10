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

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-card border border-border rounded-xl p-4 shadow-xl">
                    <p className="text-foreground font-bold text-sm mb-1">
                        {format(new Date(data.timestamp), 'MMM dd, HH:mm')}
                    </p>
                    {data.actual !== null && (
                        <p className="text-secondary-foreground text-xs">
                            Actual: <span className="font-bold">{data.actual.toFixed(1)}%</span>
                        </p>
                    )}
                    {data.predicted !== null && (
                        <p className="text-accent text-xs">
                            Predicted: <span className="font-bold">{data.predicted.toFixed(1)}%</span>
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    if (chartData.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[200px] bg-muted/5 rounded-xl border border-dashed border-border">
                <p className="text-muted-foreground font-medium">No data available for this bin</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <ResponsiveContainer width="100%" height={height}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis
                        dataKey="timestamp"
                        tickFormatter={(t) => format(new Date(t), 'MMM dd')}
                        stroke="var(--color-muted-foreground)"
                        fontSize={11}
                        fontWeight={500}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        domain={[0, 100]}
                        stroke="var(--color-muted-foreground)"
                        fontSize={11}
                        fontWeight={500}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }}
                        iconType="circle"
                    />

                    <ReferenceLine
                        y={80}
                        stroke="var(--color-destructive)"
                        strokeDasharray="5 5"
                        label={{ value: 'MAX', position: 'right', fill: 'var(--color-destructive)', fontSize: 10, fontWeight: 'bold' }}
                    />

                    <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="var(--color-foreground)"
                        strokeWidth={4}
                        dot={false}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        name="Historical"
                    />

                    <Line
                        type="monotone"
                        dataKey="predicted"
                        stroke="var(--color-accent)"
                        strokeWidth={4}
                        strokeDasharray="8 5"
                        dot={false}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        name="Predicted"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PredictiveChart;
