import React from "react";

type Props = {
    className?: string;
    children?: React.ReactNode;
};

export default function GlassCard({ className = "", children }: Props) {
    return (
        <div className={`border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] backdrop-blur-[24px] rounded-none shadow-none p-6 ${className}`.trim()}>{children}</div>
    );
}
