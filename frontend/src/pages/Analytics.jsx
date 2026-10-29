import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clock3,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  XCircle,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import Sidebar from "../components/Sidebar";
import { useTheme } from "../context/ThemeContext";

const API_URL = "http://https://bizpilot-api.vercel.app/api/orders/";

const STATUS_COLORS = {
  pending: "#EAB308",
  processing: "#3B82F6",
  completed: "#10B981",
  cancelled: "#EF4444",
};

const formatMoney = (value) =>
  `Rs. ${Number(value || 0).toLocaleString("en-PK", {
    maximumFractionDigits: 2,
  })}`;

function getPakistanDate(value) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const getPart = (type) =>
    Number(parts.find((part) => part.type === type)?.value);

  return {
    year: getPart("year"),
    month: getPart("month"),
    day: getPart("day"),
  };
}

function getDateKey(value) {
  const date = getPakistanDate(value);
  if (!date) return null;

  return `${date.year}-${String(date.month).padStart(2, "0")}-${String(
    date.day
  ).padStart(2, "0")}`;
}

function getLastSevenDaysData(orders) {
  const today = getPakistanDate(new Date().toISOString());
  if (!today) return [];

  const todayUTC = Date.UTC(
    today.year,
    today.month - 1,
    today.day
  );

  const rows = [];
  const lookup = new Map();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(todayUTC - i * 86400000);

    const key = date.toISOString().slice(0, 10);

    const row = {
      key,
      name: date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      }),
      revenue: 0,
    };

    rows.push(row);
    lookup.set(key, row);
  }

  orders.forEach((order) => {
    if (String(order.status).toLowerCase() !== "completed") {
      return;
    }

    const row = lookup.get(getDateKey(order.created_at));

    if (row) {
      row.revenue += Number(order.amount) || 0;
    }
  });

  return rows;
}

function AnalyticsCard({ title, value, icon: Icon, description }) {
  return (
    <div className="min-w-0 rounded-2xl border border-outline bg-surface p-4 sm:p-5 lg:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-text">
            {title}
          </p>

          <h3 className="mt-3 wrap-break-word text-xl font-extrabold text-primary-text sm:text-2xl">
            {value}
          </h3>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <Icon size={21} />
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-text">
        {description}
      </p>
    </div>
  );
}

export default function Analytics() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [isPaginated, setIsPaginated] = useState(false);

  const fetchOrders = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = sessionStorage.getItem("access_token");

      if (!token) {
        throw new Error("Session expired. Please log in again.");
      }

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to load analytics data.");
      }

      const data = await response.json();

      const orderList = Array.isArray(data)
        ? data
        : Array.isArray(data.results)
          ? data.results
          : [];

      setOrders(orderList);
      setIsPaginated(
        !Array.isArray(data) &&
          (Boolean(data.next) ||
            Number(data.count || 0) > orderList.length)
      );
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const analytics = useMemo(() => {
    const counts = {
      pending: 0,
      processing: 0,
      completed: 0,
      cancelled: 0,
    };

    let totalRevenue = 0;

    orders.forEach((order) => {
      const status = String(order.status).toLowerCase();

      if (Object.prototype.hasOwnProperty.call(counts, status)) {
        counts[status] += 1;
      }

      if (status === "completed") {
        totalRevenue += Number(order.amount) || 0;
      }
    });

    const completionRate = orders.length
      ? (counts.completed / orders.length) * 100
      : 0;

    return {
      counts,
      totalRevenue,
      totalOrders: orders.length,
      completionRate,
    };
  }, [orders]);

  const statusData = useMemo(
    () =>
      Object.entries(analytics.counts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color: STATUS_COLORS[name],
      })),
    [analytics.counts]
  );

  const revenueData = useMemo(
    () => getLastSevenDaysData(orders),
    [orders]
  );

  const tooltipStyle = {
    backgroundColor: isDark ? "#1C1C1C" : "#FFFFFF",
    border: isDark
      ? "1px solid #333333"
      : "1px solid #E5E7EB",
    borderRadius: "12px",
    color: isDark ? "#FFFFFF" : "#181818",
  };

  return (
    <div className="flex min-h-screen min-w-0 bg-background text-primary-text">
      <Sidebar />

      <main className="min-w-0 flex-1 px-4 pb-10 pt-20 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto w-full max-w-7xl">

          {/* Page Header */}
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2 text-brand">
                <Activity size={18} />

                <span className="text-xs font-bold uppercase tracking-widest">
                  Business Insights
                </span>
              </div>

              <h1 className="text-2xl font-extrabold sm:text-3xl">
                Analytics
              </h1>

              <p className="mt-2 text-sm text-muted-text sm:text-base">
                Monitor your business performance and order activity.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchOrders(true)}
              disabled={loading || refreshing}
              className="flex items-center gap-2 rounded-xl border border-outline bg-surface px-4 py-3 text-sm font-semibold transition hover:border-brand disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={refreshing ? "animate-spin" : ""}
              />

              Refresh
            </button>
          </header>

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500"
            >
              {error}
            </div>
          )}

          {isPaginated && (
            <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-500">
              Your API is paginated. These analytics currently
              represent only the loaded orders.
            </div>
          )}

          {/* Summary Cards */}
          <section className="mt-7 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AnalyticsCard
              title="Total Revenue"
              value={loading ? "Loading..." : formatMoney(analytics.totalRevenue)}
              icon={TrendingUp}
              description="Revenue from completed orders"
            />

            <AnalyticsCard
              title="Total Orders"
              value={loading ? "Loading..." : analytics.totalOrders}
              icon={ShoppingCart}
              description="All loaded orders"
            />

            <AnalyticsCard
              title="Completed Orders"
              value={loading ? "Loading..." : analytics.counts.completed}
              icon={CheckCircle2}
              description="Successfully completed orders"
            />

            <AnalyticsCard
              title="Completion Rate"
              value={
                loading
                  ? "Loading..."
                  : `${analytics.completionRate.toFixed(1)}%`
              }
              icon={Activity}
              description="Completed orders as a share of all orders"
            />
          </section>

          {/* Charts */}
          <section className="mt-6 grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-2">

            {/* Revenue Chart */}
            <div className="min-w-0 rounded-2xl border border-outline bg-surface p-4 sm:p-6">
              <h2 className="text-lg font-bold sm:text-xl">
                Revenue Performance
              </h2>

              <p className="mt-2 text-sm text-muted-text">
                Completed order revenue over the last 7 days
              </p>

              <div className="mt-6 h-72 min-w-0 sm:h-80">
                {loading ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-text">
                    Loading chart...
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={revenueData}
                      margin={{
                        top: 10,
                        right: 5,
                        left: -15,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid
                        stroke="#888888"
                        strokeOpacity={0.15}
                        strokeDasharray="3 5"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#888888", fontSize: 11 }}
                      />

                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#888888", fontSize: 11 }}
                        width={60}
                      />

                      <Tooltip
                        formatter={(value) => [
                          formatMoney(value),
                          "Revenue",
                        ]}
                        contentStyle={tooltipStyle}
                        labelStyle={{
                          color: isDark ? "#FFFFFF" : "#181818",
                        }}
                      />

                      <Bar
                        dataKey="revenue"
                        fill="#EAB308"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={42}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Order Status Chart */}
            <div className="min-w-0 rounded-2xl border border-outline bg-surface p-4 sm:p-6">
              <h2 className="text-lg font-bold sm:text-xl">
                Order Status Distribution
              </h2>

              <p className="mt-2 text-sm text-muted-text">
                Breakdown of orders by current status
              </p>

              <div className="mt-6 h-72 min-w-0 sm:h-80">
                {loading ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-text">
                    Loading chart...
                  </div>
                ) : analytics.totalOrders === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-text">
                    No orders available.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData.filter((item) => item.value > 0)}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius="45%"
                        outerRadius="72%"
                        paddingAngle={3}
                      >
                        {statusData
                          .filter((item) => item.value > 0)
                          .map((item) => (
                            <Cell
                              key={item.name}
                              fill={item.color}
                            />
                          ))}
                      </Pie>

                      <Tooltip
                        contentStyle={tooltipStyle}
                        labelStyle={{
                          color: isDark ? "#FFFFFF" : "#181818",
                        }}
                        itemStyle={{
                          color: isDark ? "#FFFFFF" : "#181818",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {statusData.map((item) => (
                  <div
                    key={item.name}
                    className="flex min-w-0 items-center gap-2"
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />

                    <span className="truncate text-xs text-muted-text">
                      {item.name}: {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Order Performance */}
          <section className="mt-6 rounded-2xl border border-outline bg-surface p-4 sm:p-6">
            <h2 className="text-lg font-bold sm:text-xl">
              Order Performance Summary
            </h2>

            <p className="mt-2 text-sm text-muted-text">
              Current status of your business orders
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: "Pending",
                  value: analytics.counts.pending,
                  icon: Clock3,
                  color: "text-yellow-500",
                },
                {
                  label: "Processing",
                  value: analytics.counts.processing,
                  icon: RefreshCw,
                  color: "text-blue-500",
                },
                {
                  label: "Completed",
                  value: analytics.counts.completed,
                  icon: CheckCircle2,
                  color: "text-green-500",
                },
                {
                  label: "Cancelled",
                  value: analytics.counts.cancelled,
                  icon: XCircle,
                  color: "text-red-500",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl border border-outline bg-background p-4"
                  >
                    <div>
                      <p className="text-sm text-muted-text">
                        {item.label}
                      </p>

                      <p className="mt-2 text-2xl font-extrabold">
                        {loading ? "..." : item.value}
                      </p>
                    </div>

                    <Icon size={22} className={item.color} />
                  </div>
                );
              })}
            </div>
          </section>

          <p className="mt-5 text-xs text-muted-text">
            Revenue is calculated from completed orders and grouped
            by order creation date in Pakistan time.
          </p>
        </div>
      </main>
    </div>
  );
}