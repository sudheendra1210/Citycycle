import { MdNotifications as Bell, MdPerson as UserIcon } from 'react-icons/md';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <header className="glass-card border-b border-dark-800 px-6 py-4 mb-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-100">
                        Smart Waste Management
                    </h2>
                    <p className="text-sm text-gray-500">
                        Real-time monitoring and optimization
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {/* User menu */}
                    <div
                        onClick={() => navigate('/profile')}
                        className="flex items-center gap-3 px-4 py-2 glass-card rounded-lg cursor-pointer hover:bg-dark-800 transition-colors"
                    >
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-success-500 rounded-full flex items-center justify-center">
                            <UserIcon size={16} className="text-white" />
                        </div>
                        <div className="hidden md:block">
                            <p className="text-sm font-semibold text-gray-200">{user?.fullName || user?.email?.split('@')[0] || 'User'}</p>
                            <p className="text-xs text-gray-500 capitalize">{user?.role || 'Guest'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
