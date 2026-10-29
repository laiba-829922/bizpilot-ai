import { useCallback, useEffect, useState } from "react";

import { useTheme } from "../context/ThemeContext";

import {
  Moon,
  Sun,
  Wallet,
  CreditCard,
  TrendingUp,
  ShoppingBag,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import StatCard from "../components/dashboard/StatCard";
import RecentOrders from "../components/dashboard/RecentOrders";
import RevenueChart from "../components/dashboard/RevenueChart";

const API_URL = "https://bizpilot-api.vercel.app/api/orders/";

const formatMoney = (value) =>
  `Rs. ${Number(value).toLocaleString("en-PK", {
    maximumFractionDigits: 2,
  })}`;

export default function Dashboard() {
  const { theme, toggleTheme } = useTheme();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  // ----------------------------------
  // Fetch Orders
  // ----------------------------------

  const fetchDashboardData = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

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
        if (response.status === 401) {
          throw new Error(
            "Your session has expired. Please log in again."
          );
        }

        throw new Error(
          `Unable to load dashboard data (${response.status})`
        );
      }

      const result = await response.json();

      const orderList = Array.isArray(result)
        ? result
        : Array.isArray(result.results)
          ? result.results
          : null;

      if (!orderList) {
        throw new Error("Unexpected orders API response.");
      }

      setOrders(orderList);
      setError("");
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err.message || "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ----------------------------------
  // Auto Refresh
  // ----------------------------------

  useEffect(() => {
    fetchDashboardData(true);

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchDashboardData();
      }
    }, 30000);

    const handleFocus = () => {
      fetchDashboardData();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchDashboardData]);

  // ----------------------------------
  // Real KPI Calculations
  // ----------------------------------

  const completedOrders = orders.filter(
    (order) => order.status === "completed"
  );

  const totalRevenue = completedOrders.reduce(
    (total, order) =>
      total + (Number(order.amount) || 0),
    0
  );

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => order.status === "pending"
  ).length;

  const completedOrdersCount = completedOrders.length;

  // ----------------------------------
  // Render
  // ----------------------------------

  return (
    <div className="flex min-h-screen min-w-0 bg-background text-primary-text">

      {/* Responsive Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="min-w-0 flex-1">

        {/* ----------------------------------
            Responsive Header
        ---------------------------------- */}

        <header
  className="
    sticky top-0 z-30
    flex h-20 w-full
    items-center justify-between
    gap-2
    border-b border-outline
    bg-surface
    px-4 pr-16
    sm:gap-4 sm:px-6 sm:pr-20
    lg:px-10
  "
>
          {/* Header Title */}
          <div className="min-w-0 flex-1">
            <p className="hidden text-xs text-muted-text sm:block sm:text-sm">
              Welcome back
            </p>

            <h2
              className="
                truncate
                text-sm font-bold
                text-primary-text
                min-[375px]:text-base
                sm:text-xl
              "
            >
              Business Dashboard
            </h2>
          </div>

          {/* Header Actions */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3 lg:gap-3">

            {/* Refresh */}
            <button
              type="button"
              onClick={() => fetchDashboardData(true)}
              aria-label="Refresh dashboard"
              title="Refresh dashboard"
              disabled={loading}
              className="
                flex h-9 w-9
                shrink-0 items-center justify-center
                rounded-xl
                border border-outline
                bg-background
                text-primary-text
                transition-colors
                hover:border-brand hover:text-brand
                disabled:cursor-not-allowed
                disabled:opacity-50
                sm:h-10 sm:w-10
              "
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title="Toggle theme"
              className="
                flex h-9 w-9
                shrink-0 items-center justify-center
                rounded-xl
                border border-outline
                bg-background
                text-primary-text
                transition-colors
                hover:border-brand hover:text-brand
                sm:h-10 sm:w-10
              "
            >
              {theme === "dark" ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>
          </div>
        </header>

        {/* ----------------------------------
            Dashboard Main Content
        ---------------------------------- */}

        <main
          className="
            mx-auto
            w-full min-w-0
            max-w-7xl
            px-4 py-6
            sm:px-6 sm:py-8
            lg:px-10 lg:py-10
          "
        >
          {/* Page Introduction */}
          <section className="min-w-0">
            <p className="text-xs font-semibold tracking-wide text-brand sm:text-sm">
              BUSINESS WORKSPACE
            </p>

            <h1
              className="
                mt-3
                font-display
                text-2xl font-extrabold
                leading-tight
                text-primary-text
                sm:text-3xl
                lg:text-4xl
              "
            >
              Dashboard Overview
            </h1>

            <p
              className="
                mt-3
                max-w-2xl
                text-sm leading-6
                text-muted-text
                sm:text-base
              "
            >
              Your business performance, insights and
              opportunities in one place.
            </p>
          </section>

          {/* ----------------------------------
              Error Message
          ---------------------------------- */}

          {error && (
            <div
              role="alert"
              className="
                mt-6
                flex items-start gap-3
                rounded-xl
                border border-red-500/30
                bg-red-500/10
                p-3 text-sm
                text-red-400
                sm:p-4
              "
            >
              <AlertCircle
                size={19}
                className="mt-0.5 shrink-0"
              />

              <span className="min-w-0 wrap-break-words">
                {error}
              </span>
            </div>
          )}

          {/* ----------------------------------
              Last Updated
          ---------------------------------- */}

          {lastUpdated && (
            <p className="mt-4 text-xs text-muted-text">
              Last updated:{" "}
              {lastUpdated.toLocaleTimeString("en-PK", {
                timeZone: "Asia/Karachi",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}{" "}
              PKT
            </p>
          )}

          {/* ----------------------------------
              Responsive KPI Cards
          ---------------------------------- */}

          <section
            className="
              mt-7
              grid min-w-0
              grid-cols-1
              gap-4
              sm:mt-10
              sm:grid-cols-2
              sm:gap-5
              xl:grid-cols-4
            "
          >
            {/* Revenue */}
            <div className="min-w-0">
              <StatCard
                title="Total Revenue"
                value={
                  loading && !lastUpdated
                    ? "Loading..."
                    : formatMoney(totalRevenue)
                }
                change="Completed orders"
                icon={Wallet}
                positive={true}
              />
            </div>

            {/* Total Orders */}
            <div className="min-w-0">
              <StatCard
                title="Total Orders"
                value={
                  loading && !lastUpdated
                    ? "Loading..."
                    : totalOrders.toLocaleString("en-PK")
                }
                change="All order statuses"
                icon={ShoppingBag}
                positive={true}
              />
            </div>

            {/* Pending Orders */}
            <div className="min-w-0">
              <StatCard
                title="Pending Orders"
                value={
                  loading && !lastUpdated
                    ? "Loading..."
                    : pendingOrders.toLocaleString("en-PK")
                }
                change="Awaiting processing"
                icon={CreditCard}
                positive={false}
              />
            </div>

            {/* Completed Orders */}
            <div className="min-w-0">
              <StatCard
                title="Completed Orders"
                value={
                  loading && !lastUpdated
                    ? "Loading..."
                    : completedOrdersCount.toLocaleString("en-PK")
                }
                change="Successful orders"
                icon={TrendingUp}
                positive={true}
              />
            </div>
          </section>

          {/* ----------------------------------
              Revenue Chart
          ---------------------------------- */}

          <section className="mt-6 min-w-0 sm:mt-8">
            <RevenueChart
              orders={orders}
              loading={loading && !lastUpdated}
            />
          </section>

          {/* ----------------------------------
              Recent Orders
          ---------------------------------- */}

          <section className="mt-6 min-w-0 sm:mt-8">
            <RecentOrders />
          </section>

        </main>
      </div>
    </div>
  );
}