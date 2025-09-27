import { Link } from "react-router-dom";
import {
    List,
    PieChart,
    FileText,
    LogOut,
    DollarSign,
    User,
} from "lucide-react";
import { useState } from "react";
import ThemeSelector from "./ThemeSelector";

interface UserData {
    _id: string;
    name: string;
    email: string;
    picture?: string | null;
}

interface Props {
    user: UserData;
    onLogout: () => void;
}

export default function NavBar({ user, onLogout }: Props) {
    const [avatarError, setAvatarError] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass backdrop-blur-xl">
            <div className="max-w-6xl mx-auto flex gap-8 justify-between items-center px-6 py-3">
                <div className="flex gap-6">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-sm font-medium transition-colors duration-200 hover:text-theme-accent"
                        style={{ color: "var(--theme-text)" }}
                        aria-label="Expenses"
                    >
                        <List
                            size={20}
                            style={{ color: "var(--theme-text)" }}
                        />
                        <span className="hidden sm:inline">Expenses</span>
                    </Link>
                    <Link
                        to="/summary"
                        className="flex items-center gap-2 text-sm font-medium transition-colors duration-200 hover:text-theme-accent"
                        style={{ color: "var(--theme-text)" }}
                        aria-label="Summary"
                    >
                        <PieChart
                            size={20}
                            style={{ color: "var(--theme-text)" }}
                        />
                        <span className="hidden sm:inline">Summary</span>
                    </Link>
                    <Link
                        to="/templates"
                        className="flex items-center gap-2 text-sm font-medium transition-colors duration-200 hover:text-theme-accent"
                        style={{ color: "var(--theme-text)" }}
                        aria-label="Templates"
                    >
                        <FileText
                            size={20}
                            style={{ color: "var(--theme-text)" }}
                        />
                        <span className="hidden sm:inline">Templates</span>
                    </Link>
                    <Link
                        to="/budget"
                        className="flex items-center gap-2 text-sm font-medium transition-colors duration-200 hover:text-theme-accent"
                        style={{ color: "var(--theme-text)" }}
                        aria-label="Budget"
                    >
                        <DollarSign
                            size={20}
                            style={{ color: "var(--theme-text)" }}
                        />
                        <span className="hidden sm:inline">Budget</span>
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <ThemeSelector />

                    <button
                        onClick={onLogout}
                        className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2"
                        style={{
                            backgroundColor: "var(--theme-surface)",
                            border: "1px solid var(--theme-border)",
                            color: "var(--theme-text)",
                        }}
                        aria-label="Logout"
                        title="Logout"
                    >
                        <LogOut size={22} />
                    </button>

                    <Link
                        to="/profile"
                        className="hover:opacity-90 transition-opacity"
                        aria-label="Profile"
                        title={user.name}
                    >
                        <div
                            className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
                            style={{
                                border: "1px solid var(--theme-border)",
                                backgroundColor:
                                    avatarError || !user.picture
                                        ? "var(--theme-primary)"
                                        : "transparent",
                            }}
                        >
                            {avatarError || !user.picture ? (
                                <User size={18} className="text-white" />
                            ) : (
                                <img
                                    src={user.picture}
                                    alt={user.name}
                                    className="w-full h-full object-cover block"
                                    onError={() => setAvatarError(true)}
                                />
                            )}
                        </div>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
