import { defineConfig, devices } from "@playwright/test";

// Se usa un puerto distinto al de desarrollo para que las pruebas nunca choquen
// con un `npm run dev` abierto en otra terminal.
const PUERTO = 4173;
const URL_BASE = `http://localhost:${PUERTO}`;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  // En CI, un `test.only` olvidado debe hacer fallar la ejecución, no reducirla en silencio.
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  use: {
    baseURL: URL_BASE,
    trace: "on-first-retry",
  },
  projects: [
    // Para GitHub Actions: sin ventana.
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // Para la defensa: Google Chrome de verdad, con ventana visible.
    {
      name: "chrome",
      use: { ...devices["Desktop Chrome"], channel: "chrome", headless: false },
    },
  ],
  // Playwright compila y levanta la aplicación igual que en producción:
  // un solo Express sirviendo el cliente y la API.
  webServer: {
    command: "npm run build && npm start",
    url: `${URL_BASE}/api/salud`,
    env: { PORT: String(PUERTO) },
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
