import { defineConfig, devices } from "@playwright/test";

/**
 * E2E sobre el build de producción (vite preview). Las llamadas a /api y al
 * geocoding se simulan en cada test: no dependen del clima real ni de Internet.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 7_000 },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:4173",
    locale: "es-AR",
    // Distinta a la de la ciudad: las horas deben seguir siendo las de Buenos Aires.
    timezoneId: "Europe/Madrid",
    // page.route no intercepta pedidos hechos por service workers.
    serviceWorkers: "block",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npx vite build && npx vite preview --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: { VITE_API_URL: "" },
  },
});
