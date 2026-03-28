import React from "react";

type Props = {
    className?: string;
    children?: React.ReactNode;
};

export default function GlassCard({ className = "", children }: Props) {
    return (
        <div
            className={`border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] p-4 backdrop-blur-[24px] sm:p-5 ${className}`.trim()}
        >
            {children}
        </div>
    );
}
