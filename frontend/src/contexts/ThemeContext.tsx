import { createContext, useState, useEffect, type ReactNode } from "react";

export type Theme = "black-white" | "earth" | "bluish" | "dark" | "purple";

interface ThemeColors {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    hover: string;
    focus: string;
    active: string;
}

const themes: Record<Theme, ThemeColors> = {
    "black-white": {
        primary: "#000000",
        secondary: "#ffffff",
        accent: "#666666",
        background: "#ffffff",
        surface: "#f8f8f8",
        text: "#000000",
        textSecondary: "#666666",
        border: "#e0e0e0",
        hover: "#f0f0f0",
        focus: "#e0e0e0",
        active: "#d0d0d0",
    },
    earth: {
        primary: "#5C4B3B",
        secondary: "#D8A48F",
        accent: "#8A9E5B",
        background: "#F4E1D2",
        surface: "#E3D4B9",
        text: "#5C4B3B",
        textSecondary: "#8A9E5B",
        border: "#D8A48F",
        hover: "#F0E8E0",
        focus: "#E8D8C8",
        active: "#DCC8B8",
    },
    bluish: {
        primary: "#1e3a8a",
        secondary: "#3b82f6",
        accent: "#60a5fa",
        background: "#ffffff",
        surface: "#f0f9ff",
        text: "#1e3a8a",
        textSecondary: "#3b82f6",
        border: "#93c5fd",
        hover: "#e0f2fe",
        focus: "#dbeafe",
        active: "#bfdbfe",
    },
    dark: {
        primary: "#f1f5f9",
        secondary: "#e2e8f0",
        accent: "#94a3b8",
        background: "#0f172a",
        surface: "#1e293b",
        text: "#f8fafc",
        textSecondary: "#cbd5e1",
        border: "#334155",
        hover: "#334155",
        focus: "#475569",
        active: "#64748b",
    },
    purple: {
        primary: "#7c3aed",
        secondary: "#581c87",
        accent: "#a855f7",
        background: "#faf5ff",
        surface: "#f3e8ff",
        text: "#581c87",
        textSecondary: "#7c3aed",
        border: "#c084fc",
        hover: "#f0e6ff",
        focus: "#e9d5ff",
        active: "#d8b4fe",
    },
};

interface ThemeContextType {
    theme: Theme;
    colors: ThemeColors;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export { ThemeContext };

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem("theme") as Theme;
        return saved || "earth";
    });

    useEffect(() => {
        localStorage.setItem("theme", theme);
        // Apply theme to document root for CSS custom properties
        const root = document.documentElement;
        const colors = themes[theme];

        root.style.setProperty("--theme-primary", colors.primary);
        root.style.setProperty("--theme-secondary", colors.secondary);
        root.style.setProperty("--theme-accent", colors.accent);
        root.style.setProperty("--theme-background", colors.background);
        root.style.setProperty("--theme-surface", colors.surface);
        root.style.setProperty("--theme-text", colors.text);
        root.style.setProperty("--theme-text-secondary", colors.textSecondary);
        root.style.setProperty("--theme-border", colors.border);
        root.style.setProperty("--theme-hover", colors.hover);
        root.style.setProperty("--theme-focus", colors.focus);
        root.style.setProperty("--theme-active", colors.active);
    }, [theme]);

    return (
        <ThemeContext.Provider
            value={{ theme, colors: themes[theme], setTheme }}
        >
            {children}
        </ThemeContext.Provider>
    );
};
