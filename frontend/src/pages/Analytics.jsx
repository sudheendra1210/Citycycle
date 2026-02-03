const Analytics = () => {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#111827', padding: '1.5rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'white', margin: 0 }}>Analytics</h2>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: '0.25rem 0 0 0' }}>Advanced analytics and reporting</p>
            </div>

            <div style={{
                backgroundColor: '#1f2937',
                borderRadius: '0.5rem',
                padding: '4rem',
                textAlign: 'center',
                border: '1px solid #374151'
            }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem auto'
                }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="20" x2="18" y2="10"></line>
                        <line x1="12" y1="20" x2="12" y2="4"></line>
                        <line x1="6" y1="20" x2="6" y2="14"></line>
                    </svg>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white', marginBottom: '0.5rem' }}>Advanced Analytics</h3>
                <p style={{ color: '#9ca3af', maxWidth: '400px', margin: '0 auto' }}>
                    Deeper insights and predictive maintenance reports are being processed.
                    Stay tuned for advanced data visualizations!
                </p>
            </div>
        </div>
    );
};

export default Analytics;
