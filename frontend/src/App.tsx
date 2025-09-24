import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { List, PieChart, FileText, LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";
import ExpensePage from "./pages/ExpensePage";
import SummaryPage from "./pages/SummaryPage";
import TemplatesPage from "./pages/TemplatesPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import API, { authAPI } from "./api/api";
import Loading from "./components/Loading";

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
        <Router>
            {!user ? (
                <LoginPage />
            ) : (
                <div className="max-w-5xl mx-auto">
                    <nav className="p-4 flex gap-6 justify-between items-center text-brown font-semibold">
                        <div className="flex gap-6">
                            <Link
                                to="/"
                                className="hover:underline hover:text-clay transition-colors duration-200 flex items-center gap-2"
                                aria-label="Expenses"
                            >
                                <List size={20} />
                            </Link>
                            <Link
                                to="/summary"
                                className="hover:underline hover:text-clay transition-colors duration-200 flex items-center gap-2"
                                aria-label="Summary"
                            >
                                <PieChart size={20} />
                            </Link>
                            <Link
                                to="/templates"
                                className="hover:underline hover:text-clay transition-colors duration-200 flex items-center gap-2"
                                aria-label="Templates"
                            >
                                <FileText size={20} />
                            </Link>
                            <Link
                                to="/profile"
                                className="hover:underline hover:text-clay transition-colors duration-200 flex items-center gap-2"
                                aria-label="Profile"
                            >
                                <User size={20} />
                            </Link>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleLogout}
                                className="hover:text-clay transition-colors duration-200 flex items-center gap-2"
                                aria-label="Logout"
                            >
                                <LogOut size={20} />
                            </button>
                            <Link
                                to="/profile"
                                className="hover:opacity-80 transition-opacity"
                            >
                                {avatarError || !user.picture ? (
                                    <div className="w-8 h-8 rounded-full bg-brown flex items-center justify-center text-white text-lg cursor-pointer">
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
                    </nav>

                    <Routes>
                        <Route path="/" element={<ExpensePage />} />
                        <Route path="/summary" element={<SummaryPage />} />
                        <Route path="/templates" element={<TemplatesPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                    </Routes>
                </div>
            )}
        </Router>
    );
}
