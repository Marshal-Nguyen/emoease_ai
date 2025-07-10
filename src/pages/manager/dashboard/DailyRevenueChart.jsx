import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from "recharts";
import ChartCard from './ChartCard';
import CustomTooltip from './CustomTooltip';
import { COLORS } from './colors';
import { ICON_CONFIG } from './iconConfig';

// Component hiển thị biểu đồ Xu hướng Doanh thu Hàng ngày
const DailyRevenueChart = ({ dailySales }) => (
    <div className="lg:col-span-2">
        <ChartCard title="Daily Revenue Trend" config={ICON_CONFIG.salesOverview}>
            <ResponsiveContainer width="100%" height={310}>
                <AreaChart data={dailySales}>
                    <XAxis
                        dataKey="name"
                        stroke={COLORS.textSecondary}
                        tick={{ fill: COLORS.textSecondary, fontSize: 12 }}
                        tickFormatter={(value) => new Date(value).getDate()}
                    />
                    <YAxis
                        yAxisId="left"
                        stroke={COLORS.textSecondary}
                        tick={{ fill: COLORS.textSecondary, fontSize: 12 }}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                        domain={[0, 300000]} // Scale for revenue
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke={COLORS.textSecondary}
                        tick={{ fill: COLORS.textSecondary, fontSize: 12 }}
                        tickFormatter={(value) => `${value}`} // Adjust scale for payment (e.g., raw values)
                        domain={[0, 20]} // Example scale for payment
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ color: COLORS.textPrimary }} />
                    <Area
                        type="monotone"
                        dataKey="revenue"
                        yAxisId="left"
                        stroke={COLORS.success}
                        fill={`url(#areaGradient)`}
                        fillOpacity={0.3}
                        animationDuration={1000}
                        name="Revenue"
                        connectNulls={false}
                    />
                    <Area
                        type="monotone"
                        dataKey="payment"
                        yAxisId="right"
                        stroke={COLORS.warning}
                        fill={`url(#areaGradientPayment)`}
                        fillOpacity={0.3}
                        animationDuration={1000}
                        name="Payment"
                        connectNulls={false}
                    />
                    <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={COLORS.success} />
                            <stop offset="100%" stopColor={`${COLORS.success}80`} />
                        </linearGradient>
                        <linearGradient id="areaGradientPayment" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={COLORS.warning} />
                            <stop offset="100%" stopColor={`${COLORS.warning}80`} />
                        </linearGradient>
                    </defs>
                </AreaChart>
            </ResponsiveContainer>
        </ChartCard>
    </div>
);

export default DailyRevenueChart;