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
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log(`[proxyMan] ${req.method} ${req.url}`);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log(`[proxyRes] ${req.method} ${req.url} -> ${proxyRes.statusCode}`);
          });
          proxy.on('error', (err, req, res) => {
            console.error(`[proxyError] ${req.method} ${req.url}`, err);
          });

      }},

  
      '/rt': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            const targetUrl = new URL(req.url, options.target);
            console.log(`[Proxy] → ${req.method} ${targetUrl.href}`);
          });

          proxy.on('proxyRes', (proxyRes, req, res) => {
            const targetUrl = new URL(req.url, options.target);
            console.log(
              `[Proxy Response] ← ${req.method} ${targetUrl.href} → ${proxyRes.statusCode}`
            );
          });

          proxy.on('error', (err, req, res) => {
            console.error(`[Proxy Error] ${req.method} ${req.url}:`, err.message);
          });
        },
      },
    
  

    
      "/parse": {
        target: "http://localhost:8001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
