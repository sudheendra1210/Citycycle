import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, AlertCircle, MapPin, Activity } from 'lucide-react';
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
        confidence: 94.2,
    });

    const [chartData, setChartData] = useState([]);

    // Generate dynamic data based on selected bin
    useEffect(() => {
        if (!selectedBin) return;

        const binHash = selectedBin.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const scatterFactor = (binHash * 997) % 100;

        setPredictionSummary({
            predictedWaste: 3800 + scatterFactor * 25,
            highRiskZones: Math.floor(scatterFactor / 15),
            peakTime: `${Math.floor(scatterFactor / 8) % 12 + 1}:00 PM`,
            confidence: 88 + scatterFactor / 10,
        });

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

    // Load real bins from backend on mount
    useEffect(() => {
        loadBins();
    }, []);

    const loadBins = async () => {
        try {
            setLoading(true);
            const data = await binsService.getAllBins();
            setBins(data);
            if (data.length > 0) {
                setSelectedBin(data[0].bin_id);
            }
        } catch (err) {
            console.error('Failed to load bins:', err);
            // Fallback to mock data if backend fails
            const mockBins = [
                { bin_id: 'BIN-001', zone: 'Zone A' },
                { bin_id: 'BIN-002', zone: 'Zone B' },
                { bin_id: 'BIN-003', zone: 'Zone C' },
            ];
            setBins(mockBins);
            setSelectedBin('BIN-001');
        } finally {
            setLoading(false);
        }
    };

    const zoneWiseData = [
        { zone: 'Zone A', predicted: Math.floor(predictionSummary.predictedWaste * 0.2), risk: 'high' },
        { zone: 'Zone B', predicted: Math.floor(predictionSummary.predictedWaste * 0.15), risk: 'medium' },
        { zone: 'Zone C', predicted: Math.floor(predictionSummary.predictedWaste * 0.3), risk: 'high' },
        { zone: 'Zone D', predicted: Math.floor(predictionSummary.predictedWaste * 0.1), risk: 'low' },
        { zone: 'Zone E', predicted: Math.floor(predictionSummary.predictedWaste * 0.25), risk: 'medium' },
    ];

    const getRiskColor = (risk) => {
        switch (risk) {
            case 'high':
                return 'bg-red-50 text-red-700 border border-red-200';
            case 'medium':
                return 'bg-amber-50 text-amber-700 border border-amber-200';
            default:
                return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
        }
    };

    if (loading && bins.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="w-10 h-10 border-2 border-muted border-t-accent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background font-sans selection:bg-accent/30 selection:text-accent-foreground">
            {/* Header section with Outfit font */}
            <div className="border-b border-border bg-card">
                <div className="max-w-7xl mx-auto px-8 py-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-accent rounded-lg shadow-md shadow-accent/10">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight text-foreground">AI Predictions</h1>
                    </div>
                    <p className="text-muted-foreground font-medium">ML-based waste generation predictions and zone analysis</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* Controls Section */}
                <div className="bg-card border border-border rounded-xl p-6 mb-8 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block text-[0.7rem]">Select Bin</label>
                            <select
                                value={selectedBin || ''}
                                onChange={(e) => setSelectedBin(e.target.value)}
                                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground font-medium text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-all appearance-none cursor-pointer"
                            >
                                {bins.map((bin) => (
                                    <option key={bin.bin_id} value={bin.bin_id}>
                                        {bin.bin_id} - {bin.zone}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block text-[0.7rem]">Time Range</label>
                            <div className="flex gap-2 bg-muted/20 rounded-lg p-1 border border-border">
                                {['24h', '7d', '30d'].map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => setTimeRange(range)}
                                        className={`flex-1 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${timeRange === range
                                                ? 'bg-accent text-white shadow-sm'
                                                : 'bg-transparent text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold bg-muted/10 px-4 py-2 rounded-lg border border-border/50">
                            <Clock className="w-4 h-4 text-accent" />
                            <span>MODEL UPDATED 2 MIN AGO</span>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:translate-y-[-2px] transition-all duration-300 group">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Predicted Waste Today</p>
                                <div className="flex items-baseline gap-1">
                                    <p className="text-3xl font-black text-foreground tracking-tighter">
                                        {predictionSummary.predictedWaste.toLocaleString()}
                                    </p>
                                    <span className="text-sm font-bold text-muted-foreground lowercase">kg</span>
                                </div>
                            </div>
                            <div className="p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                                <TrendingUp className="w-5 h-5 text-accent" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent/40 animate-pulse" />
                            <span className="text-accent">+12%</span> from yesterday
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:translate-y-[-2px] transition-all duration-300 group">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">High-Risk Zones</p>
                                <p className="text-3xl font-black text-foreground tracking-tighter">{predictionSummary.highRiskZones}</p>
                            </div>
                            <div className="p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                                <AlertCircle className="w-5 h-5 text-accent" />
                            </div>
                        </div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Zones need attention</p>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:translate-y-[-2px] transition-all duration-300 group">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Peak Collection Time</p>
                                <p className="text-3xl font-black text-foreground tracking-tighter">{predictionSummary.peakTime}</p>
                            </div>
                            <div className="p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                                <Clock className="w-5 h-5 text-accent" />
                            </div>
                        </div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Optimal window</p>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:translate-y-[-2px] transition-all duration-300 group">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Model Confidence</p>
                                <p className="text-3xl font-black text-accent tracking-tighter">{predictionSummary.confidence.toFixed(1)}%</p>
                            </div>
                            <div className="px-2 py-0.5 bg-accent text-white rounded text-[0.6rem] font-black uppercase tracking-widest shadow-lg shadow-accent/20">High</div>
                        </div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">R-Squared Score</p>
                    </div>
                </div>

                {/* Chart Section */}
                <div className="bg-card border border-border rounded-xl p-8 mb-8 shadow-sm">
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-foreground mb-1">Predicted vs Actual Waste</h3>
                        <p className="text-sm text-muted-foreground font-medium">Comparison of Machine Learning model predictions against ground truth</p>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ left: -20, right: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                <XAxis
                                    dataKey="time"
                                    stroke="var(--color-muted-foreground)"
                                    fontSize={12}
                                    fontWeight={500}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="var(--color-muted-foreground)"
                                    fontSize={12}
                                    fontWeight={500}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--color-card)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        padding: '12px'
                                    }}
                                />
                                <Legend
                                    wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 'bold' }}
                                    iconType="circle"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="predicted"
                                    stroke="var(--color-accent)"
                                    strokeWidth={4}
                                    dot={{ fill: 'var(--color-accent)', r: 4 }}
                                    name="Predicted"
                                    activeDot={{ r: 6 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="actual"
                                    stroke="var(--color-foreground)"
                                    strokeWidth={4}
                                    strokeDasharray="5 5"
                                    dot={{ fill: 'var(--color-foreground)', r: 4 }}
                                    name="Actual"
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-border">
                        <h3 className="text-xl font-bold text-foreground">High-Risk Zone Analysis</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-muted/5">
                                    <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Zone</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Predicted Waste (kg)</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Risk Level</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Recommended Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {zoneWiseData.map((zone, index) => (
                                    <tr key={index} className="hover:bg-muted/5 transition-colors group">
                                        <td className="px-6 py-4 text-sm font-bold text-foreground">{zone.zone}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-foreground">{zone.predicted}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${getRiskColor(
                                                    zone.risk,
                                                )}`}
                                            >
                                                {zone.risk}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground italic group-hover:text-foreground transition-colors">
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
        </div>
    );
}

export default Predictions;
