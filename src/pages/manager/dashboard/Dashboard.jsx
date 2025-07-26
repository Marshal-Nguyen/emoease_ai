import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
} from "recharts";
import Loader from "../../../components/Web/Loader";
import * as XLSX from "xlsx";
import OverviewSection from "./StatCards/OverviewSection";
import ChartCard from "./ChartCard";
import ExportButton from "./ExportButton";
import { COLORS } from "./colors";
import { ICON_CONFIG } from "./iconConfig";

// Component chính của dashboard
export default function Dashboard() {
  const [state, setState] = useState({
    totalUsers: "N/A",
    users: { male: "N/A", female: "N/A", else: "N/A" },
    totalDoctors: "N/A",
    productsSold: { total: "N/A", details: [] },
    subscriptions: {
      total: "N/A",
      details: {
        AwaitPayment: "N/A",
        Active: "N/A",
        Expired: "N/A",
        Cancelled: "N/A",
      },
    },
    bookings: {
      total: "N/A",
      details: { Completed: "N/A", AwaitMeeting: "N/A", Cancelled: "N/A" },
    },
    topDoctors: { total: "N/A", details: [] },
    totalRevenue: "N/A",
    dailySales: [],
  });
  const navigate = useNavigate();

  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');
  const [loading, setLoading] = useState(true);
  const [dates, setDates] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    start: `${new Date().getFullYear()}-${String(
      new Date().getMonth() + 1
    ).padStart(2, "0")}-01`,
    end: `${new Date().getFullYear()}-${String(
      new Date().getMonth() + 1
    ).padStart(2, "0")}-${String(
      new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
    ).padStart(2, "0")}`,
  });
  const isMounted = useRef(false);
  const userName = localStorage.getItem("username");

  useEffect(() => {
    isMounted.current = true;
    const fetchData = async () => {
      try {
        setLoading(true);

        // Khởi tạo dữ liệu mặc định
        const defaultState = {
          totalUsers: "N/A",
          users: { male: "N/A", female: "N/A", else: "N/A" },
          totalDoctors: "N/A",
          productsSold: { total: "N/A", details: [] },
          subscriptions: {
            total: "N/A",
            details: {
              AwaitPayment: "N/A",
              Active: "N/A",
              Expired: "N/A",
              Cancelled: "N/A",
            },
          },
          bookings: {
            total: "N/A",
            details: {
              Completed: "N/A",
              AwaitMeeting: "N/A",
              Cancelled: "N/A",
            },
          },
          topDoctors: { total: "N/A", details: [] },
          totalRevenue: "N/A",
          dailySales: [],
          totalGenderUsers: "N/A",
        };

        let newState = { ...defaultState };

        // Fetch patient statistics
        try {
          const res = await fetch(
            `${import.meta.env.VITE_API}/patient-statistics`,
            {
              method: "GET", // Assuming GET since no method was specified; change if needed
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              }
            }
          );
          const data = await res.json();
          newState.totalUsers = data.registeredThisMonth.toLocaleString();
          newState.users = {
            male: data.genderStats.male.toLocaleString(),
            female: data.genderStats.female.toLocaleString(),
            else: data.genderStats.other.toLocaleString(),
          };
          newState.totalGenderUsers = data.totalCount.toLocaleString();
        } catch (err) {
          console.error("Error fetching patient stats:", err.message);
        }

        // Fetch doctors data
        try {
          const res = await fetch(
            `${import.meta.env.VITE_API}/doctor-profiles`
          );
          const data = await res.json();
          newState.totalDoctors = data.totalCount.toLocaleString();
        } catch (err) {
          console.error("Error fetching doctors data:", err.message);
        }

        // Fetch products data
        try {
          const res = await fetch(
            `https://anhtn.id.vn/subscription-service/service-packages/total?startDate=${dates.start}&endDate=${dates.end}`
          );
          const data = await res.json();
          newState.productsSold = {
            total: data
              .reduce((sum, item) => sum + item.totalSubscriptions, 0)
              .toLocaleString(),
            details: data.map((item) => ({
              name: item.name,
              totalSubscriptions: item.totalSubscriptions.toLocaleString(),
            })),
          };
        } catch (err) {
          console.error("Error fetching products data:", err.message);
        }

        // Fetch subscriptions data
        try {
          const statuses = ["AwaitPayment", "Active", "Expired", "Cancelled"];
          const subscriptionsData = await Promise.all(
            statuses.map(async (status) => {
              try {
                const res = await fetch(
                  `https://anhtn.id.vn/subscription-service/user-subscriptions/total?startDate=${dates.start}&endDate=${dates.end}&status=${status}`
                );
                const data = await res.json();
                return [status, data.totalCount.toLocaleString()];
              } catch (err) {
                console.error(
                  `Error fetching ${status} subscriptions:`,
                  err.message
                );
                return [status, "N/A"];
              }
            })
          );
          newState.subscriptions = {
            total: Object.values(Object.fromEntries(subscriptionsData))
              .reduce(
                (sum, val) => sum + parseInt(val.replace(/,/g, "") || 0),
                0
              )
              .toLocaleString(),
            details: Object.fromEntries(subscriptionsData),
          };
        } catch (err) {
          console.error("Error fetching subscriptions:", err.message);
        }

        // Fetch bookings data
        try {
          const statuses = [
            "Booking Success",
            "CheckIn",
            "CheckOut",
            "Cancelled",
          ];
          const bookingsData = await Promise.all(
            statuses.map(async (status) => {
              try {
                const res = await fetch(
                  `${import.meta.env.VITE_API}/bookings?StartDate=${dates.start}&EndDate=${dates.end}&Status=${status}`,
                  {
                    method: "GET", // Assuming GET since no method was specified; change if needed
                    headers: {
                      "Content-Type": "application/json",
                      "Authorization": `Bearer ${token}`
                    }
                  }
                );
                const data = await res.json();
                return [status, data.totalCount.toLocaleString()];
              } catch (err) {
                console.error(
                  `Error fetching ${status} bookings:`,
                  err.message
                );
                return [status, "N/A"];
              }
            })
          );
          newState.bookings = {
            total: Object.values(Object.fromEntries(bookingsData))
              .reduce(
                (sum, val) => sum + parseInt(val.replace(/,/g, "") || 0),
                0
              )
              .toLocaleString(),
            details: Object.fromEntries(bookingsData),
          };
        } catch (err) {
          console.error("Error fetching bookings:", err.message);
        }

        // Fetch top doctors data
        try {
          const res = await fetch(
            `https://anhtn.id.vn/scheduling-service/bookings/top-doctors?StartDate=${dates.start}&EndDate=${dates.end}`,
            {
              method: "GET", // Assuming GET since no method was specified; change if needed
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              }
            }
          );
          const data = await res.json();
          newState.topDoctors = {
            total: data.topDoctors
              .reduce((sum, doctor) => sum + doctor.totalBookings, 0)
              .toLocaleString(),
            details: data.topDoctors.map((doctor) => ({
              fullName: doctor.fullName,
              bookings: doctor.totalBookings.toLocaleString(),
            })),
          };
        } catch (err) {
          console.error("Error fetching top doctors:", err.message);
        }

        // Fetch daily revenue data
        try {
          const res = await fetch(
            `${import.meta.env.VITE_API}/payment-zalo/daily-total?StartDate=${dates.start}&EndDate=${dates.end}`,
            {
              method: "GET", // Assuming GET since no method was specified; change if needed
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              }
            }
          );
          const dailyRevenueData = await res.json();
          const dailyRevenueMap = new Map(
            dailyRevenueData.data.map((item) => [
              item.date,
              {
                totalRevenue: item.totalAmount,
                totalPayment: item.paymentCount,
              },
            ])
          );
          console.log("Daily Revenue Data:", dailyRevenueMap);
          const startDate = new Date(dates.start);
          const endDate = new Date(dates.end);
          const currentDate = new Date();
          const dailySalesData = [];
          for (
            let d = new Date(startDate);
            d <= endDate;
            d.setDate(d.getDate() + 1)
          ) {
            d.setHours(0, 0, 0, 0);
            const dateStr = `${d.getFullYear()}-${String(
              d.getMonth() + 1
            ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            const data =
              d <= currentDate
                ? dailyRevenueMap.get(dateStr) || {
                  totalRevenue: 0,
                  totalPayment: 0,
                }
                : { totalRevenue: null, totalPayment: null };
            dailySalesData.push({
              name: dateStr,
              revenue: data.totalRevenue,
              payment: data.totalPayment,
            });
          }
          newState.dailySales = dailySalesData;
          newState.totalRevenue = `${dailySalesData
            .reduce((sum, item) => sum + (item.revenue || 0), 0)
            .toLocaleString("vi-VN")} ₫`;
        } catch (err) {
          console.error("Error fetching daily revenue:", err.message);
        }

        if (isMounted.current) {
          setState(newState);
        }
      } catch (err) {
        if (isMounted.current) setError(err.message);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted.current = false;
    };
  }, [dates.start, dates.end]);

  const handleDateChange = (type) => (e) => {
    const value = parseInt(e.target.value);
    if (type === "month") {
      setDates((prev) => {
        const newMonth = value;
        const start = `${prev.year}-${String(newMonth).padStart(2, "0")}-01`;
        const lastDay = new Date(prev.year, newMonth, 0).getDate();
        const end = `${prev.year}-${String(newMonth).padStart(2, "0")}-${String(
          lastDay
        ).padStart(2, "0")}`;
        return { ...prev, month: newMonth, start, end };
      });
    } else if (type === "year") {
      setDates((prev) => {
        const newYear = value;
        const start = `${newYear}-${String(prev.month).padStart(2, "0")}-01`;
        const lastDay = new Date(newYear, prev.month, 0).getDate();
        const end = `${newYear}-${String(prev.month).padStart(2, "0")}-${String(
          lastDay
        ).padStart(2, "0")}`;
        return { ...prev, year: newYear, start, end };
      });
    }
  };

  const getGenderTotalUsers = () => {
    return state.totalGenderUsers || "N/A";
  };

  const exportToExcel = () => {
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
        `Gender Breakdown - Male: ${state.users.male}, Female: ${state.users.female
        }, Other: ${state.users.else} (Total: ${getGenderTotalUsers()})`,
      ],
      ["Total Doctors", state.totalDoctors, ""],
      [
        "Service Packages Sold",
        state.productsSold.total,
        state.productsSold.details
          .map((item) => `${item.name}: ${item.totalSubscriptions}`)
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

    const packagesData = [
      ["Service Packages Sold"],
      ["Name", "Total Subscriptions"],
      ...state.productsSold.details.map((item) => [
        item.name,
        item.totalSubscriptions,
      ]),
    ];
    const ws3 = XLSX.utils.aoa_to_sheet(packagesData);
    XLSX.utils.book_append_sheet(wb, ws3, "Service Packages");

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

    XLSX.writeFile(wb, `monthly_statistics_${monthName}_${dates.year}.xlsx`);
  };

  const userDistributionData = [
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

  const revenueGrowthData = Object.entries(state.subscriptions.details).map(
    ([status, count]) => ({
      name: status,
      value: parseInt(count.replace(/,/g, "") || 0),
      fill:
        status === "Active"
          ? COLORS.success
          : status === "AwaitPayment"
            ? COLORS.warning
            : status === "Expired"
              ? COLORS.danger
              : COLORS.secondary,
    })
  );

  const servicePackagesData = state.productsSold.details.map((item) => ({
    name: item.name,
    total: parseInt(item.totalSubscriptions.replace(/,/g, "") || 0),
  }));

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen py-6 px-4 bg-gradient-to-br from-indigo-100 to-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="sticky top-0 z-10 bg-white/80 backdrop-blur-md p-4 rounded-b-xl shadow-md flex justify-between items-center mb-2"
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold tracking-tight text-indigo-500">
            Hi {userName}, Welcome back 👋
          </h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-800">
                Month:
              </label>
              <select
                value={dates.month}
                onChange={handleDateChange("month")}
                className="p-2 text-sm rounded-lg shadow-sm transition-all duration-300 hover:shadow-md focus:ring-2 focus:ring-indigo-500 bg-gradient-to-br from-white to-gray-100 border-gray-200 text-gray-800"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1} className="text-gray-800">
                    {new Date(0, i).toLocaleString("en-US", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-800">Year:</label>
              <select
                value={dates.year}
                onChange={handleDateChange("year")}
                className="p-2 text-sm rounded-lg shadow-sm transition-all duration-300 hover:shadow-md focus:ring-2 focus:ring-indigo-500 bg-gradient-to-br from-white to-gray-100 border-gray-200 text-gray-800"
              >
                {Array.from({ length: 10 }, (_, i) => {
                  const year = new Date().getFullYear() - 5 + i;
                  return (
                    <option key={year} value={year} className="text-gray-800">
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
            <ExportButton onClick={exportToExcel} />
          </div>
        </motion.div>

        <OverviewSection
          state={state}
          getGenderTotalUsers={getGenderTotalUsers}
        />

        <div className="my-2 border-t border-gray-200" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Subscription Status Overview"
            config={ICON_CONFIG.revenueGrowth}
          >
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
                        <div className="p-3 rounded-lg shadow-md bg-gradient-to-br from-white to-gray-100 border border-gray-200">
                          <p className="text-sm font-medium text-gray-800">
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
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#barGradient-${index})`}
                    />
                  ))}
                </Bar>
                {revenueGrowthData.map((entry, index) => (
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
            config={ICON_CONFIG.userDistribution}
          >
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
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={{ stroke: COLORS.textSecondary }}
                >
                  {userDistributionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#pieGradient-${index})`}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "linear-gradient(145deg, #FFFFFF, #F3F4F6)",
                    borderRadius: "8px",
                    border: `1px solid ${COLORS.border}`,
                    color: COLORS.textPrimary,
                  }}
                />
                <Legend wrapperStyle={{ color: COLORS.textPrimary }} />
                {userDistributionData.map((entry, index) => (
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
            title="Top Doctors Performance"
            config={ICON_CONFIG.performance}
          >
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart
                data={state.topDoctors.details.map((item) => ({
                  subject:
                    item.fullName && typeof item.fullName === "string"
                      ? item.fullName.split(" ").slice(-1)[0]
                      : "Unknown",
                  bookings: parseInt(item.bookings.replace(/,/g, "") || 0),
                  fullName: item.fullName,
                }))}
              >
                <PolarGrid stroke={COLORS.textSecondary} />
                <PolarAngleAxis
                  dataKey="subject"
                  stroke={COLORS.textPrimary}
                  tick={{ fill: COLORS.textPrimary, fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, "dataMax"]}
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
                      <div className="p-3 rounded-lg shadow-md bg-gradient-to-br from-white to-gray-100 border border-gray-200">
                        <p className="text-gray-800">
                          {`${payload[0].payload.fullName}: ${payload[0].value} bookings`}
                        </p>
                      </div>
                    ) : null
                  }
                />
                <Legend wrapperStyle={{ color: COLORS.textPrimary }} />
                <defs>
                  <linearGradient
                    id="radarGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={COLORS.warning} />
                    <stop offset="100%" stopColor={`${COLORS.warning}80`} />
                  </linearGradient>
                </defs>
              </RadarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Service Packages Breakdown"
            config={ICON_CONFIG.sales}
          >
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
                      <div className="p-3 rounded-lg shadow-md bg-gradient-to-br from-white to-gray-100 border border-gray-200">
                        <p className="text-gray-800">{label}</p>
                        <p className="text-blue-400">
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
          <p className="mt-6 text-center text-sm text-red-500">
            Error: ${error}
          </p>
        )}
      </div>
    </div>
  );
}
