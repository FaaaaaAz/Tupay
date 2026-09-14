import { expect, test } from "@playwright/test";
import type { Equipo, Estadio } from "../compartido/catalogo.js";
import { abrirMenu, elegirEnElMenu, empezarPartido, esPedido } from "./ayudantes.js";

test("la configuración muestra exactamente los equipos y estadios que manda el servidor", async ({ page }) => {
  // El catálogo se pide al cargar la aplicación: hay que escuchar antes de abrirla.
  const pedidoDeEquipos = page.waitForResponse(esPedido("GET", "/api/equipos"));
  const pedidoDeEstadios = page.waitForResponse(esPedido("GET", "/api/estadios"));
  await abrirMenu(page);
  const equipos: Equipo[] = await (await pedidoDeEquipos).json();
  const estadios: Estadio[] = await (await pedidoDeEstadios).json();

  await elegirEnElMenu(page, "Eliminatoria");

  await expect(page.getByLabel("Tu equipo").locator("option")).toHaveText(equipos.map((equipo) => equipo.nombre));
  await expect(page.getByLabel("Estadio").locator("option")).toHaveText([
    /^El del equipo local/,
    ...estadios.map((estadio) => `${estadio.nombre} · ${estadio.ciudad}`),
  ]);
});

const MODOS = [
  { modo: "Eliminatoria", enElContrato: "eliminatoria", detalle: /^Gana quien llegue a 3$/ },
  { modo: "Liga", enElContrato: "liga", detalle: /^Minuto \d+'$/ },
] as const;

for (const { modo, enElContrato, detalle } of MODOS) {
  test(`se crea un partido de ${modo} contra el servidor y se ve la cancha completa`, async ({ page }) => {
    const partida = await empezarPartido(page, { modo, jugadores: 1 });

    expect(partida.modo).toBe(enElContrato);
    expect(partida.visitante.tipo).toBe("servidor");
    await expect(page.locator('[data-testid^="tapita-"]')).toHaveCount(10);
    await expect(page.getByTestId("marcador")).toHaveText("0 – 0");
    await expect(page.getByText(detalle)).toBeVisible();
    await expect(page.getByText("Servidor · tiros de poder: 2")).toBeVisible();
  });
}
