import React from "react";
import GlassCard from "./GlassCard";

interface Props {
    title?: string;
    children: React.ReactNode;
    className?: string;
}

export default function ChartCard({ title, children, className = "" }: Props) {
    return (
        <GlassCard className={`p-4 ${className}`}>
            {title && (
                <h3
                    className="text-sm sm:text-base font-semibold mb-3"
                    style={{ color: "var(--theme-primary)" }}
                >
                    {title}
                </h3>
            )}
            <div>{children}</div>
        </GlassCard>
    );
}
