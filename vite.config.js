import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Include global styles if needed
        // additionalData: `@import "@/styles/scss/_index.scss";`
      },
    },
  },
  build: {
    outDir: "dist",
  },
  server: {
    host: "localhost",
    port: 3000,
  },
});
