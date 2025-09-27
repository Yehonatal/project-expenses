import React from "react";

type Props = {
    className?: string;
    children?: React.ReactNode;
};

export default function GlassCard({ className = "", children }: Props) {
    return (
        <div className={`glass-card p-6 ${className}`.trim()}>{children}</div>
    );
}
