import React from "react";
import GlassCard from "./GlassCard";

interface Props {
    title: React.ReactNode;
    value?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
}

export default function StatCard({
    title,
    value,
    children,
    className = "",
}: Props) {
    return (
        <GlassCard className={className}>
            <h3
                className="text-xs sm:text-sm lg:text-sm font-semibold"
                style={{ color: "var(--theme-primary)" }}
            >
                {title}
            </h3>
            {value !== undefined && (
                <p
                    className="text-lg sm:text-xl lg:text-2xl font-bold"
                    style={{ color: "var(--theme-accent)" }}
                >
                    {value}
                </p>
            )}
            {children}
        </GlassCard>
    );
}
