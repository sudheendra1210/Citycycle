const Collections = () => {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#111827', padding: '1.5rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'white', margin: 0 }}>Collections</h2>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: '0.25rem 0 0 0' }}>View collection history and waste composition data</p>
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
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                    </svg>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white', marginBottom: '0.5rem' }}>Collection History</h3>
                <p style={{ color: '#9ca3af', maxWidth: '400px', margin: '0 auto' }}>
                    Historical collection data and waste composition reports are being aggregated.
                    Detailed logs will be available here shortly.
                </p>
            </div>
        </div>
    );
};

export default Collections;
