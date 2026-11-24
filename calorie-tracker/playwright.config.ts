import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  workers: 1,
  fullyParallel: false,
  use: { baseURL: "http://localhost:3100", ...devices["iPhone 14"], browserName: "chromium" },
  webServer: {
    command: "rm -f data/e2e.db* && npm run build && npx next start -p 3100",
    url: "http://localhost:3100/onboarding",
    reuseExistingServer: false,
    timeout: 240_000,
    env: { DATABASE_PATH: "data/e2e.db", AI_MOCK: "1", NEXT_DIST_DIR: ".next-e2e" },
  },
});
