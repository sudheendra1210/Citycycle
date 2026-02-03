import { useState, useEffect } from 'react';
import { FiTrendingUp, FiAlertTriangle, FiTrash2, FiMessageSquare, FiTruck } from 'react-icons/fi';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsService } from '../services/analyticsService';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const statsData = await analyticsService.getDashboardStats();
            setStats(statsData);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Mock chart data
    const fillLevelData = [
        { day: 'Mon', level: 45 },
        { day: 'Tue', level: 62 },
        { day: 'Wed', level: 78 },
        { day: 'Thu', level: 55 },
        { day: 'Fri', level: 88 },
        { day: 'Sat', level: 72 },
        { day: 'Sun', level: 65 },
    ];

    const zoneData = [
        { zone: 'Zone A', waste: 2400 },
        { zone: 'Zone B', waste: 1800 },
        { zone: 'Zone C', waste: 3200 },
        { zone: 'Zone D', waste: 2100 },
        { zone: 'Zone E', waste: 1500 },
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    border: '3px solid #374151',
                    borderTopColor: '#8b5cf6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                }} />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#111827', padding: '1.5rem' }}>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{
                    fontSize: '1.875rem',
                    fontWeight: 'bold',
                    color: 'white',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                }}>
                    <FiTrendingUp style={{ color: '#8b5cf6' }} />
                    Dashboard Overview
                </h1>
                <p style={{ color: '#9ca3af' }}>
                    Real-time monitoring and analytics for waste management
                </p>
            </div>

            {/* Stats Grid - Gradient Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1rem',
                marginBottom: '1.5rem'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <p style={{ color: '#bfdbfe', fontSize: '0.875rem', margin: 0 }}>Total Bins</p>
                        <FiTrash2 style={{ color: '#bfdbfe' }} />
                    </div>
                    <p style={{ color: 'white', fontSize: '1.875rem', fontWeight: 'bold', margin: 0 }}>
                        {stats?.total_bins || 156}
                    </p>
                    <p style={{ color: '#bfdbfe', fontSize: '0.875rem', marginTop: '0.5rem', marginBottom: 0 }}>Active in system</p>
                </div>

                <div style={{
                    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <p style={{ color: '#ddd6fe', fontSize: '0.875rem', margin: 0 }}>Needs Collection</p>
                        <FiAlertTriangle style={{ color: '#ddd6fe' }} />
                    </div>
                    <p style={{ color: 'white', fontSize: '1.875rem', fontWeight: 'bold', margin: 0 }}>
                        {stats?.bins_needing_collection || 23}
                    </p>
                    <p style={{ color: '#ddd6fe', fontSize: '0.875rem', marginTop: '0.5rem', marginBottom: 0 }}>Above 80% capacity</p>
                </div>

                <div style={{
                    background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <p style={{ color: '#fed7aa', fontSize: '0.875rem', margin: 0 }}>Active Complaints</p>
                        <FiMessageSquare style={{ color: '#fed7aa' }} />
                    </div>
                    <p style={{ color: 'white', fontSize: '1.875rem', fontWeight: 'bold', margin: 0 }}>
                        {stats?.active_complaints || 12}
                    </p>
                    <p style={{ color: '#fed7aa', fontSize: '0.875rem', marginTop: '0.5rem', marginBottom: 0 }}>Pending resolution</p>
                </div>

                <div style={{
                    background: 'linear-gradient(135deg, #16a34a, #15803d)',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <p style={{ color: '#bbf7d0', fontSize: '0.875rem', margin: 0 }}>Waste Collected</p>
                        <FiTruck style={{ color: '#bbf7d0' }} />
                    </div>
                    <p style={{ color: 'white', fontSize: '1.875rem', fontWeight: 'bold', margin: 0 }}>
                        {stats?.waste_collected_today_kg || 4850}
                        <span style={{ fontSize: '1rem', marginLeft: '0.25rem' }}>kg</span>
                    </p>
                    <p style={{ color: '#bbf7d0', fontSize: '0.875rem', marginTop: '0.5rem', marginBottom: 0 }}>Today's collection</p>
                </div>
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Fill Level Trends */}
                <div style={{ backgroundColor: '#1f2937', borderRadius: '0.5rem', padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', marginBottom: '1rem', marginTop: 0 }}>
                        Weekly Fill Level Trends
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={fillLevelData}>
                            <defs>
                                <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="day" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#403552ff',
                                    border: '1px solid #374151',
                                    borderRadius: '8px'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="level"
                                stroke="#8B5CF6"
                                strokeWidth={2}
                                fill="url(#fillGradient)"
                                name="Fill Level %"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Zone-wise Collection */}
                <div style={{ backgroundColor: '#1f2937', borderRadius: '0.5rem', padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', marginBottom: '1rem', marginTop: 0 }}>
                        Zone-wise Waste Collection
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={zoneData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="zone" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1F2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px'
                                }}
                            />
                            <Bar
                                dataKey="waste"
                                fill="#8B5CF6"
                                radius={[4, 4, 0, 0]}
                                name="Waste (kg)"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Quick Stats */}
            <div style={{ backgroundColor: '#1f2937', borderRadius: '0.5rem', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', marginBottom: '1rem', marginTop: 0 }}>
                    Quick Statistics
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                    <div style={{ backgroundColor: '#374151', borderRadius: '0.5rem', padding: '1rem' }}>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0, marginBottom: '0.25rem' }}>Average Fill Level</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#a78bfa', margin: 0 }}>
                            {stats?.average_fill_level || 67}%
                        </p>
                    </div>
                    <div style={{ backgroundColor: '#374151', borderRadius: '0.5rem', padding: '1rem' }}>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0, marginBottom: '0.25rem' }}>Active Vehicles</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#60a5fa', margin: 0 }}>8</p>
                    </div>
                    <div style={{ backgroundColor: '#374151', borderRadius: '0.5rem', padding: '1rem' }}>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0, marginBottom: '0.25rem' }}>Routes Completed</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4ade80', margin: 0 }}>12</p>
                    </div>
                    <div style={{ backgroundColor: '#374151', borderRadius: '0.5rem', padding: '1rem' }}>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0, marginBottom: '0.25rem' }}>Collection Efficiency</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fb923c', margin: 0 }}>92%</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
