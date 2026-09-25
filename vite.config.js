import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            "/faa-tfr-api": {
                target: "https://tfr.faa.gov",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/faa-tfr-api/, ""),
                secure: false,
            },
        },
    },
});
