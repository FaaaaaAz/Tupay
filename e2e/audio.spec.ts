import { expect, test } from "@playwright/test";
import { observarAudio } from "./observarAudio.js";
import { readdirSync } from "node:fs";
import { abrirMenu, elegirEnElMenu, empezarPartido } from "./ayudantes.js";


test("audio espera Iniciar, mantiene una música, persiste ajustes y permite silencio", async ({ page }) => {
  const errores: string[] = [];
  page.on("pageerror", (error) => errores.push(error.message));
  page.on("console", (mensaje) => { if (mensaje.type() === "error") errores.push(mensaje.text()); });
  await observarAudio(page);
  const descargas: string[] = [];
  page.on("request", (req) => { if (/\.(ogg|mp3|wav)(\?|$)/.test(req.url())) descargas.push(req.url()); });
  await page.goto("/");
  await expect(page.getByTestId("estado-servidor")).toContainText("Servidor en línea");
  expect(await page.evaluate(() => window.audioPrueba.contextos)).toBe(0);
  expect(descargas).toHaveLength(0);
  await page.getByRole("button", { name: "Iniciar" }).click();
  await expect.poll(() => page.evaluate(() => window.audioPrueba.bucles)).toBe(1);
  await elegirEnElMenu(page, "Cómo se juega");
  await page.getByRole("button", { name: "← Volver" }).click();
  expect(await page.evaluate(() => window.audioPrueba.bucles)).toBe(1);
  await page.getByText("Sonido · activado", { exact: true }).click();
  await page.getByRole("slider", { name: "Volumen de música" }).fill("17");
  await page.getByRole("slider", { name: "Volumen de efectos" }).fill("42");
  await page.getByRole("button", { name: "Probar efecto" }).click();
  await expect.poll(() => page.evaluate(() => window.audioPrueba.iniciados)).toBeGreaterThan(1);
  await page.getByRole("button", { name: "Silenciar todo" }).click();
  await expect.poll(() => page.evaluate(() => window.audioPrueba.activos)).toBe(0);
  await page.reload();
  await page.getByRole("button", { name: "Iniciar" }).click();
  await page.getByText("Sonido · silenciado", { exact: true }).click();
  await expect(page.getByRole("slider", { name: "Volumen de música" })).toHaveValue("17");
  await expect(page.getByRole("slider", { name: "Volumen de efectos" })).toHaveValue("42");
  expect(await page.evaluate(() => window.audioPrueba.iniciados)).toBe(0);
  await page.getByRole("button", { name: "Silenciar todo" }).click();
  await expect.poll(() => page.evaluate(() => window.audioPrueba.bucles)).toBe(1);
  expect(errores).toEqual([]);
});

test("audio de partido se detiene al pausar; controles accesibles sin cambiar el partido", async ({ page, request }, info) => {
  await observarAudio(page);
  const partida = await empezarPartido(page);
  await expect.poll(() => page.evaluate(() => window.audioPrueba.bucles)).toBe(2);
  await page.getByRole("button", { name: "Pausar" }).click();
  const modal = page.getByRole("dialog", { name: "Partido en pausa" });
  await expect(modal.getByRole("button", { name: "Reanudar partido" })).toBeEnabled();
  const antes = await (await request.get(`/api/partidas/${partida.id}`)).json();
  await modal.getByText("Sonido · activado", { exact: true }).click();
  await modal.getByRole("slider", { name: "Volumen de música" }).focus();
  await page.keyboard.press("ArrowLeft");
  await expect(modal.getByRole("slider", { name: "Volumen de música" })).toHaveValue("24");
  await modal.getByRole("button", { name: "Probar efecto" }).focus();
  await page.keyboard.press("Tab");
  await expect(modal.getByRole("button", { name: "Reanudar partido" })).toBeFocused();
  for (const [width, height] of [[1280, 720], [1366, 768], [1920, 1080]]) {
    await page.setViewportSize({ width, height });
    await expect(modal.getByRole("slider", { name: "Volumen de efectos" })).toBeInViewport();
    await page.screenshot({ path: info.outputPath(`audio-pausa-${width}.jpg`), type: "jpeg", quality: 85 });
  }
  expect(await (await request.get(`/api/partidas/${partida.id}`)).json()).toEqual(antes);
  await page.keyboard.press("Escape");
  await expect(modal).not.toBeVisible();
});

test("todos los recursos publicados se descargan, decodifican y contienen señal real", async ({ page, request }, info) => {
  // Los audios se leen de la aplicación que se está probando, no de `dist/`: contra producción
  // no hay build local. El catálogo usa `import.meta.glob` inmediato, así que todas las URLs
  // con hash quedan dentro del script principal que carga `index.html`.
  const originales = readdirSync("client/src/recursos/audio", { recursive: true, encoding: "utf8" })
    .filter((ruta) => /\.(ogg|mp3|wav)$/.test(ruta));
  const html = await (await request.get("/")).text();
  const script = html.match(/<script[^>]+src="([^"]+\.js)"/)?.[1];
  expect(script, "index.html no carga ningún script").toBeTruthy();
  const codigo = await (await request.get(script ?? "")).text();
  const archivos = [...new Set(codigo.match(/\/assets\/[\w.-]+\.(?:ogg|mp3|wav)/g) ?? [])].map((url) => url.slice("/assets/".length));
  expect(archivos).toHaveLength(originales.length);
  await page.goto("/");
  const mediciones = [];
  for (const archivo of archivos) {
    const datos = await page.evaluate(async (nombre) => {
      const respuesta = await fetch(`/assets/${nombre}`);
      const contexto = new OfflineAudioContext(2, 1, 44100);
      const buffer = await contexto.decodeAudioData(await respuesta.arrayBuffer());
      const canal = buffer.getChannelData(0);
      let pico = 0;
      for (const muestra of canal) pico = Math.max(pico, Math.abs(muestra));
      return { ok: respuesta.ok, duracion: buffer.duration, pico };
    }, archivo);
    expect(datos.ok, archivo).toBe(true);
    expect(datos.duracion, archivo).toBeGreaterThan(0.01);
    expect(datos.pico, archivo).toBeGreaterThan(0.001);
    if (!archivo.startsWith("exploracion-") && !archivo.startsWith("competicion-")) expect(datos.duracion, archivo).toBeLessThan(6);
    mediciones.push({ archivo, ...datos });
  }
  await info.attach("decodificacion-audio", { body: JSON.stringify(mediciones, null, 2), contentType: "application/json" });
});

test("sin AudioContext ni almacenamiento la aplicación sigue jugable", async ({ page }) => {
  const errores: string[] = [];
  page.on("pageerror", (error) => errores.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, "AudioContext", { value: undefined });
    Object.defineProperty(window, "localStorage", { get() { throw new Error("No disponible"); } });
  });
  await empezarPartido(page);
  await page.getByRole("button", { name: "Pausar" }).click();
  await page.getByText("Sonido · activado", { exact: true }).click();
  await expect(page.getByText("El audio no está disponible. Puedes seguir jugando sin sonido.")).toBeVisible();
  await page.getByRole("button", { name: "Silenciar todo" }).click();
  await page.getByRole("button", { name: "Reanudar partido" }).click();
  await expect(page.getByTestId("cancha")).toBeVisible();
  expect(errores).toEqual([]);
});

test("un audio inválido no bloquea la navegación ni genera promesas rechazadas sin manejar", async ({ page }) => {
  const errores: string[] = [];
  page.on("pageerror", (error) => errores.push(error.message));
  await page.route("**/exploracion-*.ogg", (ruta) => ruta.fulfill({ contentType: "audio/ogg", body: "archivo invalido" }));
  await abrirMenu(page);
  await page.getByText("Sonido · activado", { exact: true }).click();
  await expect(page.getByText("No se pudo cargar la música. Puedes continuar sin ella.")).toBeVisible();
  await elegirEnElMenu(page, "Eliminatoria");
  await expect(page.getByRole("button", { name: "Jugar", exact: true })).toBeVisible();
  expect(errores).toEqual([]);
});
