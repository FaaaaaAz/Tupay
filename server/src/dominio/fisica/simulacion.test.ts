import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { longitud, restar } from "../../utilidades/vector.js";
import { CANCHA } from "./configuracionFisica.js";
import { simularTiro, type EntradaSimulacion } from "./simulacion.js";

/** Dos formaciones completas de cinco tapitas y un tiro fuerte que choca con varias. */
const PARTIDO_COMPLETO: EntradaSimulacion = {
  tapitas: [
    { x: 120, y: 350 },
    { x: 300, y: 200 },
    { x: 300, y: 500 },
    { x: 480, y: 280 },
    { x: 480, y: 420 },
    { x: 1080, y: 350 },
    { x: 900, y: 200 },
    { x: 900, y: 500 },
    { x: 720, y: 280 },
    { x: 720, y: 420 },
  ],
  pelota: { x: 600, y: 350 },
  tiro: { tapita: 3, direccion: { x: 1, y: 0.5 }, fuerza: 1 },
};

describe("simulación de un tiro", () => {
  it("una tapita rebota en la pared sin atravesarla", () => {
    const { cuadros } = simularTiro({
      tapitas: [{ x: 600, y: 150 }],
      pelota: { x: 100, y: 600 },
      tiro: { tapita: 0, direccion: { x: 0, y: -1 }, fuerza: 0.5 },
    });
    const alturas = cuadros.map((cuadro) => cuadro.tapitas[0].y);

    assert.ok(Math.min(...alturas) >= CANCHA.radioTapita - 0.1, "atravesó la pared");
    assert.ok(alturas[alturas.length - 1] > 150, "no volvió después de rebotar");
  });

  it("una tapita que choca la pelota le transfiere velocidad", () => {
    const tiro = { tapita: 0, direccion: { x: 1, y: 0 }, fuerza: 0.3 };
    const sinChoque = simularTiro({
      tapitas: [{ x: 400, y: 150 }],
      pelota: { x: 600, y: 600 },
      tiro,
    });
    const conChoque = simularTiro({
      tapitas: [{ x: 400, y: 150 }],
      pelota: { x: 500, y: 150 },
      tiro,
    });

    assert.ok(conChoque.pelota.x > 700, "la pelota no salió despedida");
    assert.ok(
      conChoque.tapitas[0].x < sinChoque.tapitas[0].x,
      "la tapita no perdió velocidad al chocar",
    );
  });

  it("un tiro directo al arco derecho es gol en ese arco", () => {
    const resultado = simularTiro({
      tapitas: [{ x: 1000, y: 350 }],
      pelota: { x: 1080, y: 350 },
      tiro: { tapita: 0, direccion: { x: 1, y: 0 }, fuerza: 0.8 },
    });

    assert.equal(resultado.arcoConGol, "derecho");
    assert.equal(resultado.terminoPor, "gol");
  });

  it("un tiro directo al arco izquierdo es gol en ese arco", () => {
    const resultado = simularTiro({
      tapitas: [{ x: 200, y: 350 }],
      pelota: { x: 120, y: 350 },
      tiro: { tapita: 0, direccion: { x: -1, y: 0 }, fuerza: 0.8 },
    });

    assert.equal(resultado.arcoConGol, "izquierdo");
  });

  it("las tapitas rebotan en la línea de gol y nunca entran al arco", () => {
    const { cuadros, arcoConGol } = simularTiro({
      tapitas: [{ x: 1000, y: 350 }],
      pelota: { x: 600, y: 100 },
      tiro: { tapita: 0, direccion: { x: 1, y: 0 }, fuerza: 1 },
    });
    const bordeDerecho = CANCHA.ancho - CANCHA.radioTapita + 0.1;

    assert.equal(arcoConGol, null);
    assert.ok(
      cuadros.every((cuadro) => cuadro.tapitas[0].x <= bordeDerecho),
      "la tapita entró al arco",
    );
  });

  it("después de muchos choques, todo termina detenido", () => {
    assert.equal(simularTiro(PARTIDO_COMPLETO).terminoPor, "reposo");
  });

  it("ningún par de tapitas queda encimado durante el recorrido", () => {
    const { cuadros } = simularTiro(PARTIDO_COMPLETO);
    const distanciaMinima = 2 * CANCHA.radioTapita - 1;

    for (const [numero, { tapitas }] of cuadros.entries()) {
      for (let i = 0; i < tapitas.length; i++) {
        for (let j = i + 1; j < tapitas.length; j++) {
          const distancia = longitud(restar(tapitas[i], tapitas[j]));
          assert.ok(
            distancia >= distanciaMinima,
            `cuadro ${numero}: tapitas ${i} y ${j} encimadas (${distancia.toFixed(1)})`,
          );
        }
      }
    }
  });

  it("el mismo tiro produce siempre exactamente el mismo recorrido", () => {
    assert.deepEqual(simularTiro(PARTIDO_COMPLETO), simularTiro(PARTIDO_COMPLETO));
  });
});

describe("golpes que suenan", () => {
  it("una tapita que toca la pelota avisa un pateo, en un cuadro del recorrido", () => {
    const { contactos, cuadros } = simularTiro({
      tapitas: [{ x: 400, y: 150 }],
      pelota: { x: 500, y: 150 },
      tiro: { tapita: 0, direccion: { x: 1, y: 0 }, fuerza: 0.3 },
    });

    assert.ok(contactos.some((contacto) => contacto.tipo === "patear"), "no avisó el pateo");
    assert.ok(contactos.every((contacto) => contacto.cuadro > 0 && contacto.cuadro < cuadros.length));
  });

  it("dos tapitas que chocan avisan un choque", () => {
    const { contactos } = simularTiro({
      tapitas: [{ x: 400, y: 150 }, { x: 500, y: 150 }],
      pelota: { x: 100, y: 600 },
      tiro: { tapita: 0, direccion: { x: 1, y: 0 }, fuerza: 0.3 },
    });

    assert.ok(contactos.some((contacto) => contacto.tipo === "choque"), "no avisó el choque");
    assert.ok(!contactos.some((contacto) => contacto.tipo === "patear"), "avisó un pateo sin tocar la pelota");
  });

  it("una tapita que rebota en la pared avisa la pared", () => {
    const { contactos } = simularTiro({
      tapitas: [{ x: 600, y: 150 }],
      pelota: { x: 100, y: 600 },
      tiro: { tapita: 0, direccion: { x: 0, y: -1 }, fuerza: 0.5 },
    });

    assert.deepEqual(contactos.map((contacto) => contacto.tipo), ["pared"]);
  });

  it("la pelota que rebota en la pared no suena como una tapita", () => {
    const { contactos } = simularTiro({
      tapitas: [{ x: 600, y: 300 }],
      pelota: { x: 600, y: 200 },
      tiro: { tapita: 0, direccion: { x: 0, y: -1 }, fuerza: 0.3 },
    });

    // La pelota sube, rebota arriba y puede volver a tocar la tapita: eso sí es otro pateo.
    assert.ok(contactos.length > 0);
    assert.ok(contactos.every((contacto) => contacto.tipo === "patear"), "la pelota sonó contra la pared");
  });

  it("un tiro que no toca nada no avisa ningún golpe", () => {
    const { contactos } = simularTiro({
      tapitas: [{ x: 600, y: 350 }],
      pelota: { x: 100, y: 600 },
      tiro: { tapita: 0, direccion: { x: 1, y: 0 }, fuerza: 0.1 },
    });

    assert.deepEqual(contactos, []);
  });
});
