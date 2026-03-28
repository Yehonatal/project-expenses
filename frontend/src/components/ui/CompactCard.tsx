import React from "react";

type Props = {
    className?: string;
    children?: React.ReactNode;
};

export default function CompactCard({ className = "", children }: Props) {
    return (
        <div
            className={`border border-[var(--theme-border)] bg-[var(--theme-surface)] px-3 py-2 ${className}`.trim()}
        >
            {children}
        </div>
    );
}
