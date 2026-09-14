import type { EmoteActivo, Lado, PeticionEmote } from "../../../../compartido/partida.js";
import { ErrorDeJuego } from "../errores.js";
import { MENSAJES } from "../mensajes.js";
import type { RegistroPartida } from "./partida.js";
import { actualizarTiempo } from "./tiempo.js";
import { exigirSinPausa } from "./pausa.js";

/**
 * Lanza una carita sobre las cinco tapitas de un jugador. Se puede en cualquier momento, sea o
 * no su turno, pero solo una vez cada tanto. Igual que el turno, no hay temporizadores: el
 * servidor guarda cuándo se lanzó y calcula el resto al consultar.
 */
export function lanzarEmote(registro: RegistroPartida, peticion: PeticionEmote, ahora: number): void {
  exigirSinPausa(registro);
  actualizarTiempo(registro, ahora);
  if (registro.estado === "finalizada") {
    throw new ErrorDeJuego(MENSAJES.partidaTerminada, 409);
  }

  const jugador = registro.jugadores[peticion.lado];
  if (jugador.tipo === "servidor") throw new ErrorDeJuego(MENSAJES.tapitaRival);
  if (segundosDeEsperaDelEmote(registro, peticion.lado, ahora) > 0) {
    throw new ErrorDeJuego(MENSAJES.esperaEmote);
  }

  jugador.emote = { id: peticion.emote, desde: ahora };
}

/** La carita que se ve ahora sobre las tapitas del jugador, o `null` si ya pasó su tiempo. */
export function emoteActivo(registro: RegistroPartida, lado: Lado, ahora: number): EmoteActivo | null {
  const { emote } = registro.jugadores[lado];
  if (!emote) return null;

  const restanteMs = emote.desde + registro.emotes.duracionMs - ahora;
  return restanteMs > 0 ? { id: emote.id, segundosRestantes: Math.ceil(restanteMs / 1000) } : null;
}

export function segundosDeEsperaDelEmote(registro: RegistroPartida, lado: Lado, ahora: number): number {
  const { emote } = registro.jugadores[lado];
  if (!emote) return 0;
  return Math.max(0, Math.ceil((emote.desde + registro.emotes.esperaMs - ahora) / 1000));
}
