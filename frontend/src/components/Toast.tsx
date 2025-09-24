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
                return <Check className="w-5 h-5 text-green-600" />;
            case "error":
                return <X className="w-5 h-5 text-red-600" />;
            case "info":
                return <Info className="w-5 h-5 text-blue-600" />;
            default:
                return <Check className="w-5 h-5 text-green-600" />;
        }
    };

    const getBgColor = () => {
        switch (type) {
            case "success":
                return "bg-green-50 border-green-200";
            case "error":
                return "bg-red-50 border-red-200";
            case "info":
                return "bg-blue-50 border-blue-200";
            default:
                return "bg-green-50 border-green-200";
        }
    };

    return (
        <div
            className={`fixed bottom-4 right-4 max-w-xs w-auto ${getBgColor()} border px-4 py-3 rounded-lg shadow-lg ring-1 ring-black/10 transform transition-all duration-300 ease-out animate-in slide-in-from-right-4`}
            role="status"
            aria-live="polite"
        >
            <div className="flex items-center gap-3">
                <div className="flex-shrink-0">{getIcon()}</div>
                <div className="text-sm leading-tight text-gray-800">
                    {message}
                </div>
            </div>
        </div>
    );
}
