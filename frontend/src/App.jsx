
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BrainCircuit,
  Check,
  ChevronRight,
  CirclePlay,
  Menu,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useTheme } from "./context/ThemeContext";
import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import { Link } from "react-router-dom";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import { Navigate } from "react-router-dom";
import Analytics from "./pages/Analytics";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Expenses from "./pages/Expenses";
import AICopilot from "./pages/AICopilot";
const stats = [
  { label: "Total Revenue", value: "$48,290", change: "+18.6%" },
  { label: "Total Orders", value: "1,284", change: "+12.4%" },
  { label: "Active Customers", value: "3,642", change: "+8.2%" },
];

function DashboardPreview() {
  return (
    <div className="dashboard-float relative w-full max-w-142.5">
      {/* Floating Insight */}
      <div className="float-delayed absolute -right-2 -top-9 z-20 hidden rounded-2xl border border-outline bg-surface p-3 shadow-2xl sm:flex sm:items-center sm:gap-3 lg:-right-6">
        <div className="rounded-xl bg-brand-soft p-2.5 text-brand">
          <TrendingUp size={19} />
        </div>
        <div>
          <p className="text-xs font-bold text-primary-text">
            Revenue is growing
          </p>
          <p className="text-[11px] text-muted-text">
            +18.6% this month
          </p>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="overflow-hidden rounded-3x1 border border-outline bg-surface shadow-[0_35px_100px_rgba(0,0,0,0.22)]">
        <div className="flex items-center justify-between border-b border-outline px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-brand-foreground">
              <Zap size={15} fill="currentColor" />
            </div>
            <span className="font-display text-sm font-extrabold">
              BizPilot <span className="text-brand">AI</span>
            </span>
          </div>

          <span className="rounded-lg bg-elevated px-3 py-1.5 text-[10px] font-semibold text-muted-text">
            Dashboard Preview
          </span>
        </div>

        <div className="p-4 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-text">
                Welcome back
              </p>
              <h3 className="mt-1 font-display text-lg font-extrabold">
                Business Overview
              </h3>
            </div>
            <div className="rounded-lg border border-outline px-3 py-2 text-[10px] text-muted-text">
              Last 30 days
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-outline bg-background p-3"
              >
                <p className="text-[9px] text-muted-text sm:text-[11px]">
                  {stat.label}
                </p>
                <p className="mt-2 font-display text-sm font-extrabold sm:text-xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-[10px] font-bold text-brand">
                  ↗ {stat.change}
                </p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="mt-4 rounded-xl border border-outline bg-background p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold">
                  Revenue Analytics
                </p>
                <p className="mt-1 text-[10px] text-muted-text">
                  Performance over time
                </p>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-brand">
                <TrendingUp size={12} />
                +18.6%
              </span>
            </div>

            <div className="mt-5">
              <svg
                viewBox="0 0 460 145"
                className="h-auto w-full overflow-visible"
                role="img"
                aria-label="Illustrative revenue growth chart"
              >
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FACC15" stopOpacity=".26" />
                    <stop offset="100%" stopColor="#FACC15" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {[25, 65, 105, 140].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={y}
                    x2="460"
                    y2={y}
                    stroke="currentColor"
                    strokeOpacity=".08"
                    strokeDasharray="4 5"
                  />
                ))}

                <path
                  d="M0 118 C35 115 40 85 75 92 S120 112 155 76 S215 100 250 58 S305 72 335 42 S400 55 460 12 L460 145 L0 145 Z"
                  fill="url(#revenueFill)"
                />

                <path
                  className="chart-draw"
                  d="M0 118 C35 115 40 85 75 92 S120 112 155 76 S215 100 250 58 S305 72 335 42 S400 55 460 12"
                  fill="none"
                  stroke="#FACC15"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                <circle cx="460" cy="12" r="5" fill="#FACC15" />
              </svg>
            </div>

            <div className="mt-2 flex justify-between text-[9px] text-muted-text">
              <span>Week 1</span>
              <span>Week 2</span>
              <span>Week 3</span>
              <span>Week 4</span>
            </div>
          </div>

          {/* AI Insight */}
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-brand/20 bg-brand-soft p-4">
            <div className="rounded-lg bg-brand p-2 text-brand-foreground">
              <Sparkles size={16} />
            </div>
            <div>
              <p className="text-xs font-bold">
                AI Business Insight
              </p>
              <p className="mt-1 text-[11px] leading-5 text-muted-text">
                Your revenue is trending upward. Explore
                opportunities to maintain growth.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Floating Card */}
      <div className="float-delayed absolute -bottom-7 -left-3 hidden items-center gap-3 rounded-2xl border border-outline bg-surface px-4 py-3 shadow-2xl sm:flex lg:-left-9">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <Check size={19} />
        </div>
        <div>
          <p className="text-xs font-bold">Smart insights</p>
          <p className="text-[10px] text-muted-text">
            Powered by AI
          </p>
        </div>
      </div>
    </div>
  );
}

function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  const elements = document.querySelectorAll(".scroll-reveal");

  elements.forEach((element) => observer.observe(element));

  return () => observer.disconnect();
}, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background pt-20.5 text-primary-text">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="hero-glow absolute -right-48 top-24 h-162.5 w-162.5 rounded-full bg-brand/10 blur-[150px]" />
        <div className="absolute -left-60 top-125 h-112.5 w-112.5 rounded-full bg-brand/5 blur-[150px]" />
        <div
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-outline/60 bg-background/95 backdrop-blur-md">
        <nav className="mx-auto flex h-20.5 max-w-345 items-center justify-between gap-4 px-5 lg:px-12">
          <a href="#" className="flex shrink-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-brand text-brand-foreground shadow-lg shadow-brand/10">
              <Zap size={23} fill="currentColor" />
            </div>
            <span className="font-display text-xl font-extrabold tracking-tighter">
              BizPilot<span className="text-brand"> AI</span>
            </span>
          </a>

          <div className="hidden items-center gap-9 text-sm font-semibold text-muted-text md:flex">
            <a href="#features" className="hover:text-brand">
              Features
            </a>
            <a href="#preview" className="hover:text-brand">
              Platform
            </a>
            <a href="#about" className="hover:text-brand">
              Why BizPilot
            </a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
  to="/login"
  className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold hover:text-brand sm:block"
>
  Log In
</Link>

            <Link
  to="/signup"
  className="inline-flex items-center rounded-xl bg-brand px-4 py-2.5 text-sm font-extrabold text-brand-foreground shadow-lg shadow-brand/10 hover:brightness-95 sm:px-5"
>
  Sign Up
  <ArrowUpRight size={15} className="ml-1" />
</Link>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-outline bg-surface hover:border-brand"
            >
              {theme === "dark" ? (
                <Sun size={19} />
              ) : (
                <Moon size={19} />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main>
        <section className="relative mx-auto grid min-h-190 max-w-345 items-center gap-16 px-5 pb-28 pt-20 lg:grid-cols-[1.03fr_1fr] lg:gap-12 lg:px-12 lg:pb-32 lg:pt-24">
          {/* Left Content */}
          <div className="hero-enter relative z-10 max-w-162.5">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand-soft px-4 py-2.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
              </span>
              <span className="text-[10px] font-extrabold tracking-[0.16em] text-primary-text sm:text-xs">
                YOUR INTELLIGENT BUSINESS PARTNER
              </span>
              <ChevronRight size={14} className="text-brand" />
            </div>

            <h1 className="font-display text-[clamp(3.2rem,5.3vw,5.9rem)] font-extrabold leading-[1.07] tracking-[-0.07em]">
              Your business.
              <br />
              <span className="relative inline-block text-brand">
                One step ahead.
                <svg
                  viewBox="0 0 450 20"
                  className="absolute -bottom-3 left-0 w-full"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M5 14 Q225 -3 445 11"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    opacity=".6"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-10 max-w-132.5 text-base leading-8 text-muted-text sm:text-lg">
              Stop guessing. Start growing. Turn your sales,
              customers, and business data into powerful
              insights with an AI copilot built to help you
              make smarter decisions.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <button
                type="button"
                className="group flex items-center gap-3 rounded-2xl bg-brand px-7 py-4 text-sm font-extrabold text-brand-foreground shadow-[0_12px_35px_rgba(250,204,21,0.15)] hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(250,204,21,0.25)] sm:text-base"
              >
                Get Started Free
                <ArrowRight
                  size={19}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>

              <a
                href="#preview"
                className="flex items-center gap-2 rounded-2xl border border-outline bg-surface px-6 py-4 text-sm font-bold hover:border-brand sm:text-base"
              >
                <CirclePlay size={19} className="text-brand" />
                Explore Platform
              </a>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-outline pt-7">
              <span className="flex items-center gap-2 text-xs font-medium text-muted-text">
                <ShieldCheck size={16} className="text-brand" />
                Data-driven insights
              </span>
              <span className="flex items-center gap-2 text-xs font-medium text-muted-text">
                <Zap size={16} className="text-brand" />
                AI-powered analysis
              </span>
              <span className="flex items-center gap-2 text-xs font-medium text-muted-text">
                <Check size={16} className="text-brand" />
                Simple to use
              </span>
            </div>
          </div>

          {/* Right Dashboard */}
          <div
            id="preview"
            className="hero-enter-delayed relative flex items-center justify-center py-10 lg:py-0"
          >
            <div className="absolute h-130 w-130 max-w-full rounded-full bg-brand/10 blur-[110px]" />
            <DashboardPreview />
          </div>
        </section>

        {/* Feature Section */}
        <section
          id="features"
          className="relative border-t border-outline bg-surface/50 px-5 py-24 lg:px-12"
        >
          <div className="mx-auto max-w-312.5">
            <div className="scroll-reveal mb-12 max-w-2xl">
              <span className="text-xs font-extrabold tracking-[0.2em] text-brand">
                BUILT FOR BETTER DECISIONS
              </span>
              <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-5xl">
                Everything you need.
                <br />
                <span className="text-muted-text">
                  Nothing you don't.
                </span>
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {[
                {
                  icon: BarChart3,
                  title: "Business Analytics",
                  description:
                    "Understand sales, customers, and performance through a clear business overview.",
                },
                {
                  icon: BrainCircuit,
                  title: "AI Business Copilot",
                  description:
                    "Ask meaningful questions about your business and explore actionable insights.",
                },
                {
                  icon: TrendingUp,
                  title: "Growth Opportunities",
                  description:
                    "Identify patterns, track progress, and discover where to focus next.",
                },
              ].map((item, index) => {
                const Icon = item.icon;

                return (
  <div
    key={item.title}
    style={{ transitionDelay: `${index * 120}ms` }}
    className="scroll-reveal group rounded-[22px] border border-outline bg-surface p-8 transition-all duration-300 hover:-translate-y-2 hover:border-brand/50 hover:shadow-xl"
  >
                    <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand transition-transform duration-300 group-hover:scale-110">
                      <Icon size={26} />
                    </div>

                    <h3 className="font-display text-xl font-extrabold">
                      {item.title}
                    </h3>

                    <p className="mt-4 text-sm leading-7 text-muted-text">
                      {item.description}
                    </p>

                    <div className="mt-7 flex items-center gap-2 text-sm font-bold text-brand">
                      Explore
                      <ArrowUpRight size={17} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="about"
className="scroll-reveal mx-auto max-w-312.5 px-5 py-20 text-center lg:px-12"
        >
          <Sparkles size={26} className="mx-auto mb-5 text-brand" />
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Less complexity. More clarity.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-text">
            A smarter workspace for understanding your business
            and planning your next move.
          </p>
        </section>
      </main>

      <footer className="border-t border-outline px-5 py-7 text-center text-xs text-muted-text">
        © {new Date().getFullYear()} BizPilot AI. All rights reserved.
      </footer>

      {/* Animations */}
      
<style>{`
  /* Only graph drawing animation */
  @keyframes drawChart {
    from {
      stroke-dashoffset: 700;
    }
    to {
      stroke-dashoffset: 0;
    }
  }

  .chart-draw {
    stroke-dasharray: 700;
    animation: drawChart 2.5s ease-out forwards;
  }

  /* All layout elements remain stationary */
  .hero-enter,
  .hero-enter-delayed,
  .dashboard-float,
  .float-delayed,
  .hero-glow {
    animation: none !important;
  }

  /* Disable automatic hover movement */
  .hover\\:-translate-y-1:hover,
  .hover\\:-translate-y-2:hover,
  .hover\\:-translate-y-0\\.5:hover,
  .group:hover {
    translate: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .chart-draw {
      animation: none;
      stroke-dasharray: none;
    }
  }
`}</style>

    </div>
  );
}


export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />

        <Route
          path="/dashboard/analytics"
          element={<Analytics />}
        />

        <Route
          path="/dashboard/orders"
          element={<Orders />}
        />


        <Route 
          path="/dashboard/customers"
          element={<Customers />}
        />


        <Route
          path="/dashboard/expenses" 
          element={<Expenses />} 
        />

        <Route
          path="/dashboard/ai-copilot" 
          element={<AICopilot />}
       />


      </Route>
    </Routes>
  );
}