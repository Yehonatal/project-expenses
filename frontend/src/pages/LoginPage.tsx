import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    ArrowRight,
    ShieldCheck,
    ChartColumnBig,
    CalendarDays,
} from "lucide-react";

export default function Login() {
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");
        if (token) {
            localStorage.setItem("token", token);
            navigate("/");
        }
    }, [navigate]);

    const handleGoogleLogin = () => {
        const baseURL = import.meta.env.VITE_RENDER_URL
            ? import.meta.env.VITE_RENDER_URL.replace("/api", "")
            : "http://localhost:5000";
        window.location.href = `${baseURL}/auth/google`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative min-h-screen overflow-hidden px-6 py-10"
            style={{ backgroundColor: "var(--theme-background)" }}
        >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,var(--theme-aura-one),transparent_28%),radial-gradient(circle_at_82%_80%,var(--theme-aura-two),transparent_32%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--theme-grid)_1px,transparent_1px),linear-gradient(to_bottom,var(--theme-grid)_1px,transparent_1px)] bg-[size:42px_42px] opacity-45" />

            <div className="relative mx-auto flex w-full max-w-5xl flex-col border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] backdrop-blur-[22px] lg:flex-row">
                <div className="flex-1 border-b border-[var(--theme-border)] p-8 lg:border-b-0 lg:border-r lg:p-10">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--theme-text-secondary)]">
                        Minimal money clarity
                    </p>
                    <h1 className="app-heading mt-3 text-4xl leading-tight sm:text-5xl">
                        Cashn't
                    </h1>
                    <p className="mt-4 max-w-md text-sm text-[var(--theme-text-secondary)] sm:text-base">
                        Track expenses, control budgets, and forecast spending
                        with a clean workspace built for daily financial habits.
                    </p>

                    <div className="mt-6 grid grid-cols-1 gap-2 sm:max-w-lg sm:grid-cols-2">
                        <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] px-3 py-2 text-xs text-[var(--theme-text-secondary)] inline-flex items-center gap-2">
                            <CalendarDays
                                size={14}
                                className="text-[var(--theme-accent)]"
                            />
                            Quick daily logging
                        </div>
                        <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] px-3 py-2 text-xs text-[var(--theme-text-secondary)] inline-flex items-center gap-2">
                            <ChartColumnBig
                                size={14}
                                className="text-[var(--theme-accent)]"
                            />
                            Forecast + insights
                        </div>
                        <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] px-3 py-2 text-xs text-[var(--theme-text-secondary)] inline-flex items-center gap-2 sm:col-span-2">
                            <ShieldCheck
                                size={14}
                                className="text-[var(--theme-accent)]"
                            />
                            Secure Google OAuth sign-in and workspace access
                        </div>
                    </div>
                </div>

                <div className="w-full p-8 lg:w-[390px] lg:p-10">
                    <p className="text-xs uppercase tracking-[0.14em] text-[var(--theme-text-secondary)]">
                        Continue
                    </p>
                    <h2 className="app-heading mt-2 text-2xl">Welcome back</h2>
                    <p className="mt-2 text-sm text-[var(--theme-text-secondary)]">
                        Sign in once and pick up where you left off.
                    </p>

                    <div className="mt-5 border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
                        <p className="text-[11px] text-[var(--theme-text-secondary)]">
                            Your recent setup and appearance preferences are
                            preserved after sign-in.
                        </p>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        className="login-google-cta mt-6 flex w-full items-center justify-center gap-3 border border-[var(--theme-border)] bg-[var(--theme-surface)] px-4 py-3 font-medium transition-colors hover:bg-[var(--theme-hover)]"
                        style={{ color: "var(--theme-text)" }}
                    >
                        <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            aria-hidden
                        >
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Continue with Google
                        <ArrowRight size={16} />
                    </button>

                    <p className="mt-3 text-center text-[11px] text-[var(--theme-text-secondary)]">
                        By continuing you agree to authenticate with your Google
                        account.
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
