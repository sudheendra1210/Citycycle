const FillLevelChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Fill Level Trends</h3>
                <p className="text-gray-500 text-center py-12">No data available</p>
            </div>
        );
    }

    const maxValue = Math.max(...data.map(d => d.avg_fill_level || 0));

    return (
        <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Fill Level Trends (Last 7 Days)</h3>

            <div className="h-[300px] flex items-end justify-between gap-2">
                {data.map((item, index) => {
                    const height = (item.avg_fill_level / maxValue) * 100;
                    return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full flex flex-col justify-end h-full">
                                <div
                                    className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg transition-all duration-300 hover:from-primary-500 hover:to-primary-300 relative group"
                                    style={{ height: `${height}%` }}
                                >
                                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-dark-800 px-2 py-1 rounded text-xs whitespace-nowrap">
                                        {item.avg_fill_level?.toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                            <span className="text-xs text-gray-500 transform -rotate-45 origin-top-left mt-4">
                                {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-primary-600 to-primary-400 rounded"></div>
                    <span className="text-sm text-gray-400">Average Fill Level</span>
                </div>
            </div>
        </div>
    );
};

export default FillLevelChart;
