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
            className={`w-full max-w-none space-y-4 ${className}`.trim()}
        >
            {title && (
                <h1 className="font-['Playfair_Display'] tracking-[-0.01em] text-lg font-semibold">{title}</h1>
            )}
            {children}
        </motion.div>
    );
}
