import { COLORS } from './colors';

// Component tooltip tùy chỉnh cho biểu đồ
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div
                className="p-3 rounded-lg shadow-md bg-gradient-to-br from-white to-gray-100 border border-gray-200"
            >
                <p className="text-sm font-medium text-gray-800">
                    {label}
                </p>
                <p className="text-sm text-green-400">
                    {`Revenue: ${payload[0].payload.revenue !== null ? payload[0].payload.revenue.toLocaleString('vi-VN') + ' ₫' : 'N/A'}`}
                </p>
                <p className="text-sm text-yellow-400">
                    {`Payment: ${payload[0].payload.payment !== null ? payload[0].payload.payment.toLocaleString('vi-VN') : 'N/A'}`}
                </p>
            </div>
        );
    }
    return null;
};

export default CustomTooltip;