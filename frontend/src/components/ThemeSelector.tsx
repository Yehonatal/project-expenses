import { Palette } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import type { Theme } from "../contexts/ThemeContext";

const themeOptions: { value: Theme; label: string; preview: string }[] = [
    {
        value: "black-white",
        label: "Black & White",
        preview: "bg-white border border-gray-300",
    },
    {
        value: "earth",
        label: "Earth",
        preview: "bg-amber-50 border border-amber-200",
    },
    {
        value: "bluish",
        label: "Bluish",
        preview: "bg-blue-50 border border-blue-200",
    },
    {
        value: "dark",
        label: "Dark",
        preview: "bg-gray-900 border border-gray-700",
    },
    {
        value: "purple",
        label: "Purple",
        preview: "bg-purple-50 border border-purple-200",
    },
];

export default function ThemeSelector() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="relative">
            <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as Theme)}
                className="appearance-none bg-transparent border border-[var(--theme-border)] rounded px-1 py-1 pr-6 text-sm hover:bg-[var(--theme-hover)] transition-colors cursor-pointer text-[var(--theme-text)] md:px-3 md:py-1.5 md:pr-8"
            >
                <option value="" disabled className="md:hidden">
                    Theme
                </option>
                {themeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-1 pointer-events-none">
                <Palette
                    size={14}
                    className="text-[var(--theme-text-secondary)]"
                />
            </div>
        </div>
    );
}
