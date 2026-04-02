import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  webServer: {
    command: "pnpm exec vite --port 5199",
    port: 5199,
    reuseExistingServer: true,
  },
  use: {
    baseURL: "http://localhost:5199/newtab.html",
    viewport: { width: 1280, height: 720 },
  },
});
