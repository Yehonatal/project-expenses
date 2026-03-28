import { motion } from "framer-motion";
import React from "react";

type Props = {
    title?: string;
    subtitle?: string;
    className?: string;
    children?: React.ReactNode;
};

export default function PageContainer({
    title,
    subtitle,
    className = "",
    children,
}: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`w-full min-w-0 max-w-none space-y-4 ${className}`.trim()}
        >
            {title && (
                <div className="space-y-1">
                    <h1 className="font-['Playfair_Display'] text-base font-semibold tracking-[-0.01em] sm:text-lg">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-xs text-[var(--theme-text-secondary)] sm:text-sm">
                            {subtitle}
                        </p>
                    )}
                </div>
            )}
            {children}
        </motion.div>
    );
}
