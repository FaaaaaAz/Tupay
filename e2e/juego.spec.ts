import { expect, test, type Page } from "@playwright/test";

async function abrirConfiguracionDeEliminatoria(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Iniciar" }).click();
  await page.getByRole("button", { name: /Eliminatoria/ }).click();
}

async function empezarPartidoDeDos(page: Page) {
  await abrirConfiguracionDeEliminatoria(page);
  await page.getByLabel("2 jugadores en este dispositivo").check();
  await page.getByLabel("El perro puede meterse a la cancha").uncheck();
  await page.getByRole("button", { name: "Jugar" }).click();
  await expect(page.getByTestId("cancha")).toBeVisible();
}

test("se puede empezar un partido de dos jugadores y ver las diez tapitas", async ({ page }) => {
  await empezarPartidoDeDos(page);

  await expect(page.locator('[data-testid^="tapita-"]')).toHaveCount(10);
  await expect(page.getByTestId("marcador")).toHaveText("0 – 0");
});

test("arrastrar una tapita propia tira contra el servidor y pasa el turno", async ({ page }) => {
  await empezarPartidoDeDos(page);

  const turnoAntes = (await page.getByTestId("turno").textContent()) ?? "";
  const siguiente = turnoAntes.includes("Bolívar") ? "The Strongest" : "Bolívar";

  const tapita = page.locator('[data-activa="true"]').first();
  const caja = await tapita.boundingBox();
  if (!caja) throw new Error("La tapita del turno no se ve en pantalla");
  const centro = { x: caja.x + caja.width / 2, y: caja.y + caja.height / 2 };

  // Arrastrar hacia arriba hace salir la tapita hacia abajo, lejos de la pelota.
  const respuestaDelTiro = page.waitForResponse(
    (respuesta) => respuesta.url().endsWith("/tiros") && respuesta.request().method() === "POST",
  );
  await page.mouse.move(centro.x, centro.y);
  await page.mouse.down();
  await page.mouse.move(centro.x, centro.y - 70, { steps: 8 });
  await page.mouse.up();

  expect((await respuestaDelTiro).ok()).toBeTruthy();
  await expect(page.getByTestId("turno")).toContainText(`Turno de ${siguiente}`, { timeout: 15_000 });
});

test("elegir dos veces el mismo equipo muestra el mensaje del servidor", async ({ page }) => {
  await abrirConfiguracionDeEliminatoria(page);
  await page.getByLabel("Rival").selectOption("bolivar");
  await page.getByRole("button", { name: "Jugar" }).click();

  await expect(page.getByRole("alert")).toHaveText(
    "Elijan equipos distintos: todavía no hay camisetas alternativas",
  );
});
