import { useEffect, useMemo, useRef, useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  TrendingUp,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
} from "lucide-react";

import { useTheme } from "../../context/ThemeContext";

// ----------------------------------
// Configuration
// ----------------------------------

const PERIOD_OPTIONS = [
  { label: "Last 7 Days", value: "7 Days" },
  { label: "Last 30 Days", value: "30 Days" },
  { label: "Last 90 Days", value: "90 Days" },
  { label: "Last 12 Months", value: "12 Months" },
];

const formatMoney = (value) =>
  `Rs. ${Number(value).toLocaleString("en-PK", {
    maximumFractionDigits: 2,
  })}`;

const formatAxis = (value) => {
  if (Math.abs(value) >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }

  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(0)}k`;
  }

  return value;
};

// ----------------------------------
// Pakistan Date Helpers
// ----------------------------------

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

  const get = (type) =>
    Number(
      parts.find((part) => part.type === type)?.value
    );

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
  };
}

function dateKey(year, month, day) {
  return `${year}-${String(month).padStart(2, "0")}-${String(
    day
  ).padStart(2, "0")}`;
}

function monthKey(year, month) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

// ----------------------------------
// Real Revenue Data
// ----------------------------------

function getChartData(orders, period) {
  const today = getPakistanDate(new Date().toISOString());

  if (!today) return [];

  const completedOrders = orders.filter(
    (order) =>
      String(order.status).toLowerCase() === "completed"
  );

  // Last 12 Months
  if (period === "12 Months") {
    const data = [];
    const lookup = new Map();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(
        Date.UTC(today.year, today.month - 1 - i, 1)
      );

      const year = date.getUTCFullYear();
      const month = date.getUTCMonth() + 1;

      const key = monthKey(year, month);

      const row = {
        key,
        name: date.toLocaleDateString("en-GB", {
          month: "short",
          year: "2-digit",
          timeZone: "UTC",
        }),
        revenue: 0,
      };

      data.push(row);
      lookup.set(key, row);
    }

    completedOrders.forEach((order) => {
      const date = getPakistanDate(order.created_at);

      if (!date) return;

      const row = lookup.get(
        monthKey(date.year, date.month)
      );

      if (row) {
        row.revenue += Number(order.amount) || 0;
      }
    });

    return data;
  }

  // Last 7 / 30 / 90 Days
  const days =
    period === "7 Days"
      ? 7
      : period === "30 Days"
        ? 30
        : 90;

  const data = [];
  const lookup = new Map();

  const todayUTC = Date.UTC(
    today.year,
    today.month - 1,
    today.day
  );

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(
      todayUTC - i * 86400000
    );

    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();

    const key = dateKey(year, month, day);

    const row = {
      key,
      name: date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      }),
      revenue: 0,
    };

    data.push(row);
    lookup.set(key, row);
  }

  completedOrders.forEach((order) => {
    const date = getPakistanDate(order.created_at);

    if (!date) return;

    const key = dateKey(
      date.year,
      date.month,
      date.day
    );

    const row = lookup.get(key);

    if (row) {
      row.revenue += Number(order.amount) || 0;
    }
  });

  return data;
}

// ----------------------------------
// Component
// ----------------------------------

export default function RevenueChart({
  orders = [],
  loading = false,
}) {
  const { theme } = useTheme();

  const [period, setPeriod] = useState("30 Days");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrollState, setScrollState] = useState({
    left: false,
    right: false,
  });

  const dropdownRef = useRef(null);
  const scrollRef = useRef(null);

  const isDark = theme === "dark";

  // ----------------------------------
  // Chart Data
  // ----------------------------------

  const data = useMemo(
    () => getChartData(orders, period),
    [orders, period]
  );

  const periodRevenue = useMemo(
    () =>
      data.reduce(
        (total, item) => total + item.revenue,
        0
      ),
    [data]
  );

  const hasRevenue = data.some(
    (item) => item.revenue > 0
  );

  const selectedOption = PERIOD_OPTIONS.find(
    (option) => option.value === period
  );

  // ----------------------------------
  // Chart Width
  // ----------------------------------

  const pointWidth =
    period === "12 Months" ? 115 : 75;

  const chartWidth = Math.max(
    700,
    data.length * pointWidth
  );

  // ----------------------------------
  // Scroll Controls
  // ----------------------------------

  const updateScrollState = () => {
    const container = scrollRef.current;

    if (!container) return;

    const maxScroll =
      container.scrollWidth - container.clientWidth;

    setScrollState({
      left: container.scrollLeft > 2,
      right: container.scrollLeft < maxScroll - 2,
    });
  };

  // Start at latest dates
  useEffect(() => {
    const container = scrollRef.current;

    if (!container) return;

    const frame = requestAnimationFrame(() => {
      container.scrollLeft =
        container.scrollWidth - container.clientWidth;

      updateScrollState();
    });

    return () => cancelAnimationFrame(frame);
  }, [period]);

  // Watch scroll and container resize
  useEffect(() => {
    const container = scrollRef.current;

    if (!container) return;

    updateScrollState();

    const observer = new ResizeObserver(updateScrollState);

    observer.observe(container);

    return () => observer.disconnect();
  }, [period]);

  const scrollChart = (direction) => {
    scrollRef.current?.scrollBy({
      left: direction * 400,
      behavior: "smooth",
    });
  };

  // ----------------------------------
  // Dropdown Controls
  // ----------------------------------

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    };

    document.addEventListener(
      "pointerdown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  const handlePeriodChange = (value) => {
    setPeriod(value);
    setDropdownOpen(false);
  };

  // ----------------------------------
  // Render
  // ----------------------------------

  return (
    <div className="min-w-0 max-w-full rounded-2xl border border-outline bg-surface p-3 shadow-sm sm:p-5 lg:p-7">
      {/* Header */}
      <div className="mb-5 flex min-w-0 flex-col gap-4 sm:mb-7 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-brand">
            <TrendingUp size={19} />

            <span className="text-xs font-bold uppercase tracking-widest">
              Business Performance
            </span>
          </div>

          <h3 className="text-xl font-extrabold text-primary-text sm:text-2xl">
            Revenue Overview
          </h3>

          <p className="mt-2 text-sm text-muted-text">
            Track your actual business revenue over time.
          </p>

          <p className="mt-4 wrap-break-word text-xl font-extrabold text-primary-text sm:text-2xl">
            {loading
              ? "Loading..."
              : formatMoney(periodRevenue)}
          </p>

          <p className="mt-1 text-xs text-muted-text">
            Total revenue during selected period
          </p>
        </div>

        {/* Custom Theme-Aware Dropdown */}
        <div
          ref={dropdownRef}
          className="relative z-20 w-full sm:w-auto"
        >
          <button
            type="button"
            onClick={() =>
              setDropdownOpen((prev) => !prev)
            }
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            className="flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-outline bg-background px-3 py-3 text-sm font-semibold text-primary-text transition hover:border-brand sm:min-w-[190px] sm:px-4"          >
            <CalendarDays
              size={18}
              className="text-muted-text"
            />

            <span className="flex-1 text-left">
              {selectedOption?.label}
            </span>

            <ChevronDown
              size={17}
              className={`transition-transform ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-outline shadow-xl"
              style={{
                backgroundColor: isDark
                  ? "#1C1C1C"
                  : "#FFFFFF",
                color: isDark
                  ? "#FFFFFF"
                  : "#181818",
              }}
            >
              {PERIOD_OPTIONS.map((option) => {
                const active =
                  period === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      handlePeriodChange(option.value)
                    }
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium transition"
                    style={{
                      backgroundColor: active
                        ? isDark
                          ? "#333333"
                          : "#F3F4F6"
                        : "transparent",
                      color: isDark
                        ? "#FFFFFF"
                        : "#181818",
                    }}
                    onMouseEnter={(event) => {
                      if (!active) {
                        event.currentTarget.style.backgroundColor =
                          isDark
                            ? "#292929"
                            : "#F9FAFB";
                      }
                    }}
                    onMouseLeave={(event) => {
                      if (!active) {
                        event.currentTarget.style.backgroundColor =
                          "transparent";
                      }
                    }}
                  >
                    <span>{option.label}</span>

                    {active && (
                      <Check
                        size={16}
                        className="text-brand"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Scroll Navigation */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-text">
          Scroll horizontally to explore previous dates
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollChart(-1)}
            disabled={!scrollState.left}
            aria-label="Scroll to previous dates"
            title="Previous Dates"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline bg-background text-primary-text transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            onClick={() => scrollChart(1)}
            disabled={!scrollState.right}
            aria-label="Scroll to latest dates"
            title="Latest Dates"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline bg-background text-primary-text transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Horizontally Scrollable Chart */}
      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        className="w-full min-w-0 max-w-full touch-pan-x overflow-x-auto overflow-y-hidden pb-4"
      >
        <div
          className="h-64 sm:h-80 lg:h-96"
          style={{
            width: `${chartWidth}px`,
          }}
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={data}
              margin={{
                top: 10,
                right: 25,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 5"
                vertical={false}
                stroke="#888888"
                strokeOpacity={0.15}
              />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                interval={0}
                tick={{
                  fill: "#888888",
                  fontSize: 11,
                }}
                dy={10}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#888888",
                  fontSize: 11,
                }}
                tickFormatter={formatAxis}
                width={55}
                domain={[0, "auto"]}
                allowDecimals={false}
              />

              <Tooltip
                formatter={(value) => [
                  formatMoney(value),
                  "Revenue",
                ]}
                contentStyle={{
                  backgroundColor: isDark
                    ? "#181818"
                    : "#FFFFFF",
                  color: isDark
                    ? "#FFFFFF"
                    : "#181818",
                  border: isDark
                    ? "1px solid #333333"
                    : "1px solid #E5E7EB",
                  borderRadius: "12px",
                  padding: "12px 16px",
                }}
                labelStyle={{
                  color: isDark
                    ? "#FFFFFF"
                    : "#181818",
                }}
                itemStyle={{
                  color: "#EAB308",
                }}
                cursor={{
                  stroke: "#888888",
                  strokeDasharray: "4 4",
                }}
              />

              <Line
                type="linear"
                dataKey="revenue"
                name="Revenue"
                stroke="#EAB308"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
                isAnimationActive={true}
                animationDuration={600}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center gap-3 border-t border-outline pt-5 text-xs text-muted-text">
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />

        <span>
          Completed Orders Revenue
        </span>
      </div>

      {!loading && !hasRevenue && (
        <p className="mt-3 text-sm text-muted-text">
          No completed order revenue found for this period.
        </p>
      )}

      <p className="mt-3 text-xs text-muted-text">
        Revenue is calculated from completed orders and
        grouped by order creation date in Pakistan time.
      </p>
    </div>
  );
}