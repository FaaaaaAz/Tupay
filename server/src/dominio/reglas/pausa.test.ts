import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { crearRegistro } from "./partida.js";
import { cambiarPausa } from "./pausa.js";
import { aPartidaPublica } from "./vistaPublica.js";
import { actualizarTiempo } from "./tiempo.js";
import { ejecutarTiro, jugarTurnoDelRival } from "./tiro.js";
import { lanzarEmote } from "./emotes.js";

function crear() {
  return crearRegistro({ modo: "liga", local: { equipo: "bolivar", tipo: "humano" },
    visitante: { equipo: "aurora", tipo: "humano" }, estadio: "felixCapriles", perroActivo: false,
    duracionRealSegundos: 60, limiteTurnoSegundos: 15 }, "pausa", 1000, 12345);
}

describe("pausa autoritativa", () => {
  it("congela Liga, turno y emotes durante minutos, y reanuda sin regalar tiempo", () => {
    const registro = crear();
    lanzarEmote(registro, { lado: "local", emote: "feliz" }, 2000);
    cambiarPausa(registro, true, 3200);
    const antes = aPartidaPublica(registro, 3200);
    actualizarTiempo(registro, 303200);
    assert.deepEqual(aPartidaPublica(registro, 303200), antes);
    cambiarPausa(registro, true, 303200); // Reintentar es idempotente.
    cambiarPausa(registro, false, 303200);
    assert.deepEqual(aPartidaPublica(registro, 303200), { ...antes, pausada: false });
    cambiarPausa(registro, false, 305200);
    assert.equal(registro.inicioTurno, 301000);
    assert.equal(aPartidaPublica(registro, 305200).turno.segundosRestantes, antes.turno.segundosRestantes - 2);
    assert.equal(aPartidaPublica(registro, 305200).reloj?.segundosRealesRestantes, antes.reloj!.segundosRealesRestantes - 2);
  });

  it("rechaza tiros, rival y emotes sin consumir poder ni cambiar el estado", () => {
    const registro = crear();
    cambiarPausa(registro, true, 2000);
    const antes = aPartidaPublica(registro, 2000);
    assert.throws(() => ejecutarTiro(registro, { lado: registro.turno, tapita: `${registro.turno}-1`, direccion: { x: 1, y: 0 }, fuerza: 1, tiroDePoder: true }, 3000), /pausada/);
    assert.throws(() => jugarTurnoDelRival(registro, 3000), /pausada/);
    assert.throws(() => lanzarEmote(registro, { lado: "local", emote: "feliz" }, 3000), /pausada/);
    assert.deepEqual(aPartidaPublica(registro, 3000), antes);
  });

  it("conserva el inicio futuro del turno cuando se pausa durante una animación", () => {
    const registro = crear();
    ejecutarTiro(registro, { lado: registro.turno, tapita: `${registro.turno}-1`, direccion: { x: 0, y: 1 }, fuerza: 0.5 }, 1000);
    const inicio = registro.inicioTurno;
    cambiarPausa(registro, true, 1100);
    cambiarPausa(registro, false, 101100);
    assert.equal(registro.inicioTurno, inicio + 100000);
    assert.equal(aPartidaPublica(registro, 101100).turno.segundosRestantes, 15);
  });

  it("pausar después del límite no resucita un partido terminado", () => {
    const registro = crear();
    cambiarPausa(registro, true, 61001);
    cambiarPausa(registro, false, 90000);
    assert.equal(registro.estado, "finalizada");
    assert.deepEqual(registro.resultado?.marcador, { local: 0, visitante: 0 });
  });
});
