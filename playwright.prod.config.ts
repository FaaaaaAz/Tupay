import { defineConfig, devices } from "@playwright/test";

// Las mismas pruebas, pero contra la aplicación ya publicada. No levanta ningún
// servidor: la URL llega por variable de entorno (`URL_PRODUCCION` en GitHub).
const URL_PRODUCCION = process.env.URL_PRODUCCION;

if (!URL_PRODUCCION) {
  throw new Error(
    "Falta la variable de entorno URL_PRODUCCION (por ejemplo https://tupay.onrender.com)",
  );
}

// El plan gratuito de Render duerme el servicio tras 15 minutos sin visitas y
// despertarlo tarda casi un minuto: por eso los tiempos de espera son largos.
const ESPERA_ARRANQUE_EN_FRIO = 90_000;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 1,
  timeout: ESPERA_ARRANQUE_EN_FRIO,
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  use: {
    baseURL: URL_PRODUCCION,
    navigationTimeout: ESPERA_ARRANQUE_EN_FRIO,
    actionTimeout: 30_000,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "chrome",
      use: { ...devices["Desktop Chrome"], channel: "chrome", headless: false },
    },
  ],
});
