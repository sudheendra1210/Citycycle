const Vehicles = () => {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#111827', padding: '1.5rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'white', margin: 0 }}>Vehicles</h2>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: '0.25rem 0 0 0' }}>Track collection vehicle locations and status</p>
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
                        <rect x="1" y="3" width="15" height="13"></rect>
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                        <circle cx="5.5" cy="18.5" r="2.5"></circle>
                        <circle cx="18.5" cy="18.5" r="2.5"></circle>
                    </svg>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white', marginBottom: '0.5rem' }}>Vehicle Tracking</h3>
                <p style={{ color: '#9ca3af', maxWidth: '400px', margin: '0 auto' }}>
                    Real-time vehicle location tracking and route optimization is currently under development.
                    Check back soon for live updates!
                </p>
            </div>
        </div>
    );
};

export default Vehicles;
