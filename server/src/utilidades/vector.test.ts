import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CERO, longitud, normalizar, productoPunto, restar, sumar } from "./vector.js";

const TOLERANCIA = 1e-12;

describe("vectores", () => {
  it("suma y resta componente a componente", () => {
    assert.deepEqual(sumar({ x: 1, y: 2 }, { x: 3, y: -4 }), { x: 4, y: -2 });
    assert.deepEqual(restar({ x: 1, y: 2 }, { x: 3, y: -4 }), { x: -2, y: 6 });
  });

  it("normalizar conserva la dirección y deja la longitud en 1", () => {
    const unitario = normalizar({ x: 3, y: 4 });

    assert.ok(Math.abs(longitud(unitario) - 1) < TOLERANCIA);
    assert.ok(Math.abs(unitario.x - 0.6) < TOLERANCIA);
    assert.ok(Math.abs(unitario.y - 0.8) < TOLERANCIA);
  });

  it("el vector cero no tiene dirección y queda en cero", () => {
    assert.deepEqual(normalizar(CERO), CERO);
  });

  it("el producto punto de dos vectores perpendiculares es cero", () => {
    assert.equal(productoPunto({ x: 2, y: 0 }, { x: 0, y: 5 }), 0);
  });
});
