import { MdTrendingUp as TrendingUp, MdTrendingDown as TrendingDown } from 'react-icons/md';

const StatCard = ({ icon: Icon, title, value, unit, trend, trendValue, color = 'primary' }) => {
    const colorClasses = {
        primary: 'from-primary-600 to-primary-500',
        success: 'from-success-600 to-success-500',
        warning: 'from-warning-600 to-warning-500',
        danger: 'from-danger-600 to-danger-500',
    };

    return (
        <div className="stat-card animate-slide-up">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-gray-100">{value}</h3>
                        {unit && <span className="text-sm text-gray-500">{unit}</span>}
                    </div>

                    {trend !== undefined && (
                        <div className="flex items-center gap-1 mt-2">
                            {trend === 'up' ? (
                                <TrendingUp size={16} className="text-success-500" />
                            ) : (
                                <TrendingDown size={16} className="text-danger-500" />
                            )}
                            <span className={`text-sm ${trend === 'up' ? 'text-success-500' : 'text-danger-500'}`}>
                                {trendValue}
                            </span>
                            <span className="text-xs text-gray-600">vs last week</span>
                        </div>
                    )}
                </div>

                <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-lg flex items-center justify-center shadow-lg`}>
                    <Icon className="text-white" size={24} />
                </div>
            </div>
        </div>
    );
};

export default StatCard;
