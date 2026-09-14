import { ErrorDeJuego } from "../errores.js";
import type { RegistroPartida } from "./partida.js";
import { actualizarTiempo } from "./tiempo.js";

/** Desplaza los orígenes del reloj: el tiempo de pausa nunca cuenta como tiempo jugado. */
export function cambiarPausa(registro: RegistroPartida, pausada: boolean, ahora: number): void {
  if (pausada) {
    if (registro.pausadaDesde !== null) return;
    actualizarTiempo(registro, ahora);
    registro.pausadaDesde = ahora;
  } else if (registro.pausadaDesde !== null) {
    const duracion = Math.max(0, ahora - registro.pausadaDesde);
    registro.inicioTurno += duracion;
    if (registro.reloj) registro.reloj.inicio += duracion;
    for (const jugador of Object.values(registro.jugadores)) {
      if (jugador.emote) jugador.emote.desde += duracion;
    }
    registro.pausadaDesde = null;
  }
}

export function exigirSinPausa(registro: RegistroPartida): void {
  if (registro.pausadaDesde !== null) {
    throw new ErrorDeJuego("La partida está pausada. Reanuda para seguir jugando", 409);
  }
}
