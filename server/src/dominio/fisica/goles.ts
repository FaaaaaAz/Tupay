import type { Vector } from "../../../../compartido/geometria.js";
import { ARCO, CANCHA } from "./configuracionFisica.js";

/**
 * La física solo sabe en qué arco entró la pelota. Qué equipo defiende cada arco
 * es una regla del partido, y se decide en `dominio/reglas`.
 */
export type Arco = "izquierdo" | "derecho";

/** Hay gol solo cuando la pelota cruzó la línea por completo, entre los dos postes. */
export function detectarGol(pelota: Vector): Arco | null {
  const entreLosPostes = pelota.y > ARCO.arriba && pelota.y < ARCO.abajo;
  if (!entreLosPostes) return null;

  if (pelota.x + CANCHA.radioPelota < 0) return "izquierdo";
  if (pelota.x - CANCHA.radioPelota > CANCHA.ancho) return "derecho";
  return null;
}
