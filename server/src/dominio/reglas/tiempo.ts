import type { Reloj } from "../../../../compartido/partida.js";
import { REGLAS } from "./configuracionReglas.js";
import { rival } from "./lados.js";
import { finalizar, type RegistroPartida } from "./partida.js";

/**
 * El servidor no usa temporizadores. Cada vez que alguien consulta o tira, calcula
 * cuánto tiempo pasó y aplica lo que debería haber ocurrido mientras tanto.
 */
export function actualizarTiempo(registro: RegistroPartida, ahora: number): void {
  if (registro.estado === "finalizada") return;

  if (registro.reloj && ahora - registro.reloj.inicio >= registro.reloj.duracionMs) {
    finalizar(registro);
    return;
  }

  const transcurrido = ahora - registro.inicioTurno;
  if (transcurrido < registro.limiteTurnoMs) return;

  // Cada turno vencido pasa al rival: con una cantidad impar, el turno cambia de lado.
  const turnosVencidos = Math.floor(transcurrido / registro.limiteTurnoMs);
  if (turnosVencidos % 2 === 1) registro.turno = rival(registro.turno);
  registro.turnoVencido = rival(registro.turno);
  registro.inicioTurno += turnosVencidos * registro.limiteTurnoMs;
}

export function segundosRestantesDelTurno(registro: RegistroPartida, ahora: number): number {
  const restanteMs = Math.min(
    registro.limiteTurnoMs,
    registro.inicioTurno + registro.limiteTurnoMs - ahora,
  );
  return Math.max(0, Math.ceil(restanteMs / 1000));
}

export function relojPublico(reloj: NonNullable<RegistroPartida["reloj"]>, ahora: number): Reloj {
  const transcurridoMs = Math.min(reloj.duracionMs, Math.max(0, ahora - reloj.inicio));
  return {
    minutoDeJuego: Math.floor((transcurridoMs / reloj.duracionMs) * REGLAS.minutosDeJuego),
    segundosRealesRestantes: Math.ceil((reloj.duracionMs - transcurridoMs) / 1000),
  };
}
