import { X } from "lucide-react";
import type { ReactNode } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    actions?: ReactNode;
    maxWidthClass?: string;
}

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    actions,
    maxWidthClass = "max-w-2xl",
}: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            <div
                className="absolute inset-0 bg-black/50 sm:bg-black/32"
                style={{
                    backdropFilter: "blur(1px)",
                }}
                onClick={onClose}
            />

            <div
                className={`relative mx-2 mb-2 w-[calc(100%-1rem)] max-h-[92vh] overflow-hidden border border-[var(--theme-glass-border)] bg-[var(--theme-surface)] shadow-xl sm:mx-4 sm:mb-0 sm:w-full sm:max-h-[86vh] sm:bg-[var(--theme-glass)] sm:shadow-none sm:backdrop-blur-[24px] ${maxWidthClass}`}
            >
                <div
                    className="flex items-center justify-between border-b p-3 sm:p-4"
                    style={{ borderColor: "var(--theme-border)" }}
                >
                    <h3
                        className="text-xs sm:text-sm lg:text-sm font-semibold"
                        style={{ color: "var(--theme-text)" }}
                    >
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center hover:bg-theme-surface/50 transition-all duration-200 cursor-pointer"
                        style={{
                            color: "var(--theme-text-secondary)",
                        }}
                        aria-label="Close modal"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="max-h-[calc(92vh-128px)] overflow-y-auto p-3 sm:max-h-[calc(86vh-132px)] sm:p-4">
                    {children}
                </div>

                {actions && (
                    <div
                        className="flex justify-end gap-2 border-t p-3 sm:gap-3 sm:p-4"
                        style={{ borderColor: "var(--theme-border)" }}
                    >
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}
