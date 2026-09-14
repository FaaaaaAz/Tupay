import { expect, test } from "@playwright/test";
import { empezarPartido, GOL_DESDE_EL_SAQUE, tapitaDe, tirar } from "./ayudantes.js";

test("una Eliminatoria a un gol termina en la pantalla de resultado", async ({ page }) => {
  const partida = await empezarPartido(page, {
    estadio: GOL_DESDE_EL_SAQUE.estadio,
    golesParaGanar: 1,
    opciones: { semilla: GOL_DESDE_EL_SAQUE.semilla },
  });
  expect(partida.golesParaGanar).toBe(1);

  const { eventos } = await tirar(page, tapitaDe(partida, GOL_DESDE_EL_SAQUE.tapita), GOL_DESDE_EL_SAQUE.direccion, 1);
  expect(eventos).toContainEqual({ tipo: "gol", lado: "visitante" });
  expect(eventos.at(-1)?.tipo).toBe("finDelPartido");

  await expect(page.getByTestId("resultado")).toHaveText("¡Ganó The Strongest!", { timeout: 15_000 });
  await expect(page.getByText("0 – 1")).toBeVisible();
  await expect(page.getByRole("button", { name: "Revancha" })).toBeVisible();
});

test("un partido de Liga termina por tiempo y puede quedar empatado", async ({ page }) => {
  await empezarPartido(page, { modo: "Liga", opciones: { duracionRealSegundos: 3 } });

  await expect(page.getByTestId("resultado")).toHaveText("¡Empate!", { timeout: 15_000 });
  await expect(page.getByText("0 – 0")).toBeVisible();
});
