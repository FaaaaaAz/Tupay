import { expect, test } from "@playwright/test";
import type { Partida } from "../compartido/partida.js";
import { aPantalla, abrirMenu, elegirEnElMenu, empezarPartido, esPedido, GOL_DESDE_EL_SAQUE, tapitaDe, tirar } from "./ayudantes.js";

test("pausa congela el tiempo real, aísla el foco y reanuda con Escape", async ({ page, request }) => {
  const partida = await empezarPartido(page, { modo: "Liga", opciones: { semilla: 12345, duracionRealSegundos: 60 } });
  const respuesta = page.waitForResponse(esPedido("POST", "/pausar"));
  await page.getByRole("button", { name: "Pausar" }).click();
  const pausada: Partida = await (await respuesta).json();
  const modal = page.getByRole("dialog", { name: "Partido en pausa" });
  await expect(modal).toBeVisible();
  await expect(modal.getByRole("button", { name: "Reanudar partido" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  expect(await modal.evaluate((elemento) => elemento.contains(document.activeElement))).toBe(true);
  // Se deja pasar tiempo real deliberadamente para demostrar que Express está congelado.
  await page.waitForTimeout(1300);
  const consultada = await (await request.get(`/api/partidas/${partida.id}`)).json();
  expect(consultada).toEqual(pausada);
  const reanudar = page.waitForResponse(esPedido("POST", "/reanudar"));
  await page.keyboard.press("Escape");
  expect((await (await reanudar).json()).pausada).toBe(false);
  await expect(modal).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Pausar" })).toBeFocused();
});

test("salir pide confirmación; cancelar conserva la partida y abandonar la descarta", async ({ page, request }) => {
  const partida = await empezarPartido(page);
  await page.getByRole("button", { name: "Salir", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "¿Abandonar el partido?" })).toContainText("volverás al menú");
  await page.getByRole("button", { name: "Seguir jugando" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  expect((await request.get(`/api/partidas/${partida.id}`)).ok()).toBe(true);
  await page.getByRole("button", { name: "Salir", exact: true }).click();
  await page.getByRole("button", { name: "Sí, abandonar" }).click();
  await expect(page.getByRole("button", { name: /^Eliminatoria/ })).toBeVisible();
  expect((await request.get(`/api/partidas/${partida.id}`)).status()).toBe(404);
});

test("el rodado y la jugada se congelan y continúan hasta el resultado confirmado", async ({ page }) => {
  const partida = await empezarPartido(page, { estadio: GOL_DESDE_EL_SAQUE.estadio, opciones: { semilla: GOL_DESDE_EL_SAQUE.semilla } });
  const respuesta = await tirar(page, tapitaDe(partida, GOL_DESDE_EL_SAQUE.tapita), GOL_DESDE_EL_SAQUE.direccion, 1);
  const pelota = page.getByTestId("pelota");
  await expect.poll(() => pelota.evaluate((el) => getComputedStyle(el).transform)).not.toBe("matrix(1, 0, 0, 1, 0, 0)");
  await page.getByRole("button", { name: "Pausar" }).click();
  await expect(page.getByRole("button", { name: "Reanudar partido" })).toBeEnabled();
  const cuadro = await pelota.evaluate((el) => ({ giro: getComputedStyle(el).transform, posicion: el.parentElement!.getAttribute("transform") }));
  await page.waitForTimeout(500);
  expect(await pelota.evaluate((el) => ({ giro: getComputedStyle(el).transform, posicion: el.parentElement!.getAttribute("transform") }))).toEqual(cuadro);
  await page.getByRole("button", { name: "Reanudar partido" }).click();
  await expect(page.getByTestId("marcador")).toHaveText(`${respuesta.partida.marcador.local} – ${respuesta.partida.marcador.visitante}`, { timeout: 15000 });
  await expect(page.getByTestId("tapita-local-1")).toHaveAttribute("transform", `translate(${respuesta.partida.tapitas[0].posicion.x} ${respuesta.partida.tapitas[0].posicion.y})`);
});

test("cancelar un arrastre y perder el foco no deja tiros pendientes", async ({ page }) => {
  const partida = await empezarPartido(page);
  let tiros = 0;
  page.on("request", (req) => { if (req.url().endsWith("/tiros")) tiros++; });
  const desde = await aPantalla(page, tapitaDe(partida, `${partida.turno.lado}-1`).posicion);
  await page.mouse.move(desde.x, desde.y);
  await page.mouse.down();
  await page.mouse.move(desde.x + 60, desde.y + 20);
  await expect(page.getByTestId("flecha")).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await page.mouse.up();
  await expect(page.getByTestId("flecha")).toHaveCount(0);
  expect(tiros).toBe(0);
  await page.mouse.move(desde.x, desde.y);
  await page.mouse.down();
  await page.mouse.move(desde.x + 60, desde.y + 20);
  await page.getByTestId("cancha").dispatchEvent("pointercancel");
  await page.mouse.up();
  await expect(page.getByTestId("flecha")).toHaveCount(0);
  expect(tiros).toBe(0);
  await tirar(page, tapitaDe(partida, `${partida.turno.lado}-1`), { x: 0, y: 1 }, 0.2);
  expect(tiros).toBe(1);
});

test("el poder seleccionado no pasa al siguiente turno ni reaparece al volver al anterior", async ({ page }) => {
  await empezarPartido(page, { opciones: { semilla: 12345, limiteTurnoSegundos: 2 } });
  const poder = page.getByRole("button", { name: "Tiro de poder (2)" });
  await poder.click();
  await expect(poder).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("turno")).toContainText("Bolívar", { timeout: 6000 });
  await expect(poder).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByTestId("turno")).toContainText("The Strongest", { timeout: 6000 });
  await expect(poder).toHaveAttribute("aria-pressed", "false");
});

test("abandonar desde la temporada avisa del destino y conserva la jornada pendiente", async ({ page }) => {
  await abrirMenu(page);
  await elegirEnElMenu(page, "Temporada");
  await page.getByRole("button", { name: "Empezar temporada" }).click();
  await expect(page.getByTestId("jornada")).toHaveText("Jornada 1 de 9");
  await page.getByRole("button", { name: "Jugar partido" }).click();
  await page.getByRole("button", { name: "Salir", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("volver a jugarlo desde la temporada");
  await page.getByRole("button", { name: "Sí, abandonar" }).click();
  await expect(page.getByTestId("jornada")).toHaveText("Jornada 1 de 9");
  await expect(page.getByRole("button", { name: "Jugar partido" })).toBeEnabled();
});

test("una creación en curso bloquea envíos repetidos y volver", async ({ page }) => {
  let liberar!: () => void;
  const espera = new Promise<void>((resolve) => { liberar = resolve; });
  let pedidos = 0;
  await page.route("**/api/partidas", async (ruta) => {
    if (ruta.request().method() !== "POST") return ruta.continue();
    pedidos++;
    await espera;
    await ruta.continue();
  });
  await abrirMenu(page);
  await elegirEnElMenu(page, "Eliminatoria");
  await page.getByRole("button", { name: "Jugar", exact: true }).click();
  await expect(page.getByRole("button", { name: "Preparando la cancha…" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "← Volver" })).toBeDisabled();
  await page.locator("form").evaluate((form) => { form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); });
  await expect.poll(() => pedidos).toBe(1);
  liberar();
  await expect(page.getByTestId("cancha")).toBeVisible();
  expect(pedidos).toBe(1);
});

test("la partida inexistente muestra un modal con una salida funcional", async ({ page }) => {
  await empezarPartido(page);
  await page.route("**/pausar", (ruta) => ruta.fulfill({ status: 404, json: { error: "Esa partida no existe" } }));
  await page.getByRole("button", { name: "Pausar" }).click();
  await expect(page.getByRole("dialog", { name: "Esta partida ya no existe" })).toBeVisible();
  await page.getByRole("button", { name: "Ir al menú" }).click();
  await expect(page.getByRole("button", { name: /^Eliminatoria/ })).toBeVisible();
});

test("movimiento reducido desactiva el giro decorativo del balón", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const partida = await empezarPartido(page, { estadio: GOL_DESDE_EL_SAQUE.estadio, opciones: { semilla: GOL_DESDE_EL_SAQUE.semilla } });
  await tirar(page, tapitaDe(partida, GOL_DESDE_EL_SAQUE.tapita), GOL_DESDE_EL_SAQUE.direccion, 1);
  await expect(page.getByTestId("pelota")).toHaveCSS("transform", "none");
});

test("los controles y modales caben en pantallas de escritorio", async ({ page }, info) => {
  await empezarPartido(page);
  for (const [width, height] of [[1280, 720], [1366, 768], [1920, 1080]]) {
    await page.setViewportSize({ width, height });
    await page.screenshot({ path: info.outputPath(`cancha-${width}.jpg`), type: "jpeg", quality: 85 });
    await page.getByRole("button", { name: "Pausar" }).click();
    const modal = page.getByRole("dialog", { name: "Partido en pausa" });
    await expect(modal.getByRole("button", { name: "Reanudar partido" })).toBeEnabled();
    await expect(modal).toBeInViewport({ ratio: 1 });
    await page.screenshot({ path: info.outputPath(`pausa-${width}.jpg`), type: "jpeg", quality: 85 });
    await modal.getByRole("button", { name: "Salir del partido" }).click();
    await expect(page.getByRole("dialog", { name: "¿Abandonar el partido?" })).toBeInViewport({ ratio: 1 });
    await page.screenshot({ path: info.outputPath(`salida-${width}.jpg`), type: "jpeg", quality: 85 });
    await page.getByRole("button", { name: "Seguir jugando" }).click();
    await page.getByRole("button", { name: "Reanudar partido" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test("el rival espera durante la pausa y juega una sola vez al reanudar", async ({ page }) => {
  let tirosDelRival = 0;
  page.on("request", (req) => { if (req.url().endsWith("/turno-rival")) tirosDelRival++; });
  await empezarPartido(page, { jugadores: 1, opciones: { semilla: 12345 } });
  await page.getByRole("button", { name: "Pausar" }).click();
  await expect(page.getByRole("button", { name: "Reanudar partido" })).toBeEnabled();
  await page.waitForTimeout(1000);
  expect(tirosDelRival).toBe(0);
  const respuesta = page.waitForResponse(esPedido("POST", "/turno-rival"));
  await page.getByRole("button", { name: "Reanudar partido" }).click();
  expect((await respuesta).ok()).toBe(true);
  expect(tirosDelRival).toBe(1);
});

test("un error de red al reanudar mantiene el modal y permite reintentar", async ({ page }) => {
  await empezarPartido(page);
  await page.getByRole("button", { name: "Pausar" }).click();
  await page.route("**/reanudar", (ruta) => ruta.abort(), { times: 1 });
  await page.getByRole("button", { name: "Reanudar partido" }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText("No se pudo conectar");
  await page.getByRole("button", { name: "Reanudar partido" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("la portada se precarga con prioridad y las imágenes versionadas se cachean", async ({ page, request }) => {
  const html = await (await request.get("/")).text();
  expect(html).toMatch(/rel="preload" as="image" href="\/assets\/inicio-[^"]+\.webp" fetchpriority="high"/);
  const url = html.match(/href="(\/assets\/inicio-[^"]+\.webp)"/)![1];
  const respuesta = await request.get(url);
  expect(respuesta.headers()["cache-control"]).toContain("immutable");
  await page.goto("/");
  await expect.poll(() => page.evaluate(() => performance.getEntriesByType("resource")
    .filter((r) => r.name.includes("/inicio-")).length)).toBe(1);
});
