import { useState, useEffect } from "react";
import { Check, X, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

type ToastProps = {
    message?: string;
    type?: ToastType;
};

export default function Toast({ message, type = "success" }: ToastProps) {
    const [show, setShow] = useState(!!message);
    useEffect(() => {
        if (!message) return;
        setShow(true);
        const id = setTimeout(() => setShow(false), 3000);
        return () => clearTimeout(id);
    }, [message]);

    if (!show) return null;

    const getIcon = () => {
        switch (type) {
            case "success":
                return (
                    <Check
                        className="w-5 h-5"
                        style={{ color: "var(--theme-secondary)" }}
                    />
                );
            case "error":
                return (
                    <X
                        className="w-5 h-5"
                        style={{ color: "var(--theme-error)" }}
                    />
                );
            case "info":
                return (
                    <Info
                        className="w-5 h-5"
                        style={{ color: "var(--theme-primary)" }}
                    />
                );
            default:
                return (
                    <Check
                        className="w-5 h-5"
                        style={{ color: "var(--theme-secondary)" }}
                    />
                );
        }
    };

    const getBgColor = () => {
        return {
            backgroundColor: "var(--theme-surface)",
            borderColor: "var(--theme-border)",
        };
    };

    return (
        <div
            className="fixed bottom-4 right-4 max-w-xs w-auto border px-4 py-3 rounded-lg shadow-lg ring-1 ring-black/10 transform transition-all duration-300 ease-out animate-in slide-in-from-right-4"
            style={getBgColor()}
            role="status"
            aria-live="polite"
        >
            <div className="flex items-center gap-3">
                <div className="flex-shrink-0">{getIcon()}</div>
                <div
                    className="text-sm leading-tight"
                    style={{ color: "var(--theme-text)" }}
                >
                    {message}
                </div>
            </div>
        </div>
    );
}
