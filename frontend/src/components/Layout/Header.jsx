import { MdNotifications as Bell, MdPerson as User } from 'react-icons/md';

const Header = () => {
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
                    {/* Notifications */}
                    <button className="relative p-2 hover:bg-dark-800 rounded-lg transition-colors">
                        <Bell size={20} className="text-gray-400" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full"></span>
                    </button>

                    {/* User menu */}
                    <div className="flex items-center gap-3 px-4 py-2 glass-card rounded-lg cursor-pointer hover:bg-dark-800 transition-colors">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-success-500 rounded-full flex items-center justify-center">
                            <User size={16} className="text-white" />
                        </div>
                        <div className="hidden md:block">
                            <p className="text-sm font-semibold text-gray-200">Admin User</p>
                            <p className="text-xs text-gray-500">Administrator</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
