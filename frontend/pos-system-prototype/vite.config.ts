import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\/api\/.*/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
            },
          },
        ],
      },
      manifest: {
        short_name: "JamboPOS",
        name: "Jambo POS System",
        icons: [
          {
            src: "/logo192.svg",
            sizes: "192x192",
            type: "image/svg+xml",
          },
          {
            src: "/logo512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
          },
        ],
        start_url: ".",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#4f46e5",
        orientation: "portrait-primary",
        scope: ".",
        description: "A modern point-of-sale system for retail.",
        categories: ["business", "productivity", "shopping"],
        shortcuts: [
          {
            name: "New Sale",
            short_name: "Sale",
            description: "Start a new sale transaction",
            url: "/sales",
            icons: [{ src: "/logo192.svg", sizes: "192x192" }],
          },
          {
            name: "Products",
            short_name: "Products",
            description: "Manage your products",
            url: "/products",
            icons: [{ src: "/logo192.svg", sizes: "192x192" }],
          },
        ],
      },
      includeAssets: [
        "favicon.svg",
        "logo192.svg",
        "logo512.svg",
        "apple-touch-icon.png",
      ],
      devOptions: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
});
