import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { crearAzar } from "./azar.js";

describe("azar con semilla", () => {
  it("la misma semilla produce la misma secuencia", () => {
    assert.deepEqual(
      Array.from({ length: 10 }, crearAzar(42)),
      Array.from({ length: 10 }, crearAzar(42)),
    );
  });

  it("semillas distintas producen secuencias distintas", () => {
    assert.notDeepEqual(
      Array.from({ length: 10 }, crearAzar(42)),
      Array.from({ length: 10 }, crearAzar(43)),
    );
  });

  it("siempre devuelve valores entre 0 y 1", () => {
    const azar = crearAzar(7);
    for (let i = 0; i < 1000; i++) {
      const valor = azar();
      assert.ok(valor >= 0 && valor < 1, `valor fuera de rango: ${valor}`);
    }
  });
});
