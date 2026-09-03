import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/browser", timeout: 45000, retries: 0, workers: 1,
  use: { baseURL: "http://localhost:3100", screenshot: "only-on-failure", trace: "retain-on-failure" },
  webServer: { command: "node node_modules/next/dist/bin/next dev -p 3100", env: { ODE_QA_MODE: "true", NEXT_PUBLIC_CLERK_ENABLED: "false", ODE_ISOLATED_BUILD: "true" }, url: "http://localhost:3100/qa/hamper", reuseExistingServer: !process.env.CI, timeout: 120000 },
  projects: [
    { name: "chromium", testMatch: "hamper.spec.ts", use: { browserName: "chromium" } },
    { name: "chrome", testMatch: "smoke.spec.ts", use: { browserName: "chromium", channel: "chrome", hasTouch: true, launchOptions: { args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"] } } },
    { name: "edge", testMatch: "smoke.spec.ts", use: { browserName: "chromium", channel: "msedge", hasTouch: true, launchOptions: { args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"] } } },
    { name: "webkit", testMatch: "smoke.spec.ts", use: { browserName: "webkit", hasTouch: true, isMobile: true } },
  ],
});
