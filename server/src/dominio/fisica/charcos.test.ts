import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Vector } from "../../../../compartido/geometria.js";
import { contiene, type PelotaAtrapada, type ZonaDeCharco } from "./charcos.js";
import { simularTiro, type EntradaSimulacion } from "./simulacion.js";

const EN_EL_CHARCO: Vector = { x: 600, y: 500 };
const AGUA: ZonaDeCharco = { id: "agua-1", posicion: EN_EL_CHARCO, ancho: 170, alto: 80, golpesParaLiberar: 1, impulsoAlLiberar: 0.4 };
const NIEVE: ZonaDeCharco = { ...AGUA, id: "nieve-1", golpesParaLiberar: 2, impulsoAlLiberar: 0.25 };

/** Una tapita debajo de la pelota le pega suave hacia arriba, lejos de paredes y arcos. */
function golpeDesdeAbajo(cambios: Partial<EntradaSimulacion> = {}): EntradaSimulacion {
  return {
    tapitas: [{ x: 600, y: 620 }],
    pelota: EN_EL_CHARCO,
    tiro: { tapita: 0, direccion: { x: 0, y: -1 }, fuerza: 0.2 },
    ...cambios,
  };
}

const atrapadaEn = (charco: ZonaDeCharco): PelotaAtrapada => ({
  charco: charco.id,
  golpesParaLiberar: charco.golpesParaLiberar,
});

describe("charcos en la física", () => {
  it("la pelota que entra a un charco queda atrapada y quieta", () => {
    const resultado = simularTiro({
      tapitas: [{ x: 300, y: 500 }],
      pelota: { x: 380, y: 500 },
      tiro: { tapita: 0, direccion: { x: 1, y: 0 }, fuerza: 0.6 },
      charcos: [AGUA],
    });

    assert.deepEqual(resultado.pelotaAtrapada, { charco: "agua-1", golpesParaLiberar: 1 });
    assert.deepEqual(resultado.eventosDeCharco, [{ tipo: "pelotaAtrapada", charco: "agua-1" }]);
    assert.ok(contiene(AGUA, resultado.pelota), "la pelota siguió de largo");
  });

  it("un golpe la saca del agua, pero sale con mucho menos impulso que una pelota libre", () => {
    const libre = simularTiro(golpeDesdeAbajo());
    const desdeElAgua = simularTiro(golpeDesdeAbajo({ charcos: [AGUA], pelotaAtrapada: atrapadaEn(AGUA) }));

    assert.equal(desdeElAgua.pelotaAtrapada, null);
    assert.deepEqual(desdeElAgua.eventosDeCharco, [{ tipo: "pelotaLiberada", charco: "agua-1" }]);
    const recorridoLibre = EN_EL_CHARCO.y - libre.pelota.y;
    const recorridoDesdeElAgua = EN_EL_CHARCO.y - desdeElAgua.pelota.y;
    assert.ok(recorridoDesdeElAgua > 0, "la pelota no salió");
    assert.ok(recorridoDesdeElAgua < recorridoLibre / 2, "salió con casi todo el impulso");
  });

  it("de la nieve no sale con un golpe: la pelota no se mueve y le queda uno", () => {
    const resultado = simularTiro(golpeDesdeAbajo({ charcos: [NIEVE], pelotaAtrapada: atrapadaEn(NIEVE) }));

    assert.deepEqual(resultado.pelotaAtrapada, { charco: "nieve-1", golpesParaLiberar: 1 });
    assert.deepEqual(resultado.pelota, EN_EL_CHARCO);
    assert.deepEqual(resultado.eventosDeCharco, []);
  });

  it("la tapita de un tiro de poder la saca de la nieve de un solo golpe", () => {
    const entrada = golpeDesdeAbajo({ charcos: [NIEVE], pelotaAtrapada: atrapadaEn(NIEVE) });
    const resultado = simularTiro({ ...entrada, tiro: { ...entrada.tiro, liberaDeUnGolpe: true } });

    assert.equal(resultado.pelotaAtrapada, null);
    assert.deepEqual(resultado.eventosDeCharco, [{ tipo: "pelotaLiberada", charco: "nieve-1" }]);
  });

  it("una pelota que ya estaba dentro de un charco sin estar atrapada no queda atrapada", () => {
    const resultado = simularTiro(golpeDesdeAbajo({ charcos: [AGUA] }));

    assert.equal(resultado.pelotaAtrapada, null);
    assert.deepEqual(resultado.eventosDeCharco, []);
  });

  it("las tapitas pasan por encima de los charcos como si no estuvieran", () => {
    const entrada: EntradaSimulacion = {
      tapitas: [{ x: 400, y: 500 }],
      pelota: { x: 100, y: 100 },
      tiro: { tapita: 0, direccion: { x: 1, y: 0 }, fuerza: 0.5 },
    };

    assert.deepEqual(simularTiro({ ...entrada, charcos: [NIEVE] }).tapitas, simularTiro(entrada).tapitas);
  });
});
