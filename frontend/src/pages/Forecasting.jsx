import { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle, Clock, RefreshCw, BarChart3, PieChart, Activity } from 'lucide-react';
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

    // Load prediction and active tab data when settings or active tab change
    useEffect(() => {
        if (selectedBin) {
            loadPrediction();
            if (activeTab === 'comparison') loadModelComparison();
            if (activeTab === 'features') loadFeatureImportance();
        }
    }, [selectedBin, modelType, timeRange, activeTab]);

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
        try {
            const comparison = await compareModels(selectedBin);
            setComparisonData(comparison);
        } catch (err) {
            setError('Failed to compare models');
        } finally {
            setLoading(false);
        }
    };

    const loadFeatureImportance = async () => {
        if (!selectedBin) return;
        setLoading(true);
        try {
            const importance = await getFeatureImportance(selectedBin, modelType);
            setImportanceData(importance);
        } catch (err) {
            setError('Failed to load feature importance');
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
            // Refresh everything after training
            loadPrediction();
            if (activeTab === 'comparison') loadModelComparison();
            if (activeTab === 'features') loadFeatureImportance();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to train models');
        } finally {
            setTraining(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'comparison') loadModelComparison();
        if (tab === 'features') loadFeatureImportance();
    };

    const formatHoursUntilFull = (hours) => {
        if (!hours) return 'N/A';
        if (hours < 24) return `${hours.toFixed(1)}h`;
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        return `${days}d ${remainingHours.toFixed(0)}h`;
    };

    if (loading && !predictionData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="w-10 h-10 border-2 border-muted border-t-accent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-accent rounded-lg shadow-md shadow-accent/10">
                        <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">Forecasting</h1>
                </div>
                <p className="text-muted-foreground font-medium">
                    ML-based waste bin fill-level prediction using multiple algorithms
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-6 pb-16">
                {/* Controls Section */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Select Bin</label>
                            <select
                                value={selectedBin || ''}
                                onChange={(e) => setSelectedBin(e.target.value)}
                                className="w-full bg-muted/20 border border-border rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-accent outline-none"
                            >
                                {bins.map((bin) => (
                                    <option key={bin.bin_id} value={bin.bin_id}>{bin.bin_id} - {bin.zone}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Model Type</label>
                            <select
                                value={modelType}
                                onChange={(e) => setModelType(e.target.value)}
                                className="w-full bg-muted/20 border border-border rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-accent outline-none"
                            >
                                <option value="linear">Linear Regression</option>
                                <option value="tree">Decision Tree</option>
                                <option value="forest">Random Forest</option>
                                <option value="arima">ARIMA</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Forecast Period</label>
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(Number(e.target.value))}
                                className="w-full bg-muted/20 border border-border rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-accent outline-none"
                            >
                                <option value={6}>6 hours</option>
                                <option value={12}>12 hours</option>
                                <option value={24}>24 hours</option>
                                <option value={48}>48 hours</option>
                                <option value={168}>7 days</option>
                            </select>
                        </div>
                        <button
                            onClick={handleTrainModels}
                            disabled={training}
                            className={`flex items-center justify-center gap-2 h-[42px] px-6 rounded-lg font-bold text-sm transition-all ${training ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/20'
                                }`}
                        >
                            <RefreshCw className={`w-4 h-4 ${training ? 'animate-spin' : ''}`} />
                            {training ? 'Training...' : 'Train Models'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-8 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-destructive" />
                        <p className="text-sm font-medium text-destructive">{error}</p>
                    </div>
                )}

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <InfoCard title="Current Level" value={`${predictionData?.current_fill_level?.toFixed(1) || '--'}%`} Icon={Activity} />
                    <InfoCard title="Predicted Level" value={`${predictionData?.predicted_fill_level?.toFixed(1) || '--'}%`} Icon={TrendingUp} />
                    <InfoCard title="Until Full" value={formatHoursUntilFull(predictionData?.hours_until_full)} Icon={Clock} />
                    <InfoCard title="Model" value={predictionData?.model_type || modelType} Icon={BarChart3} className="capitalize" />
                </div>

                {/* Tabs Section */}
                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="flex border-b border-border bg-muted/5">
                        <TabButton active={activeTab === 'prediction'} onClick={() => handleTabChange('prediction')} label="Prediction Chart" />
                        <TabButton active={activeTab === 'comparison'} onClick={() => handleTabChange('comparison')} label="Model Comparison" />
                        <TabButton active={activeTab === 'features'} onClick={() => handleTabChange('features')} label="Feature Importance" />
                    </div>

                    <div className="p-8">
                        {loading ? (
                            <div className="flex items-center justify-center h-[400px]">
                                <div className="w-8 h-8 border-2 border-muted border-t-accent rounded-full animate-spin" />
                            </div>
                        ) : (
                            <>
                                {activeTab === 'prediction' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        <h3 className="text-lg font-bold text-foreground mb-6">Historical vs Predicted Fill Levels</h3>
                                        <PredictiveChart
                                            key={`pred-${selectedBin}-${modelType}`}
                                            historicalData={chartData.historical}
                                            predictedData={chartData.predicted}
                                            height={400}
                                        />
                                    </div>
                                )}
                                {activeTab === 'comparison' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        <ModelComparison
                                            key={`comp-${selectedBin}`}
                                            comparisonData={comparisonData}
                                            height={350}
                                        />
                                    </div>
                                )}
                                {activeTab === 'features' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        <FeatureImportance
                                            key={`feat-${selectedBin}-${modelType}`}
                                            importanceData={importanceData}
                                            height={400}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Insights Section */}
                <div className="mt-8 bg-accent/5 border border-accent/20 rounded-2xl p-8">
                    <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                        <PieChart className="w-6 h-6 text-accent" />
                        Forecasting Insights
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InsightBox title="Area Analysis" content="Residential and commercial areas typically show predictable spikes during morning and evening hours." />
                        <InsightBox title="Model Performance" content="Random Forest often provides the best balance between training speed and predictive accuracy for fill levels." />
                        <InsightBox title="Optimization" content="Use high-importance features to refine collection routes and reduce unnecessary fuel consumption." />
                    </div>
                </div>
            </div>
        </div>
    );
};

const InfoCard = ({ title, value, Icon, className = "" }) => (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
            <div className="p-2 bg-accent/10 rounded-lg">
                <Icon className="w-4 h-4 text-accent" />
            </div>
        </div>
        <p className={`text-2xl font-bold text-foreground tracking-tight ${className}`}>{value}</p>
    </div>
);

const TabButton = ({ active, onClick, label }) => (
    <button
        onClick={onClick}
        className={`px-8 py-4 text-sm font-bold transition-all border-b-2 ${active ? 'border-accent text-accent bg-accent/5' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/5'
            }`}
    >
        {label}
    </button>
);

const InsightBox = ({ title, content }) => (
    <div className="bg-card border border-border/40 rounded-xl p-6">
        <p className="text-sm font-bold text-accent mb-2">{title}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{content}</p>
    </div>
);

export default Forecasting;
