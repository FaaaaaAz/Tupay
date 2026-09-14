import { expect, test } from "@playwright/test";
import { abrirMenu, elegirEnElMenu, esPedido } from "./ayudantes.js";

test("elegir dos veces el mismo equipo muestra el mensaje que respondió Express", async ({ page }) => {
  await abrirMenu(page);
  await elegirEnElMenu(page, "Eliminatoria");
  await page.getByLabel("Rival").selectOption("bolivar");

  const creacion = page.waitForResponse(esPedido("POST", "/api/partidas"));
  await page.getByRole("button", { name: "Jugar" }).click();
  const respuesta = await creacion;

  // El navegador no revisa los equipos: el rechazo y el texto vienen del servidor.
  expect(respuesta.status()).toBe(400);
  const { error } = await respuesta.json();
  expect(error).toBe("Elijan equipos distintos: todavía no hay camisetas alternativas");
  await expect(page.getByRole("alert")).toHaveText(error);
  await expect(page.getByTestId("cancha")).toHaveCount(0);
});
