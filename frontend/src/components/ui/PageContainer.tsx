import { motion } from "framer-motion";
import React from "react";

type Props = {
    title?: string;
    className?: string;
    children?: React.ReactNode;
};

export default function PageContainer({
    title,
    className = "",
    children,
}: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`max-w-6xl mx-auto space-y-2 ${className}`.trim()}
        >
            {title && (
                <h1
                    className="text-base font-bold"
                    style={{ color: "var(--theme-text)" }}
                >
                    {title}
                </h1>
            )}
            {children}
        </motion.div>
    );
}
