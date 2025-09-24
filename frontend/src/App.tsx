import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { List, PieChart, FileText, LogOut, User, Github } from "lucide-react";
import { useEffect, useState } from "react";
import ExpensePage from "./pages/ExpensePage";
import SummaryPage from "./pages/SummaryPage";
import TemplatesPage from "./pages/TemplatesPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import API, { authAPI } from "./api/api";
import Loading from "./components/Loading";
import ThemeSelector from "./components/ThemeSelector";
import { ThemeProvider } from "./contexts/ThemeContext";

interface UserData {
    _id: string;
    name: string;
    email: string;
    picture: string;
}

export default function App() {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [avatarError, setAvatarError] = useState(false);

    useEffect(() => {
        // Check for token in URL query params (from OAuth callback)
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get("token");
        if (tokenFromUrl) {
            localStorage.setItem("token", tokenFromUrl);
            // Remove token from URL
            window.history.replaceState(
                {},
                document.title,
                window.location.pathname
            );
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            authAPI.defaults.headers.common[
                "Authorization"
            ] = `Bearer ${token}`;
            authAPI
                .get("/auth/me")
                .then((res) => setUser(res.data))
                .catch(() => {
                    localStorage.removeItem("token");
                    delete API.defaults.headers.common["Authorization"];
                    delete authAPI.defaults.headers.common["Authorization"];
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        delete API.defaults.headers.common["Authorization"];
        delete authAPI.defaults.headers.common["Authorization"];
        setUser(null);
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <ThemeProvider>
            <Router>
                {!user ? (
                    <LoginPage />
                ) : (
                    <div
                        className="max-w-5xl mx-auto"
                        style={{
                            backgroundColor: "var(--theme-background)",
                            color: "var(--theme-text)",
                        }}
                    >
                        <nav
                            className="p-4 flex gap-6 justify-between items-center font-semibold"
                            style={{
                                borderBottom: "1px solid var(--theme-border)",
                            }}
                        >
                            <div className="flex gap-6">
                                <Link
                                    to="/"
                                    className="hover:underline transition-colors duration-200 flex items-center gap-2"
                                    style={{
                                        color: "var(--theme-text)",
                                        textDecorationColor:
                                            "var(--theme-accent)",
                                    }}
                                    aria-label="Expenses"
                                >
                                    <List size={20} />
                                </Link>
                                <Link
                                    to="/summary"
                                    className="hover:underline transition-colors duration-200 flex items-center gap-2"
                                    style={{
                                        color: "var(--theme-text)",
                                        textDecorationColor:
                                            "var(--theme-accent)",
                                    }}
                                    aria-label="Summary"
                                >
                                    <PieChart size={20} />
                                </Link>
                                <Link
                                    to="/templates"
                                    className="hover:underline transition-colors duration-200 flex items-center gap-2"
                                    style={{
                                        color: "var(--theme-text)",
                                        textDecorationColor:
                                            "var(--theme-accent)",
                                    }}
                                    aria-label="Templates"
                                >
                                    <FileText size={20} />
                                </Link>
                                <Link
                                    to="/profile"
                                    className="hover:underline transition-colors duration-200 flex items-center gap-2"
                                    style={{
                                        color: "var(--theme-text)",
                                        textDecorationColor:
                                            "var(--theme-accent)",
                                    }}
                                    aria-label="Profile"
                                >
                                    <User size={20} />
                                </Link>
                            </div>
                            <div className="flex items-center gap-4">
                                <ThemeSelector />
                                <a
                                    href="https://github.com/Yehonatal/project-expenses"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="transition-colors duration-200 flex items-center gap-2"
                                    style={{
                                        color: "var(--theme-text-secondary)",
                                    }}
                                    aria-label="GitHub Repository"
                                >
                                    <Github size={20} />
                                </a>
                                <button
                                    onClick={handleLogout}
                                    className="transition-colors duration-200 flex items-center gap-2"
                                    style={{
                                        color: "var(--theme-text-secondary)",
                                    }}
                                    aria-label="Logout"
                                >
                                    <LogOut size={20} />
                                </button>
                                <Link
                                    to="/profile"
                                    className="hover:opacity-80 transition-opacity"
                                >
                                    {avatarError || !user.picture ? (
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-lg cursor-pointer"
                                            style={{
                                                backgroundColor:
                                                    "var(--theme-primary)",
                                            }}
                                        >
                                            💰
                                        </div>
                                    ) : (
                                        <img
                                            src={user.picture}
                                            alt={user.name}
                                            className="w-8 h-8 rounded-full cursor-pointer"
                                            onError={() => setAvatarError(true)}
                                        />
                                    )}
                                </Link>
                            </div>
                        </nav>{" "}
                        <Routes>
                            <Route path="/" element={<ExpensePage />} />
                            <Route path="/summary" element={<SummaryPage />} />
                            <Route
                                path="/templates"
                                element={<TemplatesPage />}
                            />
                            <Route path="/profile" element={<ProfilePage />} />
                        </Routes>
                    </div>
                )}
            </Router>
        </ThemeProvider>
    );
}
