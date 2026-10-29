import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const controller = new AbortController();

    const verifyLogin = async () => {
      const token = sessionStorage.getItem("access_token");

      if (!token) {
        setStatus("unauthorized");
        return;
      }

      try {
        const response = await fetch(
          "https://bizpilot-api.vercel.app/api/auth/token/verify/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
            signal: controller.signal,
          }
        );

        if (response.ok) {
          setStatus("authorized");
        } else {
          sessionStorage.removeItem("access_token");
          sessionStorage.removeItem("refresh_token");
          setStatus("unauthorized");
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          setStatus("unavailable");
        }
      }
    };

    verifyLogin();

    return () => controller.abort();
  }, []);

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-primary-text">
        <p>Verifying your session...</p>
      </div>
    );
  }

  if (status === "unavailable") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-primary-text">
        <p>Cannot connect to server. Please try again.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg bg-brand px-5 py-2 font-semibold text-brand-foreground"
        >
          Retry
        </button>
      </div>
    );
  }

  if (status === "unauthorized") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}