import { expect, test } from "@playwright/test";
import type { PeticionTiro } from "../compartido/partida.js";
import { empezarPartido, GOL_DESDE_EL_SAQUE, tapitaDe, tirar } from "./ayudantes.js";

test("arrastrar una tapita manda el tiro del gesto y la cancha termina donde dijo el servidor", async ({ page }) => {
  const partida = await empezarPartido(page, {
    estadio: GOL_DESDE_EL_SAQUE.estadio,
    opciones: { semilla: GOL_DESDE_EL_SAQUE.semilla },
  });
  expect(partida.turno.lado).toBe("visitante");
  await expect(page.getByTestId("turno")).toContainText("Turno de The Strongest");

  // El arquero patea suave hacia abajo: se mueve sin tocar la pelota.
  const arquero = tapitaDe(partida, "visitante-1");
  const pedido = page.waitForRequest((peticion) => peticion.url().endsWith("/tiros"));
  const { recorrido, partida: despues } = await tirar(page, arquero, { x: 0, y: 1 }, 0.4);

  const enviado: PeticionTiro = (await pedido).postDataJSON();
  expect(enviado.lado).toBe("visitante");
  expect(enviado.tapita).toBe("visitante-1");
  expect(enviado.direccion.y / Math.hypot(enviado.direccion.x, enviado.direccion.y)).toBeGreaterThan(0.99);
  expect(enviado.fuerza).toBeCloseTo(0.4, 1);
  expect(recorrido.length).toBeGreaterThan(1);

  // Después de la animación, React aplica el estado que confirmó Express.
  await expect(page.getByTestId("turno")).toContainText("Turno de Bolívar", { timeout: 15_000 });
  const { x, y } = tapitaDe(despues, "visitante-1").posicion;
  expect(y).toBeGreaterThan(arquero.posicion.y);
  await expect(page.getByTestId("tapita-visitante-1")).toHaveAttribute("transform", `translate(${x} ${y})`);
});
