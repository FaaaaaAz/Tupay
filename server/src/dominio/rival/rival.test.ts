import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Dificultad } from "../../../../compartido/partida.js";
import { ErrorDeJuego } from "../errores.js";
import { MENSAJES } from "../mensajes.js";
import { crearRegistro, type RegistroPartida } from "../reglas/partida.js";
import { jugarTurnoDelRival, tirarComoHumano } from "../reglas/tiro.js";

const INICIO = 1_000_000;

function contraElServidor(semilla: number, dificultad: Dificultad = "dificil"): RegistroPartida {
  const registro = crearRegistro(
    {
      modo: "eliminatoria",
      local: { equipo: "bolivar", tipo: "humano" },
      visitante: { equipo: "theStrongest", tipo: "servidor", dificultad },
      perroActivo: false,
    },
    "p_rival",
    INICIO,
    semilla,
  );
  registro.turno = "visitante";
  return registro;
}

function rechaza(accion: () => unknown, mensaje: string): void {
  assert.throws(accion, (error) => error instanceof ErrorDeJuego && error.message === mensaje);
}

describe("rival del servidor", () => {
  it("tira con una tapita propia y le devuelve el turno a la persona", () => {
    const registro = contraElServidor(1);
    const posicionesPropias = () =>
      registro.tapitas.filter((tapita) => tapita.lado === "visitante").map((tapita) => tapita.posicion);
    const antes = posicionesPropias();

    const { recorrido } = jugarTurnoDelRival(registro, INICIO);

    assert.ok(recorrido.length > 1);
    assert.notDeepEqual(posicionesPropias(), antes, "no movió ninguna tapita propia");
    assert.equal(registro.turno, "local");
  });

  it("no juega cuando le toca a una persona", () => {
    const registro = contraElServidor(1);
    registro.turno = "local";

    rechaza(() => jugarTurnoDelRival(registro, INICIO), MENSAJES.noEsTurnoDelRival);
  });

  it("una persona no puede tirar con el equipo del servidor", () => {
    const registro = contraElServidor(1);
    const tiro = { lado: "visitante" as const, tapita: "visitante-1", direccion: { x: -1, y: 0 }, fuerza: 0.5 };

    rechaza(() => tirarComoHumano(registro, tiro, INICIO), MENSAJES.noEsTuTurno);
  });

  it("con la misma semilla juega exactamente igual", () => {
    assert.deepEqual(
      jugarTurnoDelRival(contraElServidor(9), INICIO),
      jugarTurnoDelRival(contraElServidor(9), INICIO),
    );
  });

  it("en difícil casi siempre empuja la pelota hacia el arco que ataca", () => {
    const semillas = Array.from({ length: 30 }, (_, indice) => indice + 1);
    const haciaSuArco = semillas.filter((semilla) => {
      const registro = contraElServidor(semilla);
      jugarTurnoDelRival(registro, INICIO);
      return registro.marcador.visitante > 0 || registro.pelota.x < 600;
    });

    assert.ok(haciaSuArco.length >= 24, `solo ${haciaSuArco.length} de 30 tiros fueron hacia su arco`);
  });
});
