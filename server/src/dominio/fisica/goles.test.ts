import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CANCHA } from "./configuracionFisica.js";
import { detectarGol } from "./goles.js";

const RADIO = CANCHA.radioPelota;
const MITAD = CANCHA.alto / 2;

describe("detección de goles", () => {
  it("la pelota en el medio de la cancha no es gol", () => {
    assert.equal(detectarGol({ x: CANCHA.ancho / 2, y: MITAD }), null);
  });

  it("la pelota que cruzó por completo la línea izquierda es gol en ese arco", () => {
    assert.equal(detectarGol({ x: -RADIO - 1, y: MITAD }), "izquierdo");
  });

  it("la pelota que cruzó por completo la línea derecha es gol en ese arco", () => {
    assert.equal(detectarGol({ x: CANCHA.ancho + RADIO + 1, y: MITAD }), "derecho");
  });

  it("la pelota que todavía toca la línea no es gol", () => {
    assert.equal(detectarGol({ x: -RADIO + 1, y: MITAD }), null);
  });

  it("fuera de los postes nunca es gol", () => {
    assert.equal(detectarGol({ x: -RADIO - 1, y: 50 }), null);
  });
});
