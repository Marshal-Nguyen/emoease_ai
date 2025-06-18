import { useState, useEffect, useRef, memo } from "react";
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart,
    Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,
    AreaChart, Area
} from "recharts";
import { motion } from "framer-motion";
import { Users, Briefcase, ShoppingCart, DollarSign, TrendingUp, CreditCard, Clock, Star } from "lucide-react";
import { saveAs } from 'file-saver';
import styled from 'styled-components';
import Loader from "../../../components/Web/Loader";
import * as XLSX from 'xlsx';
import { useNavigate } from "react-router-dom";

const COLORS = {
    primary: "#4F46E5",
    secondary: "#F472B6",
    accent: "#60A5FA",
    warning: "#FBBF24",
    success: "#34D399",
    danger: "#F87171",
    bgGradientStart: "#E0E7FF",
    bgGradientEnd: "#F9FAFB",
    textPrimary: "#1F2937",
    textSecondary: "#6B7280",
    cardBg: "linear-gradient(145deg, #FFFFFF, #F3F4F6)",
    cardShadow: "#00000015",
    border: "#E5E7EB",
    number: "#100341"
};

const ICON_CONFIG = {
    users: { Icon: Users, color: COLORS.primary, bg: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primary}80)` },
    doctors: { Icon: Briefcase, color: COLORS.secondary, bg: `linear-gradient(135deg, ${COLORS.secondary}, ${COLORS.secondary}80)` },
    sales: { Icon: ShoppingCart, color: COLORS.accent, bg: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accent}80)` },
    revenue: { Icon: DollarSign, color: COLORS.success, bg: `linear-gradient(135deg, ${COLORS.success}, ${COLORS.success}80)` },
    subscriptions: { Icon: CreditCard, color: COLORS.primary, bg: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primary}80)` },
    bookings: { Icon: Clock, color: COLORS.accent, bg: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accent}80)` },
    topDoctors: { Icon: Star, color: COLORS.danger, bg: `linear-gradient(135deg, ${COLORS.danger}, ${COLORS.danger}80)` },
    growth: { Icon: TrendingUp, color: COLORS.secondary, bg: `linear-gradient(135deg, ${COLORS.secondary}, ${COLORS.secondary}80)` },
    salesOverview: { Icon: TrendingUp, color: COLORS.accent, bg: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accent}80)` },
    revenueGrowth: { Icon: DollarSign, color: COLORS.success, bg: `linear-gradient(135deg, ${COLORS.success}, ${COLORS.success}80)` },
    userDistribution: { Icon: Users, color: COLORS.primary, bg: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primary}80)` },
    performance: { Icon: Star, color: COLORS.warning, bg: `linear-gradient(135deg, ${COLORS.warning}, ${COLORS.warning}80)` },
};

const StatCard = memo(({ config, label, value, details }) => (
    <motion.div
        className="p-5 rounded-xl shadow-lg flex items-center gap-4 transition-transform hover:scale-105"
        style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        <div className="p-3 rounded-full relative overflow-hidden">
            <div className="absolute inset-0" style={{ background: config.bg }} />
            <config.Icon className="w-6 h-6 relative z-10" style={{ color: '#FFFFFF' }} />
        </div>
        <div>
            <p className="text-sm font-bold tracking-wide uppercase" style={{ color: config.color, letterSpacing: '0.05em' }}>{label}</p>
            <h3 className="text-2xl font-bold mt-1" style={{ color: COLORS.number }}>{value}</h3>
            {details && (
                <div className="mt-2 text-sm" style={{ color: COLORS.textPrimary }}>
                    {details}
                </div>
            )}
        </div>
    </motion.div>
));

const ChartCard = memo(({ title, children, config }) => (
    <motion.div
        className="p-6 rounded-xl shadow-lg transition-transform hover:scale-102"
        style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full relative overflow-hidden">
                <div className="absolute inset-0" style={{ background: config.bg }} />
                <config.Icon className="w-5 h-5 relative z-10" style={{ color: '#FFFFFF' }} />
            </div>
            <h2 className="text-lg font-semibold tracking-tight" style={{ color: COLORS.textPrimary }}>
                {title}
            </h2>
        </div>
        {children}
    </motion.div>
));

const ExportButton = ({ onClick }) => (
    <StyledWrapper>
        <button className="button" type="button" onClick={onClick}>
            <span className="button__text">Excel</span>
            <span className="button__icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35 35" className="svg">
                    <path d="M17.5,22.131a1.249,1.249,0,0,1-1.25-1.25V2.187a1.25,1.25,0,0,1,2.5,0V20.881A1.25,1.25,0,0,1,17.5,22.131Z" />
                    <path d="M17.5,22.693a3.189,3.189,0,0,1-2.262-.936L8.487,15.006a1.249,1.249,0,0,1,1.767-1.767l6.751,6.751a.7.7,0,0,0,.99,0l6.751-6.751a1.25,1.25,0,0,1,1.768,1.767l-6.752,6.751A3.191,3.191,0,0,1,17.5,22.693Z" />
                    <path d="M31.436,34.063H3.564A3.318,3.318,0,0,1,.25,30.749V22.011a1.25,1.25,0,0,1,2.5,0v8.738a.815.815,0,0,0,.814.814H31.436a.815.815,0,0,0,.814-.814V22.011a1.25,1.25,0,0,1,2.5,0v8.738A3.318,3.318,0,0,1,31.436,34.063Z" />
                </svg>
            </span>
        </button>
    </StyledWrapper>
);

const StyledWrapper = styled.div`
    .button {
        position: relative;
        width: 80px;
        height: 40px;
        cursor: pointer;
        display: flex;
        align-items: center;
        border: 1px solid #17795E;
        background: linear-gradient(90deg, #209978, #17795E);
        overflow: hidden;
        border-radius: 8px;
        transition: all 0.3s ease;
    }

    .button, .button__icon, .button__text {
        transition: all 0.3s;
    }

    .button .button__text {
        transform: translateX(22px);
        color: #fff;
        font-weight: 600;
    }

    .button .button__icon {
        position: absolute;
        transform: translateX(109px);
        height: 100%;
        width: 39px;
        background-color: #17795E;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .button .svg {
        width: 20px;
        fill: #fff;
    }

    .button:hover {
        background: linear-gradient(90deg, #17795E, #146c54);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .button:hover .button__text {
        color: transparent;
    }

    .button:hover .button__icon {
        width: 80px;
        transform: translateX(0);
    }

    .button:active .button__icon {
        background-color: #146c54;
    }

    .button:active {
        border: 1px solid #146c54;
    }
`;

export default function Dashboard() {
    const [state, setState] = useState({
        totalUsers: "N/A",
        users: { male: "N/A", female: "N/A", else: "N/A" },
        totalDoctors: "N/A",
        productsSold: { total: "N/A", details: [] },
        subscriptions: { total: "N/A", details: { AwaitPayment: "N/A", Active: "N/A", Expired: "N/A", Cancelled: "N/A" } },
        bookings: { total: "N/A", details: { Completed: "N/A", AwaitMeeting: "N/A", Cancelled: "N/A" } },
        topDoctors: { total: "N/A", details: [] },
        totalRevenue: "N/A",
        dailySales: []
    });
    const navigate = useNavigate();

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dates, setDates] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        start: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`,
        end: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()).padStart(2, '0')}`
    });
    const isMounted = useRef(false);
    const userName = localStorage.getItem("username");

    useEffect(() => {
        isMounted.current = true;
        const fetchData = async () => {
            try {
                setLoading(true);

                const [totalUsersData, usersData, doctorsData, productsData, subscriptionsData, bookingsData, topDoctorsData, dailyRevenueData] = await Promise.all([
                    fetch("https://anhtn.id.vn/profile-service/patients?PageIndex=1&PageSize=10")
                        .then(res => res.json())
                        .then(data => data.paginatedResult.totalCount.toLocaleString()),

                    Promise.all(["Male", "Female", "Else"].map(gender =>
                        fetch(`https://anhtn.id.vn/profile-service/patients/total?startDate=${dates.start}&endDate=${dates.end}&gender=${gender}`)
                            .then(res => res.json())
                            .then(data => [gender.toLowerCase(), data.totalPatients.toLocaleString()])
                    )).then(Object.fromEntries),

                    fetch("https://anhtn.id.vn/profile-service/doctors?PageIndex=1&PageSize=10")
                        .then(res => res.json()),

                    fetch(`https://anhtn.id.vn/subscription-service/service-packages/total?startDate=${dates.start}&endDate=${dates.end}`)
                        .then(res => res.json()),

                    Promise.all(["AwaitPayment", "Active", "Expired", "Cancelled"].map(status =>
                        fetch(`https://anhtn.id.vn/subscription-service/user-subscriptions/total?startDate=${dates.start}&endDate=${dates.end}&status=${status}`)
                            .then(res => res.json())
                            .then(data => [status, data.totalCount.toLocaleString()])
                    )).then(Object.fromEntries),

                    Promise.all(["Completed", "AwaitMeeting", "Cancelled"].map(status =>
                        fetch(`https://anhtn.id.vn/scheduling-service/bookings/count?StartDate=${dates.start}&EndDate=${dates.end}&BookingStatus=${status}`)
                            .then(res => res.json())
                            .then(data => [status, data.totalBookings.toLocaleString()])
                    )).then(Object.fromEntries),

                    fetch(`https://anhtn.id.vn/scheduling-service/bookings/top-doctors?StartDate=${dates.start}&EndDate=${dates.end}`)
                        .then(res => res.json()),

                    fetch(`https://anhtn.id.vn/payment-service/payments/daily-revenue?startTime=${dates.start}&endTime=${dates.end}`)
                        .then(res => res.json())
                ]);

                if (!isMounted.current) return;

                const startDate = new Date(dates.start);
                const endDate = new Date(dates.end);
                const currentDate = new Date();
                const dailyRevenueMap = new Map(dailyRevenueData.revenues.map(item => [item.date, {
                    totalRevenue: item.totalRevenue,
                    totalPayment: item.totalPayment
                }]));
                const dailySalesData = [];
                for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                    d.setHours(0, 0, 0, 0);
                    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    const data = (d <= currentDate) ? (dailyRevenueMap.get(dateStr) || { totalRevenue: 0, totalPayment: 0 }) : { totalRevenue: null, totalPayment: null };
                    dailySalesData.push({
                        name: dateStr,
                        revenue: data.totalRevenue,
                        payment: data.totalPayment
                    });
                }

                setState({
                    totalUsers: totalUsersData,
                    users: usersData,
                    totalDoctors: doctorsData.doctorProfiles.totalCount.toLocaleString(),
                    productsSold: {
                        total: productsData.reduce((sum, item) => sum + item.totalSubscriptions, 0).toLocaleString(),
                        details: productsData.map(item => ({ name: item.name, totalSubscriptions: item.totalSubscriptions.toLocaleString() }))
                    },
                    subscriptions: {
                        total: Object.values(subscriptionsData).reduce((sum, val) => sum + parseInt(val.replace(/,/g, '') || 0), 0).toLocaleString(),
                        details: subscriptionsData
                    },
                    bookings: {
                        total: Object.values(bookingsData).reduce((sum, val) => sum + parseInt(val.replace(/,/g, '') || 0), 0).toLocaleString(),
                        details: bookingsData
                    },
                    topDoctors: {
                        total: topDoctorsData.topDoctors.reduce((sum, doctor) => sum + doctor.totalBookings, 0).toLocaleString(),
                        details: topDoctorsData.topDoctors.map(doctor => ({
                            fullName: doctor.fullName,
                            bookings: doctor.totalBookings.toLocaleString()
                        }))
                    },
                    totalRevenue: `${dailySalesData.reduce((sum, item) => sum + (item.revenue || 0), 0).toLocaleString('vi-VN')} ₫`,
                    dailySales: dailySalesData
                });
            } catch (err) {
                if (isMounted.current) setError(err.message);
            } finally {
                if (isMounted.current) setLoading(false);
            }
        };

        fetchData();
        return () => { isMounted.current = false; };
    }, [dates.month, dates.year]);

    const handleDateChange = (type) => (e) => {
        const value = parseInt(e.target.value);
        if (type === "month") {
            setDates(prev => {
                const newMonth = value;
                const start = `${prev.year}-${String(newMonth).padStart(2, '0')}-01`;
                const lastDay = new Date(prev.year, newMonth, 0).getDate();
                const end = `${prev.year}-${String(newMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
                return { ...prev, month: newMonth, start, end };
            });
        } else if (type === "year") {
            setDates(prev => {
                const newYear = value;
                const start = `${newYear}-${String(prev.month).padStart(2, '0')}-01`;
                const lastDay = new Date(newYear, prev.month, 0).getDate();
                const end = `${newYear}-${String(prev.month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
                return { ...prev, year: newYear, start, end };
            });
        }
    };

    const getGenderTotalUsers = () => {
        const total = Object.values(state.users)
            .reduce((sum, val) => sum + parseInt(val.replace(/,/g, '') || 0), 0);
        return total ? total.toLocaleString() : "N/A";
    };

    const exportToExcel = () => {
        const monthName = new Date(0, dates.month - 1).toLocaleString('en-US', { month: 'long' });
        const wb = XLSX.utils.book_new();

        const overviewData = [
            [`Monthly Statistics for ${monthName} ${dates.year}`],
            ['Generated on', new Date().toLocaleString('en-US')],
            [],
            ['Category', 'Value', 'Details'],
            ['Total Users', state.totalUsers, `Gender Breakdown - Male: ${state.users.male}, Female: ${state.users.female}, Other: ${state.users.else} (Total: ${getGenderTotalUsers()})`],
            ['Total Doctors', state.totalDoctors, ''],
            ['Service Packages Sold', state.productsSold.total, state.productsSold.details.map(item => `${item.name}: ${item.totalSubscriptions}`).join('; ')],
            ['Subscriptions', state.subscriptions.total, Object.entries(state.subscriptions.details).map(([k, v]) => `${k}: ${v}`).join('; ')],
            ['Total Bookings', state.bookings.total, Object.entries(state.bookings.details).map(([k, v]) => `${k}: ${v}`).join('; ')],
            ['Top Doctors', state.topDoctors.total, state.topDoctors.details.map(item => `${item.fullName}: ${item.bookings}`).join('; ')],
            ['Total Revenue', state.totalRevenue, '']
        ];
        const ws1 = XLSX.utils.aoa_to_sheet(overviewData);
        XLSX.utils.book_append_sheet(wb, ws1, 'Overview');

        const dailySalesData = [
            ['Daily Sales'],
            ['Date', 'Revenue'],
            ...state.dailySales.map(item => [item.name, item.revenue !== null ? `${item.revenue.toLocaleString('vi-VN')} ₫` : 'N/A'])
        ];
        const ws2 = XLSX.utils.aoa_to_sheet(dailySalesData);
        XLSX.utils.book_append_sheet(wb, ws2, 'Daily Sales');

        const packagesData = [
            ['Service Packages Sold'],
            ['Name', 'Total Subscriptions'],
            ...state.productsSold.details.map(item => [item.name, item.totalSubscriptions])
        ];
        const ws3 = XLSX.utils.aoa_to_sheet(packagesData);
        XLSX.utils.book_append_sheet(wb, ws3, 'Service Packages');

        const subscriptionsData = [
            ['Subscriptions Details'],
            ['Status', 'Count'],
            ...Object.entries(state.subscriptions.details).map(([status, count]) => [status, count])
        ];
        const ws4 = XLSX.utils.aoa_to_sheet(subscriptionsData);
        XLSX.utils.book_append_sheet(wb, ws4, 'Subscriptions');

        const bookingsData = [
            ['Bookings Details'],
            ['Status', 'Count'],
            ...Object.entries(state.bookings.details).map(([status, count]) => [status, count])
        ];
        const ws6 = XLSX.utils.aoa_to_sheet(bookingsData);
        XLSX.utils.book_append_sheet(wb, ws6, 'Bookings');

        const topDoctorsData = [
            ['Top Performing Doctors'],
            ['Name', 'Bookings'],
            ...state.topDoctors.details.map(item => [item.fullName, item.bookings])
        ];
        const ws5 = XLSX.utils.aoa_to_sheet(topDoctorsData);
        XLSX.utils.book_append_sheet(wb, ws5, 'Top Doctors');

        XLSX.writeFile(wb, `monthly_statistics_${monthName}_${dates.year}.xlsx`);
    };

    const userDistributionData = [
        { name: "Male", value: parseInt(state.users.male.replace(/,/g, '') || 0), color: COLORS.accent },
        { name: "Female", value: parseInt(state.users.female.replace(/,/g, '') || 0), color: COLORS.secondary },
        { name: "Other", value: parseInt(state.users.else.replace(/,/g, '') || 0), color: "linear-gradient(90deg, #60A5FA, #ff96ff)" },
    ].filter(item => item.value > 0);

    const revenueGrowthData = Object.entries(state.subscriptions.details).map(([status, count]) => ({
        name: status,
        value: parseInt(count.replace(/,/g, '') || 0),
        fill: status === "Active" ? COLORS.success :
            status === "AwaitPayment" ? COLORS.warning :
                status === "Expired" ? COLORS.danger :
                    COLORS.secondary,
    }));

    const servicePackagesData = state.productsSold.details.map(item => ({
        name: item.name,
        total: parseInt(item.totalSubscriptions.replace(/,/g, '') || 0),
    }));

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div
                    className="p-3 rounded-lg shadow-md"
                    style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}
                >
                    <p className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>
                        {label}
                    </p>
                    <p className="text-sm" style={{ color: COLORS.success }}>
                        {`Revenue: ${payload[0].payload.revenue !== null ? payload[0].payload.revenue.toLocaleString('vi-VN') + ' ₫' : 'N/A'}`}
                    </p>
                    <p className="text-sm" style={{ color: COLORS.warning }}>
                        {`Payment: ${payload[0].payload.payment !== null ? payload[0].payload.payment.toLocaleString('vi-VN') : 'N/A'}`}
                    </p>
                </div>
            );
        }
        return null;
    };

    if (loading) return <Loader />;

    return (
        <div
            className="min-h-screen py-6 px-4"
            style={{ background: `radial-gradient(circle at top left, ${COLORS.bgGradientStart}, ${COLORS.bgGradientEnd})` }}
        >
            <div className="max-w-7xl mx-auto">
                <motion.div
                    className="sticky top-0 z-10 bg-white/80 backdrop-blur-md p-4 rounded-b-xl shadow-md flex justify-between items-center mb-2"
                    initial={{ y: -50 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-2xl font-bold tracking-tight text-purple-400">
                        Hi {userName}, Welcome back 👋
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>Month:</label>
                            <select
                                value={dates.month}
                                onChange={handleDateChange("month")}
                                className="p-2 text-sm rounded-lg shadow-sm transition-all duration-300 hover:shadow-md focus:ring-2 focus:ring-primary"
                                style={{
                                    background: COLORS.cardBg,
                                    border: `1px solid ${COLORS.border}`,
                                    color: COLORS.textPrimary
                                }}
                            >
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={i + 1} style={{ color: COLORS.textPrimary }}>
                                        {new Date(0, i).toLocaleString('en-US', { month: 'long' })}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>Year:</label>
                            <select
                                value={dates.year}
                                onChange={handleDateChange("year")}
                                className="p-2 text-sm rounded-lg shadow-sm transition-all duration-300 hover:shadow-md focus:ring-2 focus:ring-primary"
                                style={{
                                    background: COLORS.cardBg,
                                    border: `1px solid ${COLORS.border}`,
                                    color: COLORS.textPrimary
                                }}
                            >
                                {Array.from({ length: 10 }, (_, i) => {
                                    const year = new Date().getFullYear() - 5 + i;
                                    return <option key={year} value={year} style={{ color: COLORS.textPrimary }}>{year}</option>;
                                })}
                            </select>
                        </div>
                        <ExportButton onClick={exportToExcel} />
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
                    <div className="lg:col-span-2">
                        <ChartCard title="Daily Revenue Trend" config={ICON_CONFIG.salesOverview}>
                            <ResponsiveContainer width="100%" height={310}>
                                <AreaChart data={state.dailySales}>
                                    <XAxis
                                        dataKey="name"
                                        stroke={COLORS.textSecondary}
                                        tick={{ fill: COLORS.textSecondary, fontSize: 12 }}
                                        tickFormatter={(value) => new Date(value).getDate()}
                                    />
                                    <YAxis
                                        stroke={COLORS.textSecondary}
                                        tick={{ fill: COLORS.textSecondary, fontSize: 12 }}
                                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ color: COLORS.textPrimary }} />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke={COLORS.accent}
                                        fill={`url(#areaGradient)`}
                                        fillOpacity={0.3}
                                        animationDuration={1000}
                                        name="Revenue"
                                        connectNulls={false}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="payment"
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
                    <div className="space-y-2">
                        <div onClick={() => navigate("/manager/viewCustomer")} className="cursor-pointer">
                            <StatCard
                                config={ICON_CONFIG.users}
                                label="New Users"
                                value={state.totalUsers}
                                details={
                                    <div>
                                        <strong style={{ color: '#60A5FA' }}>Male</strong>: <span>{state.users.male}</span> |
                                        <strong style={{ color: '#ff96ff' }}> Female</strong>: <span>{state.users.female}</span> |
                                        <strong style={{
                                            background: 'linear-gradient(90deg, #60A5FA, #ff96ff)',
                                            WebkitBackgroundClip: 'text',
                                            color: 'transparent'
                                        }}> Other</strong>: <span>{state.users.else}</span>
                                        <br />
                                        <span> <span className="text-green-800">Total User:</span> {getGenderTotalUsers()}</span>
                                    </div>
                                }
                            />
                        </div>
                        <div onClick={() => navigate("/manager/transaction")} className="cursor-pointer">
                            <StatCard config={ICON_CONFIG.revenue} label="Total Revenue" value={state.totalRevenue} />
                        </div>
                        <StatCard
                            config={ICON_CONFIG.sales}
                            label="Service Packages Sold"
                            value={state.productsSold.total}
                            details={state.productsSold.details.map((item, i) => (
                                <p
                                    key={i}
                                    className="my-1 flex justify-between"
                                    style={{ color: ['blue', 'red', 'green', 'purple', 'orange'][i % 5] }}
                                >
                                    <span>{i + 1}. {item.name}</span>
                                    <strong>{item.totalSubscriptions}</strong>
                                </p>
                            ))}
                        />
                    </div>
                    <div className="space-y-2">

                        <div onClick={() => navigate("/manager/booking")} className="cursor-pointer">
                            <StatCard
                                config={ICON_CONFIG.bookings}
                                label="Total Bookings"
                                value={state.bookings.total}
                                details={Object.entries(state.bookings.details).map(([status, count], i) => (
                                    <p
                                        key={i}
                                        className="my-1 flex justify-between"
                                        style={{ color: ['green', 'orange', 'red'][i % 3] }}
                                    >
                                        <span>{status}</span>
                                        <strong>{count}</strong>
                                    </p>
                                ))}
                            />
                        </div>
                        <div onClick={() => navigate("/manager/viewDoctor")} className="cursor-pointer">
                            <StatCard config={ICON_CONFIG.doctors} label="Total Doctors" value={state.totalDoctors} />

                        </div>
                        <StatCard
                            config={ICON_CONFIG.topDoctors}
                            label="Top Performing Doctors"
                            details={state.topDoctors.details.map((item, i) => (
                                <div
                                    key={i}
                                    className="my-1 flex justify-between"
                                    style={{ color: ['red', 'orange', 'green', 'purple', 'blue'][i % 5] }}
                                >
                                    <span>{i + 1}. {item.fullName}</span>
                                    <strong>{item.bookings}</strong>
                                </div>
                            ))}
                        />
                    </div>
                </div>

                <div className="my-2 border-t" style={{ borderColor: COLORS.border }} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard title="Subscription Status Overview" config={ICON_CONFIG.revenueGrowth}>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={revenueGrowthData}>
                                <XAxis
                                    dataKey="name"
                                    stroke={COLORS.textSecondary}
                                    tick={{ fill: COLORS.textSecondary, fontSize: 12 }}
                                />
                                <YAxis
                                    stroke={COLORS.textSecondary}
                                    tick={{ fill: COLORS.textSecondary, fontSize: 12 }}
                                />
                                <Tooltip
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div
                                                    className="p-3 rounded-lg shadow-md"
                                                    style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}
                                                >
                                                    <p className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>
                                                        {`${label}: ${payload[0].value.toLocaleString()}`}
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Legend wrapperStyle={{ color: COLORS.textPrimary }} />
                                <Bar dataKey="value" radius={[8, 8, 0, 0]} name="Subscriptions">
                                    {revenueGrowthData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={`url(#barGradient-${index})`} />
                                    ))}
                                </Bar>
                                {revenueGrowthData.map((entry, index) => (
                                    <defs key={index}>
                                        <linearGradient id={`barGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={entry.fill} />
                                            <stop offset="100%" stopColor={`${entry.fill}80`} />
                                        </linearGradient>
                                    </defs>
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="User Distribution" config={ICON_CONFIG.userDistribution}>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={userDistributionData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    innerRadius={40}
                                    dataKey="value"
                                    animationDuration={1000}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    labelLine={{ stroke: COLORS.textSecondary }}
                                >
                                    {userDistributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={`url(#pieGradient-${index})`} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: COLORS.cardBg,
                                        borderRadius: '8px',
                                        border: `1px solid ${COLORS.border}`,
                                        color: COLORS.textPrimary
                                    }}
                                />
                                <Legend wrapperStyle={{ color: COLORS.textPrimary }} />
                                {userDistributionData.map((entry, index) => (
                                    <defs key={index}>
                                        <linearGradient id={`pieGradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0%" stopColor={entry.color} />
                                            <stop offset="100%" stopColor={`${entry.color}80`} />
                                        </linearGradient>
                                    </defs>
                                ))}
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Top Doctors Performance" config={ICON_CONFIG.performance}>
                        <ResponsiveContainer width="100%" height={300}>
                            <RadarChart data={state.topDoctors.details.map(item => ({
                                subject: item.fullName && typeof item.fullName === 'string'
                                    ? item.fullName.split(' ').slice(-1)[0]
                                    : 'Unknown',
                                bookings: parseInt(item.bookings.replace(/,/g, '') || 0),
                                fullName: item.fullName
                            }))}>
                                <PolarGrid stroke={COLORS.textSecondary} />
                                <PolarAngleAxis
                                    dataKey="subject"
                                    stroke={COLORS.textPrimary}
                                    tick={{ fill: COLORS.textPrimary, fontSize: 12 }}
                                />
                                <PolarRadiusAxis
                                    angle={90}
                                    domain={[0, 'dataMax']}
                                    stroke={COLORS.textSecondary}
                                    tick={{ fill: COLORS.textSecondary, fontSize: 12 }}
                                />
                                <Radar
                                    name="Bookings"
                                    dataKey="bookings"
                                    stroke={COLORS.warning}
                                    fill={`url(#radarGradient)`}
                                    fillOpacity={0.6}
                                    animationDuration={1000}
                                />
                                <Tooltip
                                    content={({ active, payload }) =>
                                        active && payload && payload.length ? (
                                            <div
                                                className="p-3 rounded-lg shadow-md"
                                                style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}
                                            >
                                                <p style={{ color: COLORS.textPrimary }}>
                                                    {`${payload[0].payload.fullName}: ${payload[0].value} bookings`}
                                                </p>
                                            </div>
                                        ) : null
                                    }
                                />
                                <Legend wrapperStyle={{ color: COLORS.textPrimary }} />
                                <defs>
                                    <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor={COLORS.warning} />
                                        <stop offset="100%" stopColor={`${COLORS.warning}80`} />
                                    </linearGradient>
                                </defs>
                            </RadarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Service Packages Breakdown" config={ICON_CONFIG.sales}>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={servicePackagesData}>
                                <XAxis
                                    dataKey="name"
                                    stroke={COLORS.textSecondary}
                                    tick={{ fill: COLORS.textSecondary, fontSize: 12 }}
                                />
                                <YAxis
                                    stroke={COLORS.textSecondary}
                                    tick={{ fill: COLORS.textSecondary, fontSize: 12 }}
                                />
                                <Tooltip
                                    content={({ active, payload, label }) =>
                                        active && payload && payload.length ? (
                                            <div
                                                className="p-3 rounded-lg shadow-md"
                                                style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}
                                            >
                                                <p style={{ color: COLORS.textPrimary }}>{label}</p>
                                                <p style={{ color: COLORS.accent }}>
                                                    {`Total Subscriptions: ${payload[0].value.toLocaleString()}`}
                                                </p>
                                            </div>
                                        ) : null
                                    }
                                />
                                <Legend wrapperStyle={{ color: COLORS.textPrimary }} />
                                <Bar
                                    dataKey="total"
                                    fill={`url(#barGradient)`}
                                    name="Total Subscriptions"
                                    radius={[8, 8, 0, 0]}
                                />
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={COLORS.accent} />
                                        <stop offset="100%" stopColor={`${COLORS.accent}80`} />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>

                {error && (
                    <p className="mt-6 text-center text-sm" style={{ color: COLORS.danger }}>
                        Error: ${error}
                    </p>
                )}
            </div>
        </div>
    );
}