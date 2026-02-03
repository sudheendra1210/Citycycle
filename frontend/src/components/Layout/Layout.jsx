import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            backgroundColor: '#111827',
        }}>
            <Sidebar />

            <main style={{
                flex: 1,
                marginLeft: '256px',
                transition: 'margin-left 0.3s ease',
            }}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
