import { expect, test, type Page } from "@playwright/test";
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

  // Los carruseles recorren todo el catálogo en orden alfabético, empezando por Bolívar y su estadio.
  expect(await recorrerCarrusel(page, "Tu equipo", equipos.length)).toEqual(
    enOrdenDesde(equipos.map((equipo) => equipo.nombre), "Bolívar"),
  );
  expect(await recorrerCarrusel(page, "Estadio", estadios.length)).toEqual(
    enOrdenDesde(estadios.map((estadio) => estadio.nombre), "Hernando Siles"),
  );
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

/** Lee la opción visible de un carrusel y avanza, tantas veces como opciones tiene. */
async function recorrerCarrusel(page: Page, etiqueta: string, cantidad: number): Promise<string[]> {
  const carrusel = page.getByRole("group", { name: etiqueta, exact: true });
  const nombres: string[] = [];
  for (let vuelta = 0; vuelta < cantidad; vuelta++) {
    nombres.push((await carrusel.getByTestId("carrusel-valor").textContent()) ?? "");
    await carrusel.getByRole("button", { name: "Siguiente" }).click();
  }
  return nombres;
}

/** La lista en orden alfabético, rotada para empezar por `primero`. */
function enOrdenDesde(nombres: string[], primero: string): string[] {
  const ordenados = [...nombres].sort((a, b) => a.localeCompare(b, "es"));
  const inicio = ordenados.indexOf(primero);
  return [...ordenados.slice(inicio), ...ordenados.slice(0, inicio)];
}
