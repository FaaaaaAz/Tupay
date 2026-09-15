import type { IdEmote } from "../../../compartido/catalogo.js";
import type { Partida } from "../../../compartido/partida.js";

export const SONIDOS_DE_PARTIDA = ["partido", "inicio", "fin", "victoria", "derrota", "empate", "patear", "choque", "pared", "poder", "gol",
  "perro", "resortera", "seleccion", "error", "confirmacion", "feliz", "triste", "sorprendido", "euforico"] as const;

// Dormida no recibe una voz improvisada. Seria y enojada reutilizan tonos, a volumen de reacción.
export const SONIDO_DE_EMOTE: Record<IdEmote, string | null> = {
  feliz: "feliz", felizEuforico: "euforico", llorando: "triste", sorprendido: "sorprendido",
  enojado: "error", enojadoSerio: "confirmacion", dormido: null,
};

/**
 * En dos jugadores siempre gana una persona: se celebra al ganador y nunca suena la derrota.
 * La derrota solo suena cuando gana el servidor. El empate tiene su propio sonido neutro.
 */
export function sonidoDelResultado(partida: Partida): "victoria" | "derrota" | "empate" | null {
  if (!partida.resultado) return null;
  const { ganador } = partida.resultado;
  if (!ganador) return "empate";
  return partida[ganador].tipo === "servidor" ? "derrota" : "victoria";
}
