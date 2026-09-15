import type { IdEmote } from "../../../compartido/catalogo.js";
import type { Partida } from "../../../compartido/partida.js";

export const SONIDOS_DE_PARTIDA = ["partido", "inicio", "fin", "victoria", "derrota", "tiro", "poder", "gol",
  "perro", "resortera", "seleccion", "error", "confirmacion", "feliz", "triste", "sorprendido", "euforico"] as const;

// Dormida no recibe una voz improvisada. Seria y enojada reutilizan tonos, a volumen de reacción.
export const SONIDO_DE_EMOTE: Record<IdEmote, string | null> = {
  feliz: "feliz", felizEuforico: "euforico", llorando: "triste", sorprendido: "sorprendido",
  enojado: "error", enojadoSerio: "confirmacion", dormido: null,
};

/** En dos jugadores se celebra al ganador; no se adjudica la derrota a una persona arbitraria. */
export function sonidoDelResultado(partida: Partida): "victoria" | "derrota" | null {
  const ganador = partida.resultado?.ganador;
  if (!ganador) return null;
  return partida[ganador].tipo === "servidor" ? "derrota" : "victoria";
}
