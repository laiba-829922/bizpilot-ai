import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  BarChart3,
  ShoppingCart,
  Users,
  BrainCircuit,
  Settings,
  Zap,
  Wallet,
  Menu,
  X,
} from "lucide-react";

const menuItems = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    path: "/dashboard/analytics",
  },
  {
    label: "Orders",
    icon: ShoppingCart,
    path: "/dashboard/orders",
  },
  {
    label: "Customers",
    icon: Users,
    path: "/dashboard/customers",
  },
  {
    label: "Expenses",
    icon: Wallet,
    path: "/dashboard/expenses",
  },
  {
    label: "AI Copilot",
    icon: BrainCircuit,
    path: "/dashboard/ai-copilot",
  },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close mobile sidebar after navigation
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Prevent background scrolling while mobile menu is open
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
      isActive
        ? "bg-brand-soft text-brand"
        : "text-muted-text hover:bg-elevated hover:text-primary-text"
    }`;

  return (
    <>
      {/* Mobile / Tablet Menu Button */}
{/* Mobile / Tablet Menu Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
        aria-controls="bizpilot-sidebar"
        className="
          fixed right-4 top-4 z-40
          flex h-11 w-11
          items-center justify-center
          rounded-xl
          border border-outline
          bg-surface
          text-primary-text
          shadow-md
          transition-colors
          hover:border-brand hover:text-brand
          lg:hidden
        "
      >
        <Menu size={22} />
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        id="bizpilot-sidebar"
        className={`
          fixed inset-y-0 left-0 z-50
          flex h-dvh w-64 shrink-0 flex-col
          overflow-hidden border-r border-outline
          bg-surface shadow-xl
          transition-transform duration-300 ease-in-out

          lg:sticky lg:top-0 lg:z-auto lg:h-screen
          lg:translate-x-0 lg:shadow-none

          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Brand */}
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-outline px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-brand-foreground">
              <Zap size={21} fill="currentColor" />
            </div>

            <span className="font-display text-xl font-extrabold text-primary-text">
              BizPilot <span className="text-brand">AI</span>
            </span>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-text transition hover:bg-elevated hover:text-primary-text lg:hidden"
          >
            <X size={21} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-text">
            Workspace
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.label}
                to={item.path}
                end={item.path === "/dashboard"}
                onClick={() => setIsOpen(false)}
                className={navClass}
              >
                <Icon size={19} />

                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Settings */}
        <div className="mt-auto shrink-0 border-t border-outline bg-surface p-4">
          <NavLink
            to="/dashboard/settings"
            onClick={() => setIsOpen(false)}
            className={navClass}
          >
            <Settings size={19} />

            <span>Settings</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
}