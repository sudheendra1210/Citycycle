import { useState, useEffect } from 'react';
import { MdLocationOn as MapPin, MdSend as Send } from 'react-icons/md';
import { complaintsService } from '../services/complaintsService';

const Complaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        complaint_type: 'overflowing_bin',
        latitude: 17.3850,
        longitude: 78.4867,
        description: '',
        urgency: 'medium',
    });

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            const data = await complaintsService.getAllComplaints();
            setComplaints(data);
        } catch (error) {
            console.error('Error fetching complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await complaintsService.createComplaint(formData);
            setShowForm(false);
            setFormData({
                complaint_type: 'overflowing_bin',
                latitude: 17.3850,
                longitude: 78.4867,
                description: '',
                urgency: 'medium',
            });
            fetchComplaints();
        } catch (error) {
            console.error('Error creating complaint:', error);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            open: '#ef4444',
            in_progress: '#f59e0b',
            resolved: '#10b981',
            closed: '#3b82f6',
        };
        return colors[status] || '#3b82f6';
    };

    const getUrgencyColor = (urgency) => {
        const colors = {
            high: '#ef4444',
            medium: '#f59e0b',
            low: '#3b82f6',
        };
        return colors[urgency] || '#3b82f6';
    };

    const badgeStyle = (color) => ({
        fontSize: '0.75rem',
        fontWeight: 500,
        padding: '0.25rem 0.5rem',
        borderRadius: '0.25rem',
        backgroundColor: `${color}33`, // 20% opacity
        color: color,
        textTransform: 'capitalize',
        display: 'inline-block',
    });

    const inputStyle = {
        width: '100%',
        backgroundColor: '#374151',
        color: 'white',
        borderRadius: '0.5rem',
        padding: '0.625rem 0.75rem',
        border: '1px solid #4b5563',
        outline: 'none',
        fontSize: '0.875rem',
        boxSizing: 'border-box',
    };

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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', marginBottom: '1.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'white', margin: 0 }}>Citizen Complaints</h2>
                    <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: '0.25rem 0 0 0' }}>Submit and track waste management complaints</p>
                </div>

                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        transition: 'all 0.2s ease',
                        backgroundColor: showForm ? '#4b5563' : '#7c3aed',
                        color: 'white',
                        marginLeft: 'auto',
                    }}
                >
                    {showForm ? 'Cancel' : 'New Complaint'}
                </button>
            </div>

            {/* Complaint Form */}
            {showForm && (
                <div style={{ backgroundColor: '#1f2937', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #374151' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'white', marginBottom: '1rem', marginTop: 0 }}>Submit New Complaint</h3>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#9ca3af', marginBottom: '0.5rem' }}>
                                    Complaint Type
                                </label>
                                <select
                                    value={formData.complaint_type}
                                    onChange={(e) => setFormData({ ...formData, complaint_type: e.target.value })}
                                    style={inputStyle}
                                    required
                                >
                                    <option value="overflowing_bin">Overflowing Bin</option>
                                    <option value="missed_pickup">Missed Pickup</option>
                                    <option value="illegal_dumping">Illegal Dumping</option>
                                    <option value="broken_bin">Broken Bin</option>
                                    <option value="foul_odor">Foul Odor</option>
                                    <option value="littering">Littering</option>
                                    <option value="request_new_bin">Request New Bin</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#9ca3af', marginBottom: '0.5rem' }}>
                                    Urgency
                                </label>
                                <select
                                    value={formData.urgency}
                                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                                    style={inputStyle}
                                    required
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#9ca3af', marginBottom: '0.5rem' }}>
                                    Latitude
                                </label>
                                <input
                                    type="number"
                                    step="0.000001"
                                    value={formData.latitude}
                                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                                    style={inputStyle}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#9ca3af', marginBottom: '0.5rem' }}>
                                    Longitude
                                </label>
                                <input
                                    type="number"
                                    step="0.000001"
                                    value={formData.longitude}
                                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                                    style={inputStyle}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#9ca3af', marginBottom: '0.5rem' }}>
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                                rows="4"
                                placeholder="Provide details about the complaint..."
                            ></textarea>
                        </div>

                        <button type="submit" style={{
                            width: '100%',
                            backgroundColor: '#7c3aed',
                            color: 'white',
                            fontWeight: 600,
                            padding: '0.75rem 1rem',
                            borderRadius: '0.5rem',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            transition: 'background-color 0.2s ease',
                        }}>
                            <Send size={20} />
                            Submit Complaint
                        </button>
                    </form>
                </div>
            )}

            {/* Complaints List */}
            <div style={{ backgroundColor: '#1f2937', borderRadius: '0.5rem', padding: '1.5rem', border: '1px solid #374151' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'white', marginBottom: '1rem', marginTop: 0 }}>Recent Complaints</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {complaints.length > 0 ? complaints.map((complaint) => (
                        <div
                            key={complaint.complaint_id}
                            style={{
                                padding: '1rem',
                                backgroundColor: 'rgba(55, 65, 81, 0.4)',
                                borderRadius: '0.5rem',
                                border: '1px solid rgba(75, 85, 99, 0.3)',
                                transition: 'background-color 0.2s ease',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                        <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#e5e7eb', margin: 0, textTransform: 'capitalize' }}>
                                            {complaint.complaint_type.replace(/_/g, ' ')}
                                        </h4>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <span style={badgeStyle(getStatusColor(complaint.status))}>
                                                {complaint.status.replace(/_/g, ' ')}
                                            </span>
                                            <span style={badgeStyle(getUrgencyColor(complaint.urgency))}>
                                                {complaint.urgency.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    </div>

                                    {complaint.description && (
                                        <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: '0 0 0.75rem 0' }}>{complaint.description}</p>
                                    )}

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.75rem', color: '#6b7280' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <MapPin size={14} />
                                            {complaint.latitude.toFixed(4)}, {complaint.longitude.toFixed(4)}
                                        </span>
                                        <span>
                                            {new Date(complaint.timestamp).toLocaleDateString()} at {new Date(complaint.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span>ID: {complaint.complaint_id}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                            No complaints found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Complaints;
