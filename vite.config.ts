import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { copyFileSync, mkdirSync } from "fs";

export default defineConfig({
  root: "src",
  base: "./",
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        newtab: resolve(__dirname, "src/newtab.html"),
        app: resolve(__dirname, "src/app.html"),
      },
    },
  },
  plugins: [
    react(),
    {
      name: "copy-extension-assets",
      closeBundle() {
        const distDir = resolve(__dirname, "dist");
        const iconsDir = resolve(distDir, "icons");
        mkdirSync(iconsDir, { recursive: true });
        copyFileSync(
          resolve(__dirname, "src/manifest.json"),
          resolve(distDir, "manifest.json")
        );
        copyFileSync(
          resolve(__dirname, "src/icons/icon128.png"),
          resolve(iconsDir, "icon128.png")
        );
      },
    },
  ],
});
