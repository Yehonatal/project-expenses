import React, { useRef } from "react";
import { motion } from "framer-motion";

interface Props<T extends string> {
    options: T[];
    value: T;
    onChange: (v: T) => void;
}

export default function SegmentedControl<T extends string>({
    options,
    value,
    onChange,
}: Props<T>) {
    const refs = useRef<Array<HTMLButtonElement | null>>([]);

    const onKeyDown = (e: React.KeyboardEvent, idx: number) => {
        const last = options.length - 1;
        if (e.key === "ArrowRight") {
            const next = idx === last ? 0 : idx + 1;
            onChange(options[next]);
            refs.current[next]?.focus();
            e.preventDefault();
        } else if (e.key === "ArrowLeft") {
            const prev = idx === 0 ? last : idx - 1;
            onChange(options[prev]);
            refs.current[prev]?.focus();
            e.preventDefault();
        } else if (e.key === "Home") {
            onChange(options[0]);
            refs.current[0]?.focus();
            e.preventDefault();
        } else if (e.key === "End") {
            onChange(options[last]);
            refs.current[last]?.focus();
            e.preventDefault();
        }
    };

    return (
        <div
            role="tablist"
            aria-label="Segmented control"
            className="glass-card flex gap-2 p-1.5 rounded-xl"
        >
            {options.map((opt, idx) => {
                const isActive = value === opt;
                const label =
                    (opt as string).charAt(0).toUpperCase() +
                    (opt as string).slice(1).replace("-", " ");
                return (
                    <motion.button
                        key={opt}
                        ref={(el) => {
                            refs.current[idx] = el;
                        }}
                        role="tab"
                        aria-selected={isActive}
                        tabIndex={isActive ? 0 : -1}
                        onKeyDown={(e) => onKeyDown(e, idx)}
                        onClick={() => onChange(opt)}
                        className="relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1"
                        style={{
                            backgroundColor: isActive
                                ? "var(--theme-background)"
                                : "transparent",
                            color: isActive
                                ? "var(--theme-text)"
                                : "var(--theme-text-secondary)",
                            border: isActive
                                ? `1px solid var(--theme-accent)`
                                : "1px solid transparent",
                            boxShadow: isActive
                                ? "0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.1)"
                                : "none",
                            transform: isActive
                                ? "translateY(-1px)"
                                : "translateY(0)",
                        }}
                        whileHover={{
                            scale: 1.02,
                            transition: { duration: 0.2 },
                        }}
                        whileTap={{
                            scale: 0.98,
                            transition: { duration: 0.1 },
                        }}
                    >
                        <span className="relative z-10 select-none">
                            {label}
                        </span>
                        {isActive && (
                            <motion.div
                                layoutId="active-tab-indicator"
                                className="absolute inset-0 rounded-lg"
                                style={{
                                    background: `linear-gradient(135deg, var(--theme-accent) 0%, var(--theme-primary) 100%)`,
                                    opacity: 0.08,
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 25,
                                }}
                            />
                        )}
                        {isActive && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                                style={{
                                    backgroundColor: "var(--theme-accent)",
                                    boxShadow: "0 0 6px var(--theme-accent)",
                                }}
                            />
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
}
