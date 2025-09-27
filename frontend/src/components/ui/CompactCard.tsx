import React from "react";

type Props = {
    className?: string;
    children?: React.ReactNode;
};

export default function CompactCard({ className = "", children }: Props) {
    return (
        <div className={`glass rounded-lg pl-4 p-1 px-2 ${className}`.trim()}>
            {children}
        </div>
    );
}
