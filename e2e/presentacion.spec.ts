import { expect, test } from "@playwright/test";
import { aPantalla, abrirMenu, elegirEnElMenu, empezarPartido, GOL_DESDE_EL_SAQUE, tapitaDe, tirar } from "./ayudantes.js";

test("la potencia sigue el arrastre y el aviso de gol acompaña un resultado real", async ({ page }, info) => {
  const partida = await empezarPartido(page, { estadio: "felixCapriles", opciones: { semilla: 12345 } });
  const tapita = tapitaDe(partida, "visitante-4");
  const desde = await aPantalla(page, tapita.posicion);
  const hasta = await aPantalla(page, { x: tapita.posicion.x + 120, y: tapita.posicion.y });
  await page.getByRole("button", { name: "Tiro de poder (2)" }).click();
  await page.mouse.move(desde.x, desde.y);
  await page.mouse.down();
  await page.mouse.move(hasta.x, hasta.y, { steps: 5 });
  const potencia = page.getByRole("meter", { name: "Potencia del tiro" });
  await expect(potencia).toHaveAttribute("aria-valuenow", /^(49|50|51)$/);
  await expect(potencia).toContainText("PODER");
  await page.screenshot({ path: info.outputPath("potencia.jpg"), type: "jpeg", quality: 85 });
  await page.getByTestId("cancha").dispatchEvent("pointercancel");
  await page.mouse.up();
  await expect(potencia).toHaveCount(0);
  await page.getByRole("button", { name: "Tiro de poder (2)" }).click();
  await tirar(page, tapita, GOL_DESDE_EL_SAQUE.direccion, 1);
  const aviso = page.getByRole("status").filter({ hasText: "¡Gooool!" });
  await expect(aviso).toBeVisible({ timeout: 15000 });
  await expect(page.getByTestId("marcador")).toHaveText("0 – 1");
  await expect(page.getByRole("button", { name: "Tiro de poder (2)" })).toBeEnabled();
  await expect(aviso).toHaveCSS("pointer-events", "none");
  await page.screenshot({ path: info.outputPath("gol.jpg"), type: "jpeg", quality: 85 });
  await expect(aviso).toHaveCount(0, { timeout: 4000 });
});

test("perro y charco se anuncian cuando aparecen en una jugada confirmada", async ({ page }, info) => {
  const partida = await empezarPartido(page, { estadio: "felixCapriles", perro: true, opciones: { semilla: 1, probabilidadPerro: 1 } });
  await tirar(page, tapitaDe(partida, `${partida.turno.lado}-1`), { x: 0, y: 1 }, 0.2);
  await expect(page.getByTestId("perro")).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole("status").filter({ hasText: "¡El perro entró!" })).toBeVisible();
  await page.screenshot({ path: info.outputPath("perro.jpg"), type: "jpeg", quality: 85 });

  // Encontrado con ejecutarTiro: semilla 1, visitante-4 a 135° cae en nieve-1.
  const nieve = await empezarPartido(page, { estadio: "villaIngenio", opciones: { semilla: 1 } });
  const respuesta = await tirar(page, tapitaDe(nieve, "visitante-4"), { x: -1, y: 1 }, 1);
  expect(respuesta.partida.pelota.atrapadaEn).not.toBeNull();
  await expect(page.getByTestId("pelota-atrapada")).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole("status").filter({ hasText: "Pelota atrapada" })).toBeVisible();
  await expect(page.getByText("2 golpes para salir", { exact: true })).toBeVisible();
  await page.screenshot({ path: info.outputPath("nieve.jpg"), type: "jpeg", quality: 85 });
});

test("la pausa conserva el aviso de turno y movimiento reducido elimina la animación", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await empezarPartido(page);
  const aviso = page.getByRole("status").filter({ hasText: "Elige tu tapita" });
  await expect(aviso).toHaveCSS("animation-name", "none");
  await page.getByRole("button", { name: "Pausar" }).click();
  await expect(page.getByRole("button", { name: "Reanudar partido" })).toBeEnabled();
  // Más que la duración del aviso: debe seguir montado porque su reloj está pausado.
  await page.waitForTimeout(2100);
  await expect(aviso).toHaveCount(1);
  await page.getByRole("button", { name: "Reanudar partido" }).click();
  await expect(aviso).toHaveCount(0, { timeout: 3000 });
});

test("menú, configuración, temporada y resultado conservan el diseño en tres tamaños", async ({ page }, info) => {
  for (const [width, height] of [[1280, 720], [1366, 768], [1920, 1080]]) {
    await page.setViewportSize({ width, height });
    await abrirMenu(page);
    await expect(page.getByRole("button", { name: /^Cómo se juega/ })).toBeInViewport({ ratio: 1 });
    await page.screenshot({ path: info.outputPath(`menu-${width}.jpg`), type: "jpeg", quality: 85, animations: "disabled" });
    await elegirEnElMenu(page, "Eliminatoria");
    await expect(page.getByRole("button", { name: "Jugar", exact: true })).toBeInViewport({ ratio: 1 });
    await page.screenshot({ path: info.outputPath(`configuracion-${width}.jpg`), type: "jpeg", quality: 85, animations: "disabled" });
    await page.getByRole("button", { name: "← Volver" }).click();
    await elegirEnElMenu(page, "Temporada");
    await page.getByRole("button", { name: "Empezar temporada" }).click();
    await expect(page.getByTestId("jornada")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: info.outputPath(`temporada-${width}.jpg`), type: "jpeg", quality: 85, animations: "disabled" });
    const partida = await empezarPartido(page, { estadio: "felixCapriles", golesParaGanar: 1, opciones: { semilla: 12345 } });
    await tirar(page, tapitaDe(partida, "visitante-4"), GOL_DESDE_EL_SAQUE.direccion, 1);
    await expect(page.getByTestId("resultado")).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("button", { name: "Revancha" })).toBeInViewport({ ratio: 1 });
    await page.screenshot({ path: info.outputPath(`resultado-${width}.jpg`), type: "jpeg", quality: 85, animations: "disabled" });
  }
});
