import React from "react";

type Props = {
    className?: string;
    children?: React.ReactNode;
};

export default function CompactCard({ className = "", children }: Props) {
    return (
        <div
            className={`border border-[var(--theme-glass-border)] bg-[var(--theme-glass)] px-3 py-2 backdrop-blur-[20px] ${className}`.trim()}
        >
            {children}
        </div>
    );
}
