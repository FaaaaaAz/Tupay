import { expect, test } from "@playwright/test";
import { aPantalla, empezarPartido, GOL_DESDE_EL_SAQUE, tapitaDe, tirar } from "./ayudantes.js";
import { observarAudio, vecesSonido } from "./observarAudio.js";

test("tiro y gol confirmados suenan una vez; pausa conserva música y no repite eventos", async ({ page }, info) => {
  const errores: string[] = [];
  page.on("pageerror", (error) => errores.push(error.message));
  await observarAudio(page);
  const partida = await empezarPartido(page, { estadio: "felixCapriles", opciones: { semilla: 12345 } });
  await expect.poll(() => vecesSonido(page, "competicion")).toBe(1);
  await page.getByRole("button", { name: "Tiro de poder (2)" }).click();
  await expect.poll(() => vecesSonido(page, "poder")).toBe(1);
  await page.getByRole("button", { name: "Tiro de poder (2)" }).click();
  const tapita = tapitaDe(partida, "visitante-4");
  const desde = await aPantalla(page, tapita.posicion);
  const hasta = await aPantalla(page, { x: tapita.posicion.x + 120, y: tapita.posicion.y });
  await page.mouse.move(desde.x, desde.y); await page.mouse.down();
  await page.mouse.move(hasta.x, hasta.y, { steps: 20 });
  await expect.poll(() => vecesSonido(page, "resortera")).toBe(1);
  await page.getByTestId("cancha").dispatchEvent("pointercancel"); await page.mouse.up();
  expect(await vecesSonido(page, "patear")).toBe(0);
  await tirar(page, tapita, GOL_DESDE_EL_SAQUE.direccion, 1);
  // Suena cuando la tapita toca la pelota, durante la animación.
  await expect.poll(() => vecesSonido(page, "patear")).toBeGreaterThanOrEqual(1);
  const pitidos = await vecesSonido(page, "pitido");
  await page.getByRole("button", { name: "Pausar" }).click();
  await expect(page.getByRole("button", { name: "Reanudar partido" })).toBeEnabled();
  // El árbitro toca el silbato una sola vez; confirmar la pausa en Express no lo corta ni lo repite.
  await expect.poll(() => vecesSonido(page, "pitido")).toBe(pitidos + 1);
  // Lo único que suena en pausa es el silbato (unos 3,4 s): después no queda ningún efecto activo.
  await expect.poll(() => page.evaluate(() => window.audioPrueba.activos), { timeout: 8000 }).toBe(0);
  expect(await vecesSonido(page, "pitido")).toBe(pitidos + 1);
  await page.getByRole("button", { name: "Reanudar partido" }).click();
  await expect.poll(() => vecesSonido(page, "competicion")).toBe(2);
  const offset = await page.evaluate(() => window.audioPrueba.eventos.filter((evento) => evento.url.includes("/competicion-")).at(-1)!.offset);
  expect(offset).toBeGreaterThan(0);
  await expect(page.getByTestId("marcador")).toHaveText("0 – 1", { timeout: 15000 });
  await expect.poll(() => vecesSonido(page, "gol-arcade")).toBe(1);
  const pateos = await vecesSonido(page, "patear");
  await page.getByRole("button", { name: "Pausar" }).click();
  await page.getByRole("button", { name: "Reanudar partido" }).click();
  expect(await vecesSonido(page, "patear")).toBe(pateos);
  expect(await vecesSonido(page, "gol-arcade")).toBe(1);
  await info.attach("eventos-de-audio", { body: JSON.stringify(await page.evaluate(() => window.audioPrueba), null, 2), contentType: "application/json" });
  expect(errores).toEqual([]);
});

test("perro ladra cuando entra y no vuelve a ladrar al reanudar", async ({ page }) => {
  await observarAudio(page);
  const partida = await empezarPartido(page, { estadio: "felixCapriles", perro: true, opciones: { semilla: 1, probabilidadPerro: 1 } });
  // Activar la casilla del perro en la configuración ya ladra una vez.
  await expect.poll(() => vecesSonido(page, "ladrido")).toBe(1);
  // El ladrido tiene un intervalo mínimo de 2 s: sin esta espera, el de la cancha podría descartarse.
  await page.waitForTimeout(2100);
  await tirar(page, tapitaDe(partida, `${partida.turno.lado}-1`), { x: 0, y: 1 }, 0.2);
  await expect(page.getByTestId("perro")).toBeVisible({ timeout: 15000 });
  await expect.poll(() => vecesSonido(page, "ladrido")).toBe(2);
  await page.getByRole("button", { name: "Pausar" }).click();
  await page.getByRole("button", { name: "Reanudar partido" }).click();
  await expect(page.getByTestId("perro")).not.toBeVisible({ timeout: 15000 });
  expect(await vecesSonido(page, "ladrido")).toBe(2);
});

test("salir suena al abrir su modal, con su propio árbitro, y volver a la pausa no lo repite", async ({ page }) => {
  await observarAudio(page);
  await empezarPartido(page);
  await page.getByRole("button", { name: "Salir", exact: true }).click();
  const salida = page.getByRole("dialog", { name: "¿Abandonar el partido?" });
  await expect(salida.locator("img")).toHaveAttribute("src", /\/salir-/);
  await expect.poll(() => vecesSonido(page, "salir")).toBe(1);
  await salida.getByRole("button", { name: "Seguir jugando" }).click();

  await page.getByRole("button", { name: "Pausar" }).click();
  const pausa = page.getByRole("dialog", { name: "Partido en pausa" });
  await expect(pausa.locator("img")).toHaveAttribute("src", /\/pausa-/);
  await expect(pausa.getByRole("button", { name: "Reanudar partido" })).toBeEnabled();
  await pausa.getByRole("button", { name: "Salir del partido" }).click();
  await expect(salida.locator("img")).toHaveAttribute("src", /\/salir-/);
  await expect.poll(() => vecesSonido(page, "salir")).toBe(2);
  // «Seguir jugando» devuelve a la pausa desde la que se salió: ese regreso no suena.
  await salida.getByRole("button", { name: "Seguir jugando" }).click();
  await expect(pausa.locator("img")).toHaveAttribute("src", /\/pausa-/);
  expect(await vecesSonido(page, "salir")).toBe(2);
});

test("resultado reproduce un solo jingle y la revancha cambia a una única música de partido", async ({ page }) => {
  await observarAudio(page);
  const partida = await empezarPartido(page, { estadio: "felixCapriles", golesParaGanar: 1, opciones: { semilla: 12345 } });
  await tirar(page, tapitaDe(partida, "visitante-4"), GOL_DESDE_EL_SAQUE.direccion, 1);
  await expect(page.getByTestId("resultado")).toBeVisible({ timeout: 15000 });
  await expect.poll(() => vecesSonido(page, "ganador")).toBe(1);
  expect(await vecesSonido(page, "perdedor")).toBe(0);
  await page.getByRole("button", { name: "Revancha" }).click();
  await expect.poll(() => vecesSonido(page, "competicion")).toBe(2);
});

test("un emote aceptado suena una vez y un tiro rechazado no tiene sonido de impacto", async ({ page }) => {
  await observarAudio(page);
  const partida = await empezarPartido(page, { opciones: { semilla: 12345 } });
  await expect.poll(() => page.evaluate(() => window.audioPrueba.activos)).toBe(1); // Terminó la señal de inicio.
  await page.getByRole("button", { name: "Feliz", exact: true }).first().click();
  await expect.poll(() => vecesSonido(page, "alegria")).toBe(1);
  await page.route("**/tiros", (ruta) => ruta.fulfill({ status: 400, json: { error: "Tiro rechazado para la prueba" } }));
  const t = tapitaDe(partida, "visitante-4");
  const desde = await aPantalla(page, t.posicion);
  await page.mouse.move(desde.x, desde.y); await page.mouse.down();
  await page.mouse.move(desde.x + 100, desde.y); await page.mouse.up();
  await expect(page.getByTestId("mensaje")).toContainText("Tiro rechazado");
  await expect.poll(() => vecesSonido(page, "error")).toBe(1);
  expect(await vecesSonido(page, "patear")).toBe(0);
});

test("silencio y movimiento reducido conservan una partida completa y no descargan audio", async ({ page }, info) => {
  await observarAudio(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => localStorage.setItem("tupay.audio.v1", JSON.stringify({ silenciado: true, musica: 0.25, efectos: 0.6 })));
  const audios: string[] = [];
  page.on("request", (req) => { if (/\.(ogg|mp3|wav)(\?|$)/.test(req.url())) audios.push(req.url()); });
  const partida = await empezarPartido(page, { estadio: "felixCapriles", golesParaGanar: 1, opciones: { semilla: 12345 } });
  await expect(page.getByTestId("pelota")).toHaveCSS("transform", "none");
  await tirar(page, tapitaDe(partida, "visitante-4"), GOL_DESDE_EL_SAQUE.direccion, 1);
  await expect(page.getByTestId("resultado")).toBeVisible({ timeout: 15000 });
  expect(await page.evaluate(() => window.audioPrueba.iniciados)).toBe(0);
  expect(audios).toEqual([]);
  await page.screenshot({ path: info.outputPath("resultado-sin-audio.jpg"), type: "jpeg", quality: 85 });
});

test("auditoría local de fluidez y caché con audio y en silencio", async ({ page }, info) => {
  await observarAudio(page);
  const mediciones = [];
  for (const silenciado of [false, true]) {
    await page.goto("/");
    await page.evaluate((silenciado) => localStorage.setItem("tupay.audio.v1", JSON.stringify({ silenciado, musica: 0.25, efectos: 0.6 })), silenciado);
    const descargas: string[] = [];
    const registrar = (req: import("@playwright/test").Request) => { if (/\.(ogg|mp3|wav)(\?|$)/.test(req.url())) descargas.push(req.url()); };
    page.on("request", registrar);
    const partida = await empezarPartido(page, { estadio: "felixCapriles", golesParaGanar: 1, opciones: { semilla: 12345 } });
    const cuadros = page.evaluate(() => new Promise<number[]>((resolve) => {
      const tiempos: number[] = []; let anterior = 0;
      function medir(ahora: number) {
        if (anterior) tiempos.push(ahora - anterior);
        anterior = ahora;
        if (tiempos.length === 100) resolve(tiempos); else requestAnimationFrame(medir);
      }
      requestAnimationFrame(medir);
    }));
    await tirar(page, tapitaDe(partida, "visitante-4"), GOL_DESDE_EL_SAQUE.direccion, 1);
    const tiempos = (await cuadros).sort((a, b) => a - b);
    await expect(page.getByTestId("resultado")).toBeVisible({ timeout: 15000 });
    const audio = await page.evaluate(() => window.audioPrueba);
    expect(new Set(descargas).size).toBe(descargas.length);
    expect(audio.contextos).toBe(1);
    expect(audio.bytesPcm).toBeLessThan(50 * 1024 * 1024);
    // Umbral amplio para CI: la evidencia adjunta registra el valor, no promete FPS universales.
    expect(tiempos[95]).toBeLessThan(150);
    if (silenciado) expect(descargas).toHaveLength(0);
    mediciones.push({ silenciado, medianaMs: tiempos[50], p95Ms: tiempos[95], maximoMs: tiempos[99], descargas: descargas.length,
      decodificados: audio.decodificados, bytesPcm: audio.bytesPcm });
    page.off("request", registrar);
  }
  await info.attach("rendimiento-audiovisual", { body: JSON.stringify(mediciones, null, 2), contentType: "application/json" });
});
