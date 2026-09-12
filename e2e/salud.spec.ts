import { expect, test } from "@playwright/test";

test("la aplicación carga y muestra la respuesta de Express", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Tupay" })).toBeVisible();
  await expect(page.getByTestId("estado-servidor")).toContainText("Express responde");
});

test("la API de salud responde JSON", async ({ request }) => {
  const respuesta = await request.get("/api/salud");

  expect(respuesta.ok()).toBeTruthy();
  expect(await respuesta.json()).toMatchObject({ estado: "ok", juego: "Tupay" });
});

test("una ruta de API inexistente responde 404 en JSON", async ({ request }) => {
  const respuesta = await request.get("/api/no-existe");

  expect(respuesta.status()).toBe(404);
  expect(await respuesta.json()).toHaveProperty("error");
});
