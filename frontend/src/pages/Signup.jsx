
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Moon,
  Sun,
  UserRound,
  Zap,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Signup() {
  const { theme, toggleTheme } = useTheme();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
    setError("");
  };

  const handleSubmit = async (event) => {
  event.preventDefault();
  setError("");

  if (Object.values(form).some((value) => !value.trim())) {
    setError("Please complete all fields.");
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    setError("Please enter a valid email address.");
    return;
  }

  if (form.password.length < 8) {
    setError("Password must contain at least 8 characters.");
    return;
  }

  if (form.password !== form.confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  try {
    const response = await fetch(
      "http://https://bizpilot-api.vercel.app/api/auth/register/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.name.trim().replace(/\s+/g, "_"),
          email: form.email.trim(),
          password: form.password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const message = Object.values(data).flat().join(" ");
      setError(message || "Registration failed.");
      return;
    }

    alert("Account created successfully!");

  } catch (error) {
    setError("Cannot connect to server. Please try again.");
  }
};

  const inputClass =
    "h-13 w-full bg-transparent text-sm text-primary-text outline-none placeholder:text-muted-text";

  return (
    <div className="min-h-screen bg-background text-primary-text">
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

<main className="mx-auto grid min-h-[calc(100vh-100px)] max-w-7xl items-center gap-14 px-5 pb-16 lg:grid-cols-2 lg:px-10">      
<section className="hidden w-full max-w-lg flex-col items-start justify-center self-center text-left lg:flex lg:-translate-y-16">  <div className="mb-7 inline-flex w-fit items-center justify-center gap-2 rounded-full border border-outline bg-surface px-4 py-2 text-xs font-bold tracking-wider">
    <span className="h-2 w-2 rounded-full bg-brand" />
    YOUR BUSINESS WORKSPACE
  </div>

  <h1 className="font-display text-5xl font-extrabold leading-[1.15] tracking-tighter">
    Build better.
    <br />
    Grow smarter.
    <br />
    <span className="text-brand">Start here.</span>
  </h1>

  <p className="mt-6 max-w-md text-base leading-7 text-muted-text">
    Bring your business data, performance, and decisions
    together in one organized workspace.
  </p>

  <div className="mt-9 w-full max-w-sm space-y-5 border-l-2 border-brand pl-5 text-left">
    <div>
      <h3 className="text-sm font-bold">
        One clear dashboard
      </h3>
      <p className="mt-1 text-sm text-muted-text">
        Keep track of what matters most.
      </p>
    </div>

    <div>
      <h3 className="text-sm font-bold">
        Better business insights
      </h3>
      <p className="mt-1 text-sm text-muted-text">
        Understand performance with clarity.
      </p>
    </div>

    <div>
      <h3 className="text-sm font-bold">
        Built for everyday business
      </h3>
      <p className="mt-1 text-sm text-muted-text">
        Simple tools for confident decisions.
      </p>
    </div>
  </div>
</section>

        <section className="mx-auto w-full max-w-115 lg:max-w-none">
          <div className="rounded-4xl border border-outline bg-surface p-6 shadow-lg shadow-black/5 sm:p-10">
            <p className="mb-3 text-xs font-extrabold tracking-[0.16em] text-brand">
              GET STARTED
            </p>

            <h2 className="font-display text-3xl font-extrabold tracking-tight">
              Create your account.
            </h2>

            <p className="mt-3 text-sm text-muted-text">
              Enter your details to set up your workspace.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="signup-name" className="mb-2 block text-sm font-semibold">
                  Full name
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-outline bg-background px-4 focus-within:border-brand">
                  <UserRound size={18} className="shrink-0 text-muted-text" />
                  <input
                    id="signup-name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signup-email" className="mb-2 block text-sm font-semibold">
                  Email address
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-outline bg-background px-4 focus-within:border-brand">
                  <Mail size={18} className="shrink-0 text-muted-text" />
                  <input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signup-password" className="mb-2 block text-sm font-semibold">
                  Password
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-outline bg-background px-4 focus-within:border-brand">
                  <LockKeyhole size={18} className="shrink-0 text-muted-text" />
                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="text-muted-text hover:text-primary-text"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="signup-confirm" className="mb-2 block text-sm font-semibold">
                  Confirm password
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-outline bg-background px-4 focus-within:border-brand">
                  <LockKeyhole size={18} className="shrink-0 text-muted-text" />
                  <input
                    id="signup-confirm"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    value={form.confirmPassword}
                    onChange={(e) => updateField("confirmPassword", e.target.value)}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    className="text-muted-text hover:text-primary-text"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                Create Account
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="mt-8 border-t border-outline pt-6 text-center text-sm text-muted-text">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-brand">
                Log In
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
