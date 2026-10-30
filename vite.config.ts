import { defineConfig } from "vite";

export default defineConfig({
  // Relative assets support GitHub Pages (/Sekampfire/) and future Capacitor file origins.
  base: "./",
  build: { outDir: "dist", sourcemap: false },
});
