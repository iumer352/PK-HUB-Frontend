import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000", // The actual backend URL
        changeOrigin: true,
        secure: false,
      },
      "/api1": {
        target: "http://localhost:5001",
        changeOrigin: true,
        secure: false,
      },

    },
  },
});
