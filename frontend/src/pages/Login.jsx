
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Moon,
  Sun,
  Zap,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Login() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (!form.email.trim() || !form.password) {
    setError("Please fill in all fields.");
    return;
  }

  try {
    const response = await fetch(
      "http://https://bizpilot-api.vercel.app/api/auth/login/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.email.trim(),
          password: form.password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setError(data.detail || "Invalid username or password.");
      return;
    }

    // Temporary local development setup.
    // Production mein secure HttpOnly cookies prefer karenge.
    sessionStorage.setItem("access_token", data.access);
    sessionStorage.setItem("refresh_token", data.refresh);

    navigate("/dashboard");

  } catch (error) {
    setError("Cannot connect to server. Please try again.");
  }
};

  return (
    <div className="min-h-screen bg-background text-primary-text">
      {/* Header */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-10">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-brand-foreground">
            <Zap size={21} fill="currentColor" />
          </div>
          <span className="font-display text-xl font-extrabold tracking-tight">
            BizPilot<span className="text-brand"> AI</span>
          </span>
        </Link>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-outline bg-surface"
        >
          {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
        </button>
      </header>

      {/* Main */}
      <main className="mx-auto grid min-h-[calc(100vh-100px)] max-w-7xl items-center gap-14 px-5 pb-16 lg:grid-cols-2 lg:px-10">
        {/* Brand Side */}
        <section className="hidden max-w-lg lg:block">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-outline bg-surface px-4 py-2 text-xs font-bold tracking-wider">
            <span className="h-2 w-2 rounded-full bg-brand" />
            YOUR BUSINESS WORKSPACE
          </div>

          <h1 className="font-display text-5xl font-extrabold leading-[1.15] tracking-[-0.055em] xl:text-6xl">
            Make every
            <br />
            decision
            <br />
            <span className="text-brand">count.</span>
          </h1>

          <p className="mt-7 max-w-md text-lg leading-8 text-muted-text">
            One clear workspace for understanding your business,
            tracking performance, and planning what comes next.
          </p>

          <div className="mt-12 border-l-2 border-brand pl-5">
            <p className="font-display text-lg font-bold">
              Built for business owners.
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-text">
              Less complexity. More clarity.
            </p>
          </div>
        </section>

        {/* Login Form */}
        <section className="mx-auto w-full max-w-460">
          <div className="rounded-3xl border border-outline bg-surface p-6 shadow-[0_16px_60px_rgba(0,0,0,0.06)] sm:p-10">
            <p className="mb-3 text-xs font-extrabold tracking-[0.16em] text-brand">
              WELCOME BACK
            </p>

            <h2 className="font-display text-3xl font-extrabold tracking-tight">
              Log in to BizPilot.
            </h2>

            <p className="mt-3 text-sm text-muted-text">
              Enter your details to access your workspace.
            </p>

            <form onSubmit={handleSubmit} className="mt-9 space-y-5">
              <div>
                <label
  htmlFor="email"
  className="mb-2 block text-sm font-semibold"
>
  Username
</label>

                <div className="flex items-center gap-3 rounded-xl border border-outline bg-background px-4 focus-within:border-brand">
                  <Mail size={18} className="shrink-0 text-muted-text" />
                  <input
  id="email"
  type="text"
  autoComplete="username"
  placeholder="Enter your username"
  value={form.email}
  onChange={(e) =>
    setForm({ ...form, email: e.target.value })
  }
  className="h-13 w-full bg-transparent text-sm outline-none placeholder:text-muted-text"
/>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold"
                  >
                    Password
                  </label>
                  <span className="text-xs text-muted-text">
                    Forgot password?
                  </span>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-outline bg-background px-4 focus-within:border-brand">
                  <LockKeyhole
                    size={18}
                    className="shrink-0 text-muted-text"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="h-13 w-full bg-transparent text-sm outline-none placeholder:text-muted-text"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="text-muted-text hover:text-primary-text"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p role="alert" className="text-sm text-red-500">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-4 text-sm font-extrabold text-brand-foreground hover:brightness-95"
              >
                Log In
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="mt-8 border-t border-outline pt-6 text-center text-sm text-muted-text">
              Don't have an account?{" "}
              <Link to="/signup" className="font-bold text-brand">
                Create an account
              </Link>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-text">
            © {new Date().getFullYear()} BizPilot AI. All rights reserved.
          </p>
        </section>
      </main>
    </div>
  );
}
