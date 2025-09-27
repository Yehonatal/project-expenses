import { createContext, useState, useEffect, type ReactNode } from "react";

export type Theme = "light" | "gray" | "dark";

interface ThemeColors {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    glass: string;
    glassBorder: string;
    text: string;
    textSecondary: string;
    border: string;
    hover: string;
    focus: string;
    active: string;
}

const themes: Record<Theme, ThemeColors> = {
    light: {
        primary: "#000000",
        secondary: "#333333",
        accent: "#0066cc",
        background: "#ffffff",
        surface: "#f8f8f8",
        glass: "rgba(255, 255, 255, 0.25)",
        glassBorder: "rgba(0, 0, 0, 0.12)",
        text: "#000000",
        textSecondary: "#666666",
        border: "#e0e0e0",
        hover: "#f0f0f0",
        focus: "#e0e0e0",
        active: "#d0d0d0",
    },
    gray: {
        primary: "#374151",
        secondary: "#6b7280",
        accent: "#9ca3af",
        background: "#f3f4f6",
        surface: "#e5e7eb",
        glass: "rgba(229, 231, 235, 0.3)",
        glassBorder: "rgba(107, 114, 128, 0.2)",
        text: "#111827",
        textSecondary: "#6b7280",
        border: "#d1d5db",
        hover: "#f9fafb",
        focus: "#e5e7eb",
        active: "#d1d5db",
    },
    dark: {
        primary: "#ffffff",
        secondary: "#e5e7eb",
        accent: "#60a5fa",
        background: "#000000",
        surface: "#1a1a1a",
        glass: "rgba(26, 26, 26, 0.4)",
        glassBorder: "rgba(255, 255, 255, 0.2)",
        text: "#ffffff",
        textSecondary: "#cccccc",
        border: "#333333",
        hover: "#2a2a2a",
        focus: "#404040",
        active: "#4a4a4a",
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
        // Check if the saved theme is valid, otherwise use default
        return saved && themes[saved] ? saved : "light";
    });

    useEffect(() => {
        localStorage.setItem("theme", theme);
        // Apply theme to document root for CSS custom properties
        const root = document.documentElement;
        const colors = themes[theme] || themes.gray; // Fallback to light theme

        root.style.setProperty("--theme-primary", colors.primary);
        root.style.setProperty("--theme-secondary", colors.secondary);
        root.style.setProperty("--theme-accent", colors.accent);
        root.style.setProperty("--theme-background", colors.background);
        root.style.setProperty("--theme-surface", colors.surface);
        root.style.setProperty("--theme-glass", colors.glass);
        root.style.setProperty("--theme-glass-border", colors.glassBorder);
        root.style.setProperty("--theme-text", colors.text);
        root.style.setProperty("--theme-text-secondary", colors.textSecondary);
        root.style.setProperty("--theme-border", colors.border);
        root.style.setProperty("--theme-hover", colors.hover);
        root.style.setProperty("--theme-focus", colors.focus);
        root.style.setProperty("--theme-active", colors.active);
    }, [theme]);

    return (
        <ThemeContext.Provider
            value={{ theme, colors: themes[theme] || themes.light, setTheme }}
        >
            {children}
        </ThemeContext.Provider>
    );
};
