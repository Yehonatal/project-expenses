import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()] as any,
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes("node_modules")) return;

                    if (
                        /node_modules\/(react-router-dom|react-router)\//.test(
                            id,
                        )
                    ) {
                        return "vendor-router";
                    }

                    if (/node_modules\/(react|react-dom)\//.test(id)) {
                        return "vendor-react";
                    }

                    if (id.includes("recharts")) {
                        return "vendor-charts";
                    }

                    if (id.includes("jspdf")) {
                        return "vendor-jspdf";
                    }

                    if (id.includes("html2canvas")) {
                        return "vendor-html2canvas";
                    }

                    if (id.includes("papaparse")) {
                        return "vendor-papaparse";
                    }

                    if (id.includes("lucide-react")) {
                        return "vendor-icons";
                    }

                    if (id.includes("framer-motion")) {
                        return "vendor-motion";
                    }

                    if (id.includes("axios")) {
                        return "vendor-network";
                    }

                    return "vendor-misc";
                },
            },
        },
    },
});
