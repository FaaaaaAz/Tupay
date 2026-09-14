import { expect, test } from "@playwright/test";
import { empezarPartido, esPedido, GOL_DESDE_EL_SAQUE, tapitaDe, tirar } from "./ayudantes.js";

// Recorrido corto para mostrar en la defensa con Chrome visible, contra la URL pública:
//   npm run test:e2e:defensa
// En menos de 30 segundos muestra el inicio, pedidos reales a Express y un partido completo.

test("recorrido de defensa: inicio, API real, emote y un gol que termina el partido", { tag: "@defensa" }, async ({ page }) => {
  const partida = await empezarPartido(page, {
    estadio: GOL_DESDE_EL_SAQUE.estadio,
    golesParaGanar: 1,
    opciones: { semilla: GOL_DESDE_EL_SAQUE.semilla },
  });
  await expect(page.locator('[data-testid^="tapita-"]')).toHaveCount(10);

  const emote = page.waitForResponse(esPedido("POST", "/emotes"));
  await page.getByRole("group", { name: "Emotes de The Strongest" }).getByRole("button", { name: "Feliz eufórico" }).click();
  expect((await emote).ok()).toBeTruthy();
  await expect(page.locator('[data-testid^="emote-visitante-"]')).toHaveCount(5);

  await tirar(page, tapitaDe(partida, GOL_DESDE_EL_SAQUE.tapita), GOL_DESDE_EL_SAQUE.direccion, 1);
  await expect(page.getByTestId("mensaje")).toContainText("¡Gol de The Strongest!", { timeout: 15_000 });
  await expect(page.getByTestId("resultado")).toHaveText("¡Ganó The Strongest!", { timeout: 15_000 });
});
