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

    const cycleTheme = () => {
        const currentIndex = themeOptions.findIndex(
            (option) => option.value === theme
        );
        const nextIndex = (currentIndex + 1) % themeOptions.length;
        setTheme(themeOptions[nextIndex].value);
    };

    return (
        <button
            onClick={cycleTheme}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
            style={{
                backgroundColor: "var(--theme-surface)",
                border: "none",
            }}
            title="Change theme"
        >
            <Palette size={16} className="text-[var(--theme-text)]" />
        </button>
    );
}
