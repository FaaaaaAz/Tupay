import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Vector } from "../../../../compartido/geometria.js";
import { crearAzar } from "../../utilidades/azar.js";
import { longitud, redondear, restar } from "../../utilidades/vector.js";
import { CANCHA } from "../fisica/configuracionFisica.js";
import { detectarGol } from "../fisica/goles.js";
import { formacionInicial } from "../reglas/formacion.js";
import { intentarAparicion } from "./perro.js";

const TAPITAS: Vector[] = formacionInicial().map((tapita) => tapita.posicion);
const SEMILLAS = Array.from({ length: 200 }, (_, i) => i);

describe("el perro", () => {
  it("con probabilidad 0 no aparece nunca", () => {
    for (const semilla of SEMILLAS) {
      assert.equal(intentarAparicion(TAPITAS, { x: 600, y: 350 }, 0, crearAzar(semilla)), null);
    }
  });

  it("se lleva la pelota a la otra mitad de la cancha", () => {
    for (const semilla of SEMILLAS) {
      const aparicion = intentarAparicion(TAPITAS, { x: 200, y: 150 }, 1, crearAzar(semilla));
      assert.ok(aparicion, `con la semilla ${semilla} no encontró dónde dejar la pelota`);
      assert.ok(aparicion.pelota.x > CANCHA.ancho / 2, `semilla ${semilla}: la dejó del mismo lado`);
    }
  });

  it("nunca deja la pelota dentro de un arco ni encima de una tapita", () => {
    const separacionMinima = CANCHA.radioTapita + CANCHA.radioPelota;
    const pelotasCercaDelArco = [
      { x: 30, y: 350 },
      { x: 1170, y: 350 },
    ];

    for (const pelota of pelotasCercaDelArco) {
      for (const semilla of SEMILLAS) {
        const aparicion = intentarAparicion(TAPITAS, pelota, 1, crearAzar(semilla));
        if (!aparicion) continue;
        const destino = aparicion.pelota;

        assert.equal(detectarGol(destino), null);
        assert.ok(destino.x >= CANCHA.radioPelota && destino.x <= CANCHA.ancho - CANCHA.radioPelota);
        assert.ok(TAPITAS.every((tapita) => longitud(restar(tapita, destino)) >= separacionMinima));
      }
    }
  });

  it("la animación termina con la pelota donde el perro la dejó", () => {
    const aparicion = intentarAparicion(TAPITAS, { x: 300, y: 350 }, 1, crearAzar(3));
    assert.ok(aparicion);

    const ultimo = aparicion.cuadros[aparicion.cuadros.length - 1];
    assert.ok(aparicion.cuadros.every((cuadro) => cuadro.perro !== null));
    assert.deepEqual(ultimo.pelota, redondear(aparicion.pelota));
  });
});
