import { expect, test } from "@playwright/test";
import type { Partida } from "../compartido/partida.js";
import type { Temporada } from "../compartido/temporada.js";

const CUATRO_EQUIPOS = ["bolivar", "theStrongest", "aurora", "wilstermann"];

test("una temporada simula los partidos sin personas y actualiza la tabla", async ({ request }) => {
  const creada = await request.post("/api/temporadas", {
    data: { equipos: CUATRO_EQUIPOS, humanos: ["bolivar"], duracionRealSegundos: 1, perroActivo: false, semilla: 5 },
  });
  expect(creada.status()).toBe(201);
  const temporada: Temporada = await creada.json();
  expect(temporada.partidos).toHaveLength(6);
  expect(temporada.totalDeJornadas).toBe(3);

  const [proximo] = temporada.proximosPartidos;
  const jugada = await request.post(`/api/temporadas/${temporada.id}/partidos/${proximo}/jugar`, { data: {} });
  expect(jugada.ok()).toBeTruthy();
  const { partida }: { partida: Partida } = await jugada.json();
  expect(partida.modo).toBe("liga");

  // El partido de Liga dura un segundo real: después de eso la temporada lo anota al consultarla.
  await new Promise((resolver) => setTimeout(resolver, 1200));
  const despues: Temporada = await (await request.get(`/api/temporadas/${temporada.id}`)).json();

  expect(despues.partidos.find((partido) => partido.id === proximo)?.estado).toBe("jugado");
  expect(despues.jornadaActual).toBe(2);
  expect(despues.tabla.map((fila) => fila.jugados)).toEqual([1, 1, 1, 1]);
});

test("no se puede adelantar un partido de otra jornada", async ({ request }) => {
  const temporada: Temporada = await (
    await request.post("/api/temporadas", { data: { equipos: CUATRO_EQUIPOS, humanos: ["bolivar"], semilla: 5 } })
  ).json();
  const posterior = temporada.partidos.find(
    (partido) => partido.jornada === 2 && (partido.local === "bolivar" || partido.visitante === "bolivar"),
  );

  const respuesta = await request.post(`/api/temporadas/${temporada.id}/partidos/${posterior?.id}/jugar`, {
    data: {},
  });

  expect(respuesta.status()).toBe(400);
  expect(await respuesta.json()).toEqual({ error: "Primero hay que terminar la jornada 1" });
});

test("se juega un partido de la temporada desde el navegador y la tabla se actualiza", async ({ page }) => {
  // Temporada corta para la prueba: cuatro equipos y partidos de tres segundos.
  await page.route("**/api/temporadas", async (ruta) => {
    if (ruta.request().method() !== "POST") return ruta.continue();
    const cuerpo = JSON.parse(ruta.request().postData() ?? "{}");
    await ruta.continue({
      postData: JSON.stringify({ ...cuerpo, equipos: CUATRO_EQUIPOS, duracionRealSegundos: 3, perroActivo: false }),
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Iniciar" }).click();
  await page.getByRole("button", { name: /Temporada/ }).click();
  await page.getByRole("button", { name: "Empezar temporada" }).click();

  await expect(page.getByTestId("jornada")).toHaveText("Jornada 1 de 3");
  await expect(page.getByTestId("fila-tabla")).toHaveCount(4);

  await page.getByRole("button", { name: "Jugar partido" }).click();
  await expect(page.getByTestId("cancha")).toBeVisible();
  await expect(page.getByTestId("resultado")).toBeVisible({ timeout: 20_000 });

  await page.getByRole("button", { name: "Volver a la temporada" }).click();
  await expect(page.getByTestId("jornada")).toHaveText("Jornada 2 de 3");
  await expect(page.locator('[data-testid="fila-tabla"] [data-columna="jugados"]')).toHaveText(["1", "1", "1", "1"]);
});
