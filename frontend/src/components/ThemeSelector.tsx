import { Palette } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import type { Theme } from "../contexts/ThemeContext";

const themeOptions: { value: Theme; label: string; preview: string }[] = [
    {
        value: "light",
        label: "Light",
        preview: "bg-white border border-gray-300",
    },
    {
        value: "gray",
        label: "Gray",
        preview: "bg-gray-100 border border-gray-300",
    },
    {
        value: "dark",
        label: "Dark",
        preview: "bg-black border border-gray-700",
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
            className="w-10 h-10 rounded-xl glass-button flex items-center justify-center hover:glass-button/80 transition-all duration-200 cursor-pointer p-0"
            title="Change theme"
            aria-label="Change theme"
        >
            <Palette
                size={18}
                strokeWidth={1.6}
                className="text-[var(--theme-text)]"
            />
        </button>
    );
}
