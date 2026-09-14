import { expect, test } from "@playwright/test";
import type { Partida } from "../compartido/partida.js";
import { empezarPartido } from "./ayudantes.js";

const PARTIDA_BASE = {
  modo: "eliminatoria",
  local: { equipo: "bolivar", tipo: "humano" },
  visitante: { equipo: "theStrongest", tipo: "humano" },
  perroActivo: false,
};

test("cada estadio trae sus charcos desde el servidor", async ({ request }) => {
  const crearEn = async (estadio: string): Promise<Partida> =>
    (await request.post("/api/partidas", { data: { ...PARTIDA_BASE, estadio } })).json();

  const enElAlto = await crearEn("villaIngenio");
  expect(enElAlto.charcos.length).toBeGreaterThan(0);
  expect(enElAlto.charcos.every((charco) => charco.tipo === "nieve")).toBe(true);

  expect((await crearEn("felixCapriles")).charcos).toEqual([]);
});

test("un emote se acepta y el siguiente tiene que esperar", async ({ request }) => {
  const partida: Partida = await (await request.post("/api/partidas", { data: PARTIDA_BASE })).json();

  const primero = await request.post(`/api/partidas/${partida.id}/emotes`, {
    data: { lado: "local", emote: "felizEuforico" },
  });
  expect(primero.ok()).toBeTruthy();
  const { local }: Partida = await primero.json();
  expect(local.emote).toEqual({ id: "felizEuforico", segundosRestantes: 5 });
  expect(local.esperaEmote).toBe(15);

  const segundo = await request.post(`/api/partidas/${partida.id}/emotes`, {
    data: { lado: "local", emote: "llorando" },
  });
  expect(segundo.status()).toBe(400);
  expect(await segundo.json()).toEqual({ error: "Espera unos segundos para volver a usar un emote" });
});

test("en El Alto la cancha muestra los charcos de nieve", async ({ page }) => {
  await empezarPartido(page, { estadio: "villaIngenio" });

  await expect(page.locator('[data-testid^="charco-nieve-"]').first()).toBeVisible();
});

test("un emote pone la carita sobre las cinco tapitas y deshabilita la barra", async ({ page }) => {
  await empezarPartido(page, { estadio: "felixCapriles" });
  const barra = page.getByRole("group", { name: "Emotes de Bolívar" });

  await barra.getByRole("button", { name: "Feliz eufórico" }).click();

  await expect(page.locator('[data-testid^="emote-local-"]')).toHaveCount(5);
  await expect(page.locator('[data-testid^="emote-visitante-"]')).toHaveCount(0);
  await expect(barra.getByRole("button", { name: "Llorando" })).toBeDisabled();
  await expect(barra.getByTestId("espera-emote")).toBeVisible();
});
