import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  // LineChart,
  // Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { motion } from "framer-motion";
import {
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  Clock,
  Star,
  BarChart2,
} from "lucide-react";
import styled from "styled-components";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import Loader from "../../../components/Web/Loader";

// Environment variable for API base URL
const API_BASE_URL = import.meta.env.VITE_API;

// Utility to get first and last day of the month
const getMonthDateRange = (year, month) => {
  const start = new Date(year, month - 1, 1).toISOString().split("T")[0];
  const end = new Date(year, month, 0).toISOString().split("T")[0];
  return { start, end };
};

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
  number: "#100341",
};

const ICON_CONFIG = {
  users: {
    Icon: Users,
    color: COLORS.primary,
    bg: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primary}80)`,
  },
  doctors: {
    Icon: Briefcase,
    color: COLORS.secondary,
    bg: `linear-gradient(135deg, ${COLORS.secondary}, ${COLORS.secondary}80)`,
  },
  tests: {
    Icon: BarChart2,
    color: COLORS.accent,
    bg: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accent}80)`,
  },
  revenue: {
    Icon: DollarSign,
    color: COLORS.success,
    bg: `linear-gradient(135deg, ${COLORS.success}, ${COLORS.success}80)`,
  },
  bookings: {
    Icon: Clock,
    color: COLORS.accent,
    bg: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accent}80)`,
  },
  topDoctors: {
    Icon: Star,
    color: COLORS.danger,
    bg: `linear-gradient(135deg, ${COLORS.danger}, ${COLORS.danger}80)`,
  },
  salesOverview: {
    Icon: TrendingUp,
    color: COLORS.accent,
    bg: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accent}80)`,
  },
  userribution: {
    Icon: Users,
    color: COLORS.primary,
    bg: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primary}80)`,
  },
  testTrends: {
    Icon: TrendingUp,
    color: COLORS.warning,
    bg: `linear-gradient(135deg, ${COLORS.warning}, ${COLORS.warning}80)`,
  },
};

const StatCard = React.memo(({ config, label, value, details }) => (
  <motion.div
    className="p-5 rounded-xl shadow-lg flex items-center gap-4 transition-transform hover:scale-105"
    style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="p-3 rounded-full relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: config.bg }} />
      <config.Icon
        className="w-6 h-6 relative z-10"
        style={{ color: "#FFFFFF" }}
      />
    </div>
    <div>
      <p
        className="text-sm font-bold tracking-wide uppercase"
        style={{ color: config.color, letterSpacing: "0.05em" }}
      >
        {label}
      </p>
      <h3 className="text-2xl font-bold mt-1" style={{ color: COLORS.number }}>
        {value}
      </h3>
      {details && (
        <div className="mt-2 text-sm" style={{ color: COLORS.textPrimary }}>
          {details}
        </div>
      )}
    </div>
  </motion.div>
));

const ChartCard = React.memo(({ title, children, config }) => (
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
        <config.Icon
          className="w-5 h-5 relative z-10"
          style={{ color: "#FFFFFF" }}
        />
      </div>
      <h2
        className="text-lg font-semibold tracking-tight"
        style={{ color: COLORS.textPrimary }}
      >
        {title}
      </h2>
    </div>
    {children}
  </motion.div>
));

const ExportButton = React.memo(({ onClick }) => (
  <StyledWrapper>
    <button className="button" type="button" onClick={onClick}>
      <span className="button__text">Excel</span>
      <span className="button__icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 35 35"
          className="svg"
        >
          <path d="M17.5,22.131a1.249,1.249,0,0,1-1.25-1.25V2.187a1.25,1.25,0,0,1,2.5,0V20.881A1.25,1.25,0,0,1,17.5,22.131Z" />
          <path d="M17.5,22.693a3.189,3.189,0,0,1-2.262-.936L8.487,15.006a1.249,1.249,0,0,1,1.767-1.767l6.751,6.751a.7.7,0,0,0,.99,0l6.751-6.751a1.25,1.25,0,0,1,1.768,1.767l-6.752,6.751A3.191,3.191,0,0,1,17.5,22.693Z" />
          <path d="M31.436,34.063H3.564A3.318,3.318,0,0,1,.25,30.749V22.011a1.25,1.25,0,0,1,2.5,0v8.738a.815.815,0,0,0,.814.814H31.436a.815.815,0,0,0,.814-.814V22.011a1.25,1.25,0,0,1,2.5,0v8.738A3.318,3.318,0,0,1,31.436,34.063Z" />
        </svg>
      </span>
    </button>
  </StyledWrapper>
));

const StyledWrapper = styled.div`
  .button {
    position: relative;
    width: 80px;
    height: 40px;
    cursor: pointer;
    display: flex;
    align-items: center;
    border: 1px solid #17795e;
    background: linear-gradient(90deg, #209978, #17795e);
    overflow: hidden;
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  .button,
  .button__icon,
  .button__text {
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
    background-color: #17795e;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .button .svg {
    width: 20px;
    fill: #fff;
  }

  .button:hover {
    background: linear-gradient(90deg, #17795e, #146c54);
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
  const currentDate = new Date();
  const [state, setState] = useState({
    totalUsers: "0",
    totalUser: "0",
    users: { male: "0", female: "0", else: "0" },
    totalDoctors: "0",
    testStatistics: {
      total: "0",
      severityDistribution: {
        Severe: "0",
        Moderate: "0",
        Mild: "0",
      },
    },
    subscriptions: {
      total: "0",
      details: {
        AwaitPayment: "0",
        Active: "0",
        Expired: "0",
        Cancelled: "0",
      },
    },
    bookings: {
      total: "0",
      details: { BookingSuccess: "0", CheckIn: "0", Completed: "0", Cancelled: "0" },
    },
    topDoctors: {
      total: "0",
      details: [
        { fullName: "N/A", bookings: "0" },
        { fullName: "N/A", bookings: "0" },
        { fullName: "N/A", bookings: "0" },
        { fullName: "N/A", bookings: "0" },
      ],
    },
    totalRevenue: "0 ₫",
    dailySales: [],
    testTrends: [],
  });

  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dates, setDates] = useState({
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
    ...getMonthDateRange(currentDate.getFullYear(), currentDate.getMonth() + 1),
  });
  const isMounted = useRef(false);
  const userName = localStorage.getItem("username") || "User";
  const token = localStorage.getItem("token");

  const fetchData = useCallback(async () => {
    if (!token) {
      setError("Authentication token is missing. Please log in again.");
      setLoading(false);
      navigate("/login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [
        dailySalesResponse,
        bookingsResponse,
        doctorsResponse,
        usersResponse,
        topDoctorsResponse,
        testStatsResponse,
        testTrendsResponse,
      ] = await Promise.all([
        fetch(
          `${API_BASE_URL}/payment-zalo/daily-total?StartDate=${dates.start}&EndDate=${dates.end}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        ),
        fetch(
          `${API_BASE_URL}/bookings?StartDate=${dates.start}&EndDate=${dates.end}&Status=CheckIn`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        ),
        fetch(`${API_BASE_URL}/doctor-profiles`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(
          `${API_BASE_URL}/patient-statistics?startDate=${dates.start}&endDate=${dates.end}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        ),
        fetch(
          `${API_BASE_URL}/topdoctors/view?startDate=${dates.start}&endDate=${dates.end}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        ),
        fetch(
          `${API_BASE_URL}/test-view/statistics?startDate=${dates.start}&endDate=${dates.end}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        ),
        fetch(
          `${API_BASE_URL}/test-view/trends?startDate=${dates.start}&endDate=${dates.end}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        ),
      ]);

      if (!dailySalesResponse.ok) throw new Error("Failed to fetch daily sales");
      if (!bookingsResponse.ok) throw new Error("Failed to fetch bookings");
      if (!doctorsResponse.ok) throw new Error("Failed to fetch doctors");
      if (!usersResponse.ok) throw new Error("Failed to fetch users");
      if (!topDoctorsResponse.ok) throw new Error("Failed to fetch top doctors");
      if (!testStatsResponse.ok) throw new Error("Failed to fetch test statistics");
      if (!testTrendsResponse.ok) throw new Error("Failed to fetch test trends");

      const [
        dailySalesData,
        bookingsData,
        doctorsData,
        usersData,
        topDoctorsData,
        testStatsData,
        testTrendsData,
      ] = await Promise.all([
        dailySalesResponse.json(),
        bookingsResponse.json(),
        doctorsResponse.json(),
        usersResponse.json(),
        topDoctorsResponse.json(),
        testStatsResponse.json(),
        testTrendsResponse.json(),
      ]);

      const dailySales = dailySalesData.data?.map((item) => ({
        name: item.date,
        revenue: item.totalAmount || 0,
        payment: item.totalAmount || 0,
      })) || [];

      const bookings = {
        total: (
          (bookingsData.statusSummary?.statusSummary?.totalCheckOut || 0) +
          (bookingsData.statusSummary?.statusSummary?.totalCheckIn || 0) +
          (bookingsData.statusSummary?.statusSummary?.totalBookingSuccess || 0) +
          (bookingsData.statusSummary?.statusSummary?.totalCancelled || 0)
        ).toLocaleString(),
        details: {
          BookingSuccess: (bookingsData.statusSummary?.statusSummary?.totalBookingSuccess || 0).toLocaleString(),
          CheckIn: (bookingsData.statusSummary?.statusSummary?.totalCheckIn || 0).toLocaleString(),
          Completed: (bookingsData.statusSummary?.statusSummary?.totalCheckOut || 0).toLocaleString(),
          Cancelled: (bookingsData.statusSummary?.statusSummary?.totalCancelled || 0).toLocaleString(),
        },
      };

      const totalDoctors = doctorsData.data?.length.toLocaleString() || "0";

      const users = {
        male: (usersData.genderStats?.male || 0).toLocaleString(),
        female: (usersData.genderStats?.female || 0).toLocaleString(),
        else: (usersData.genderStats?.other || 0).toLocaleString(),
      };
      const totalUsers = (usersData.registeredInPeriod || 0).toLocaleString();
      const totalUser = (usersData.totalCount || 0).toLocaleString();

      const topDoctors = {
        total: (topDoctorsData?.length || 0).toLocaleString(),
        details: topDoctorsData?.map((doctor) => ({
          fullName: doctor.doctorName || "N/A",
          bookings: (doctor.bookingCount || 0).toLocaleString(),
        })) || [
            { fullName: "N/A", bookings: "0" },
            { fullName: "N/A", bookings: "0" },
            { fullName: "N/A", bookings: "0" },
            { fullName: "N/A", bookings: "0" },
          ],
      };

      const testStatistics = {
        total: (testStatsData.totalTests || 0).toLocaleString(),
        severityDistribution: {
          Severe: (testStatsData.severityDistribution?.Severe || 0).toLocaleString(),
          Moderate: (testStatsData.severityDistribution?.Moderate || 0).toLocaleString(),
          Mild: (testStatsData.severityDistribution?.Mild || 0).toLocaleString(),
        },
      };

      const testTrends = testTrendsData.trends?.map((item) => ({
        name: item.date,
        depression: item.avgDepressionScore || 0,
        anxiety: item.avgAnxietyScore || 0,
        stress: item.avgStressScore || 0,
      })) || [];

      setState({
        totalUsers,
        totalUser,
        users,
        totalDoctors,
        bookings,
        dailySales,
        topDoctors,
        testStatistics,
        testTrends,
        totalRevenue: (dailySalesData.totalAmountInRange || 0).toLocaleString("vi-VN") + " ₫",
        subscriptions: state.subscriptions,
      });
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [token, dates.start, dates.end, navigate]);

  useEffect(() => {
    console.log(">>>>>>> check 2");

    if (!isMounted.current) {
      console.log(">>>>>>> check 3");

      isMounted.current = true;
      return;
    }
    console.log(">>>>>>> check 4");

    const timer = setTimeout(() => {
      fetchData();
    }, 300); // Debounce API calls
    console.log(">>>>>>> check 1");
    return () => clearTimeout(timer);
  }, [fetchData]);

  // const handleDateChange = useCallback(
  //   (type) => (e) => {
  //     const value = parseInt(e.target.value);
  //     setDates((prev) => {
  //       let newMonth = prev.month;
  //       let newYear = prev.year;
  //       if (type === "month") {
  //         newMonth = value;
  //       } else if (type === "year") {
  //         newYear = value;
  //       }
  //       return { month: newMonth, year: newYear, ...getMonthDateRange(newYear, newMonth) };
  //     });
  //   },
  //   []
  // );

  // const getGenderTotalUsers = () => {
  //   const total = Object.values(state.users).reduce(
  //     (sum, val) => sum + parseInt(val.replace(/,/g, "") || 0),
  //     0
  //   );
  //   return total ? total.toLocaleString() : "N/A";
  // };

  const exportToExcel = useCallback(() => {
    const monthName = new Date(0, dates.month - 1).toLocaleString("en-US", {
      month: "long",
    });
    const wb = XLSX.utils.book_new();

    const overviewData = [
      [`Monthly Statistics for ${monthName} ${dates.year}`],
      ["Generated on", new Date().toLocaleString("en-US")],
      [],
      ["Category", "Value", "Details"],
      [
        "Total Users",
        state.totalUsers,
        `Gender Breakdown - Male: ${state.users.male}, Female: ${state.users.female}, Other: ${state.users.else} (Total: ${state.totalUser})`,
      ],
      ["Total Doctors", state.totalDoctors, ""],
      [
        "Test Statistics",
        state.testStatistics.total,
        Object.entries(state.testStatistics.severityDistribution)
          .map(([k, v]) => `${k}: ${v}`)
          .join("; "),
      ],
      [
        "Subscriptions",
        state.subscriptions.total,
        Object.entries(state.subscriptions.details)
          .map(([k, v]) => `${k}: ${v}`)
          .join("; "),
      ],
      [
        "Total Bookings",
        state.bookings.total,
        Object.entries(state.bookings.details)
          .map(([k, v]) => `${k}: ${v}`)
          .join("; "),
      ],
      [
        "Top Doctors",
        state.topDoctors.total,
        state.topDoctors.details
          .map((item) => `${item.fullName}: ${item.bookings}`)
          .join("; "),
      ],
      ["Total Revenue", state.totalRevenue, ""],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(wb, ws1, "Overview");

    const dailySalesData = [
      ["Daily Sales"],
      ["Date", "Revenue"],
      ...state.dailySales.map((item) => [
        item.name,
        item.revenue !== null
          ? `${item.revenue.toLocaleString("vi-VN")} ₫`
          : "N/A",
      ]),
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(dailySalesData);
    XLSX.utils.book_append_sheet(wb, ws2, "Daily Sales");

    const testStatsData = [
      ["Test Statistics"],
      ["Severity", "Count"],
      ...Object.entries(state.testStatistics.severityDistribution).map(([severity, count]) => [
        severity,
        count,
      ]),
    ];
    const ws3 = XLSX.utils.aoa_to_sheet(testStatsData);
    XLSX.utils.book_append_sheet(wb, ws3, "Test Statistics");

    const subscriptionsData = [
      ["Subscriptions Details"],
      ["Status", "Count"],
      ...Object.entries(state.subscriptions.details).map(([status, count]) => [
        status,
        count,
      ]),
    ];
    const ws4 = XLSX.utils.aoa_to_sheet(subscriptionsData);
    XLSX.utils.book_append_sheet(wb, ws4, "Subscriptions");

    const bookingsData = [
      ["Bookings Details"],
      ["Status", "Count"],
      ...Object.entries(state.bookings.details).map(([status, count]) => [
        status,
        count,
      ]),
    ];
    const ws6 = XLSX.utils.aoa_to_sheet(bookingsData);
    XLSX.utils.book_append_sheet(wb, ws6, "Bookings");

    const topDoctorsData = [
      ["Top Performing Doctors"],
      ["Name", "Bookings"],
      ...state.topDoctors.details.map((item) => [item.fullName, item.bookings]),
    ];
    const ws5 = XLSX.utils.aoa_to_sheet(topDoctorsData);
    XLSX.utils.book_append_sheet(wb, ws5, "Top Doctors");

    const testTrendsData = [
      ["Test Trends"],
      ["Date", "Avg Depression Score", "Avg Anxiety Score", "Avg Stress Score"],
      ...state.testTrends.map((item) => [
        item.name,
        item.depression.toFixed(2),
        item.anxiety.toFixed(2),
        item.stress.toFixed(2),
      ]),
    ];
    const ws7 = XLSX.utils.aoa_to_sheet(testTrendsData);
    XLSX.utils.book_append_sheet(wb, ws7, "Test Trends");

    XLSX.writeFile(wb, `monthly_statistics_${monthName}_${dates.year}.xlsx`);
  }, [dates.month, dates.year, state]);

  const userributionData = [
    {
      name: "Male",
      value: parseInt(state.users.male.replace(/,/g, "") || 0),
      color: COLORS.accent,
    },
    {
      name: "Female",
      value: parseInt(state.users.female.replace(/,/g, "") || 0),
      color: COLORS.secondary,
    },
    {
      name: "Other",
      value: parseInt(state.users.else.replace(/,/g, "") || 0),
      color: "linear-gradient(90deg, #60A5FA, #ff96ff)",
    },
  ].filter((item) => item.value > 0);

  const bookingStatusData = Object.entries(state.bookings.details).map(
    ([status, count]) => ({
      name: status,
      value: parseInt(count.replace(/,/g, "") || 0),
      fill:
        status === "BookingSuccess"
          ? COLORS.warning
          : status === "CheckIn"
            ? COLORS.accent
            : status === "Completed"
              ? COLORS.success
              : COLORS.danger,
    })
  );

  const testStatsData = Object.entries(state.testStatistics.severityDistribution).map(
    ([severity, count]) => ({
      name: severity,
      value: parseInt(count.replace(/,/g, "") || 0),
    })
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="p-3 rounded-lg shadow-md"
          style={{
            background: COLORS.cardBg,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <p
            className="text-sm font-medium"
            style={{ color: COLORS.textPrimary }}
          >
            {label}
          </p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value !== null ? entry.value.toLocaleString("vi-VN") : "N/A"}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) return <Loader />;

  return (
    <div
      className="min-h-screen py-6 px-4"
      style={{
        background: `radial-gradient(circle at top left, ${COLORS.bgGradientStart}, ${COLORS.bgGradientEnd})`,
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* <motion.div
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
              <label
                className="text-sm font-medium"
                style={{ color: COLORS.textPrimary }}
              >
                Month:
              </label>
              <select
                value={dates.month}
                onChange={handleDateChange("month")}
                className="p-2 text-sm rounded-lg shadow-sm transition-all duration-300 hover:shadow-md focus:ring-2 focus:ring-primary"
                style={{
                  background: COLORS.cardBg,
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.textPrimary,
                }}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option
                    key={i + 1}
                    value={i + 1}
                    style={{ color: COLORS.textPrimary }}
                  >
                    {new Date(0, i).toLocaleString("en-US", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label
                className="text-sm font-medium"
                style={{ color: COLORS.textPrimary }}
              >
                Year:
              </label>
              <select
                value={dates.year}
                onChange={handleDateChange("year")}
                className="p-2 text-sm rounded-lg shadow-sm transition-all duration-300 hover:shadow-md focus:ring-2 focus:ring-primary"
                style={{
                  background: COLORS.cardBg,
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.textPrimary,
                }}
              >
                {Array.from({ length: 10 }, (_, i) => {
                  const year = new Date().getFullYear() - 5 + i;
                  return (
                    <option
                      key={year}
                      value={year}
                      style={{ color: COLORS.textPrimary }}
                    >
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
            <ExportButton onClick={exportToExcel} />
          </div>
        </motion.div> */}

        {/* <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
          <div className="lg:col-span-2">
            <ChartCard
              title="Daily Revenue Trend"
              config={ICON_CONFIG.salesOverview}
              key={`daily-revenue-${dates.start}-${dates.end}`}
            >
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
                    <linearGradient
                      id="areaGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={COLORS.success} />
                      <stop offset="100%" stopColor={`${COLORS.success}80`} />
                    </linearGradient>
                    <linearGradient
                      id="areaGradientPayment"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={COLORS.warning} />
                      <stop offset="100%" stopColor={`${COLORS.warning}80`} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
          <div className="space-y-2">
            <div
              onClick={() => navigate("/manager/viewCustomer")}
              className="cursor-pointer"
            >
              <StatCard
                config={ICON_CONFIG.users}
                label="New Users"
                value={state.totalUsers}
                details={
                  <div>
                    <strong style={{ color: "#60A5FA" }}>Male</strong>:{" "}
                    <span>{state.users.male}</span> |{" "}
                    <strong style={{ color: "#ff96ff" }}>Female</strong>:{" "}
                    <span>{state.users.female}</span> |{" "}
                    <strong
                      style={{
                        background: "linear-gradient(90deg, #60A5FA, #ff96ff)",
                        WebkitBackgroundClip: "text",
                        color: "transparent",
                      }}
                    >
                      Other
                    </strong>
                    : <span>{state.users.else}</span>
                    <br />
                    <span>
                      <span className="text-green-800">Total User:</span>{" "}
                      {state.totalUser}
                    </span>
                  </div>
                }
              />
            </div>
            <div
              onClick={() => navigate("/manager/transaction")}
              className="cursor-pointer"
            >
              <StatCard
                config={ICON_CONFIG.revenue}
                label="Total Revenue"
                value={state.totalRevenue}
              />
            </div>
            <StatCard
              config={ICON_CONFIG.tests}
              label="Test Statistics"
              value={state.testStatistics.total}
              details={Object.entries(state.testStatistics.severityDistribution).map(
                ([severity, count], i) => (
                  <p
                    key={i}
                    className="my-1 flex justify-between"
                    style={{ color: ["red", "orange", "green"][i % 3] }}
                  >
                    <span>{severity}</span>
                    <strong>{count}</strong>
                  </p>
                )
              )}
            />
          </div>
          <div className="space-y-2">
            <div
              onClick={() => navigate("/manager/booking")}
              className="cursor-pointer"
            >
              <StatCard
                config={ICON_CONFIG.bookings}
                label="Total Bookings"
                value={state.bookings.total}
                details={Object.entries(state.bookings.details).map(
                  ([status, count], i) => (
                    <p
                      key={i}
                      className="my-1 flex justify-between"
                      style={{ color: ["orange", "blue", "green", "red"][i % 4] }}
                    >
                      <span>{status}</span>
                      <strong>{count}</strong>
                    </p>
                  )
                )}
              />
            </div>
            <div
              onClick={() => navigate("/manager/viewDoctor")}
              className="cursor-pointer"
            >
              <StatCard
                config={ICON_CONFIG.doctors}
                label="Total Doctors"
                value={state.totalDoctors}
              />
            </div>
            <StatCard
              config={ICON_CONFIG.topDoctors}
              label="Top Performing Doctors"
              value={state.topDoctors.total}
              details={state.topDoctors.details.map((item, i) => (
                <div
                  key={i}
                  className="my-1 flex justify-between"
                  style={{
                    color: ["red", "orange", "green", "purple", "blue"][i % 5],
                  }}
                >
                  <span>
                    {i + 1}. {item.fullName}
                  </span>
                  <strong>{item.bookings}</strong>
                </div>
              ))}
            />
          </div>
        </div> */}

        {/* <div className="my-2 border-t" style={{ borderColor: COLORS.border }} /> */}
        {/* 
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Booking Status Overview"
            config={ICON_CONFIG.bookings}
            key={`booking-status-${dates.start}-${dates.end}`}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bookingStatusData}>
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
                          style={{
                            background: COLORS.cardBg,
                            border: `1px solid ${COLORS.border}`,
                          }}
                        >
                          <p
                            className="text-sm font-medium"
                            style={{ color: COLORS.textPrimary }}
                          >
                            {`${label}: ${payload[0].value.toLocaleString()}`}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ color: COLORS.textPrimary }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} name="Bookings">
                  {bookingStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#barGradient-${index})`}
                    />
                  ))}
                </Bar>
                {bookingStatusData.map((entry, index) => (
                  <defs key={index}>
                    <linearGradient
                      id={`barGradient-${index}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={entry.fill} />
                      <stop offset="100%" stopColor={`${entry.fill}80`} />
                    </linearGradient>
                  </defs>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="User Distribution"
            config={ICON_CONFIG.userribution}
            key={`user-distribution-${dates.start}-${dates.end}`}
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userributionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={40}
                  dataKey="value"
                  animationDuration={1000}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={{ stroke: COLORS.textSecondary }}
                >
                  {userributionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#pieGradient-${index})`}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: COLORS.cardBg,
                    borderRadius: "8px",
                    border: `1px solid ${COLORS.border}`,
                    color: COLORS.textPrimary,
                  }}
                />
                <Legend wrapperStyle={{ color: COLORS.textPrimary }} />
                {userributionData.map((entry, index) => (
                  <defs key={index}>
                    <linearGradient
                      id={`pieGradient-${index}`}
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={entry.color} />
                      <stop offset="100%" stopColor={`${entry.color}80`} />
                    </linearGradient>
                  </defs>
                ))}
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Test Score Trends"
            config={ICON_CONFIG.testTrends}
            key={`test-trends-${dates.start}-${dates.end}`}
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={state.testTrends}>
                <XAxis
                  dataKey="name"
                  stroke={COLORS.textSecondary}
                  tick={{ fill: COLORS.textSecondary, fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).getDate()}
                />
                <YAxis
                  stroke={COLORS.textSecondary}
                  tick={{ fill: COLORS.textSecondary, fontSize: 12 }}
                  domain={[0, "auto"]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: COLORS.textPrimary }} />
                <Line
                  type="monotone"
                  dataKey="depression"
                  stroke={COLORS.primary}
                  name="Depression"
                  animationDuration={1000}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="anxiety"
                  stroke={COLORS.secondary}
                  name="Anxiety"
                  animationDuration={1000}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="stress"
                  stroke={COLORS.accent}
                  name="Stress"
                  animationDuration={1000}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div> */}
        <div>aa1</div>
        {error && (
          <p
            className="mt-6 text-center text-sm"
            style={{ color: COLORS.danger }}
          >
            Error: {error}
          </p>
        )}
      </div>
    </div>
  );
}