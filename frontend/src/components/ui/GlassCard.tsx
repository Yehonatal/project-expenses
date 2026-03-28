import React from "react";

type Props = {
    className?: string;
    children?: React.ReactNode;
};

export default function GlassCard({ className = "", children }: Props) {
    return (
        <div
            className={`border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 sm:p-5 ${className}`.trim()}
        >
            {children}
        </div>
    );
}
