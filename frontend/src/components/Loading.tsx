import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-70 z-50">
            <div className="animate-spin">
                <Loader2 size={45} className="text-gray-500" />
            </div>
        </div>
    );
}
