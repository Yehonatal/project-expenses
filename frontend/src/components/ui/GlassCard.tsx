import React from "react";

type Props = {
    className?: string;
    children?: React.ReactNode;
    style?: React.CSSProperties;
};

export default function GlassCard({ className = "", children, style }: Props) {
    return (
        <div
            className={`border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 sm:p-5 ${className}`.trim()}
            style={style}
        >
            {children}
        </div>
    );
}
