import React, { useState, useEffect, useRef } from "react";
import { API } from "../../api/api";
import { uiControl } from "../../utils/uiClasses";

interface SuggestionInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    name?: string;
}

export const SuggestionInput: React.FC<SuggestionInputProps> = ({
    value,
    onChange,
    placeholder,
    className,
    name,
}) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!value.trim()) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const res = await API.get<string[]>(
                    `/types/suggest?q=${encodeURIComponent(value)}`,
                );
                setSuggestions(res.data || []);
            } catch (error) {
                console.error("Failed to fetch suggestions", error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [value]);

    const handleSelect = (suggestion: string) => {
        onChange(suggestion);
        setShowSuggestions(false);
    };

    return (
        <div className="relative" ref={containerRef}>
            <input
                type="text"
                name={name}
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => {
                    if (
                        e.key === "Enter" &&
                        suggestions.length > 0 &&
                        showSuggestions
                    ) {
                        e.preventDefault();
                        handleSelect(suggestions[0]);
                    }
                }}
                placeholder={placeholder}
                className={className || uiControl.input}
                autoComplete="off"
            />
            {showSuggestions && (suggestions.length > 0 || isLoading) && (
                <div className="absolute z-50 mt-1 w-full border border-[var(--theme-border)] bg-[var(--theme-surface)] shadow-lg">
                    {isLoading ? (
                        <div className="px-3 py-2 text-xs text-[var(--theme-text-secondary)] italic">
                            Searching...
                        </div>
                    ) : (
                        suggestions.map((s) => (
                            <button
                                key={s}
                                type="button"
                                className="block w-full px-3 py-2 text-left text-sm text-[var(--theme-text)] hover:bg-[var(--theme-hover)]"
                                onClick={() => handleSelect(s)}
                            >
                                {s}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};
