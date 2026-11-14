import { defineConfig, devices } from "@playwright/test";
import { APP_PORT, AUTH_SECRET, BASE_URL, MOCK_PORT } from "./e2e/constants";

const appEnv: Record<string, string> = {
  AUTH_SECRET,
  KEYCLOAK_CLIENT_ID: "fgv-spexipedia",
  KEYCLOAK_CLIENT_SECRET: "e2e",
  KEYCLOAK_ISSUER: `http://localhost:${MOCK_PORT}/realms/fgv`,
  API_GRAPHQL_ENDPOINT: `http://localhost:${MOCK_PORT}/api/graphql`,
  // Set here too, or a developer's .env.local (which points it at the local stack) would win over the mock
  API_ENDPOINT: `http://localhost:${MOCK_PORT}`,
  BETTER_AUTH_URL: BASE_URL,
  SUPPORT_EMAIL: "support.spexipedia@example.org",
  FEEDBACK_EMAIL: "feedback.spexipedia@example.org",
  MEDIA_ORIGIN: `http://localhost:${MOCK_PORT}`,
  SPEXGRAM_MEDIA_ORIGIN: `http://localhost:${MOCK_PORT}`,
  UMAMI_URL: "",
  UMAMI_WEBSITE_ID: "",
  SUPPORTED_LOCALES: "sv,en",
  DEFAULT_LOCALE: "sv",
  SPEXREGISTER_WEB_URL: "",
  FGV_REVIVAL_WEB_URL: "",
  SPEXIFY_WEB_URL: "",
  SPEXFLIX_WEB_URL: "",
  SPEXGRAM_WEB_URL: "",
  SPEXIPEDIA_WEB_URL: "",
  ARCHIVE_WEB_URL: "",
};

/**
 * The tests run against a stand-in for Spexipedia Server and Keycloak (e2e/mock-backend.mjs), which answers with what
 * the real server answered visitors for the sample data (e2e/recorded.json). To record again, run the API locally with
 * sample data and `MOCK_RECORD_FROM=http://localhost:8088/api/graphql npm run test:e2e`.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }], ["junit", { outputFile: "test-results/e2e-results.xml" }]]
    : [["list"], ["html", { open: "never" }]],
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL: BASE_URL,
    locale: "sv-SE",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] }, testIgnore: /mobile\.spec\.ts/ },
    // Phones: the layout checks, in Chromium with a phone's screen, touch and user agent
    { name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /mobile\.spec\.ts/ },
  ],
  webServer: [
    {
      command: "node e2e/mock-backend.mjs",
      port: MOCK_PORT,
      env: { MOCK_PORT: String(MOCK_PORT), MOCK_RECORD_FROM: process.env.MOCK_RECORD_FROM ?? "" },
      reuseExistingServer: !process.env.CI,
      stdout: "pipe",
    },
    {
      command: `next build && next start -p ${APP_PORT}`,
      port: APP_PORT,
      env: { ...appEnv, PORT: String(APP_PORT) },
      timeout: 240_000,
      reuseExistingServer: !process.env.CI,
      stdout: "pipe",
    },
  ],
});
