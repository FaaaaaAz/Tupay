import type { Vector } from "../../../../compartido/geometria.js";
import type { Lado } from "../../../../compartido/partida.js";
import { CANCHA } from "../fisica/configuracionFisica.js";
import type { Arco } from "../fisica/goles.js";

export function rival(lado: Lado): Lado {
  return lado === "local" ? "visitante" : "local";
}

/** El local defiende el arco izquierdo, así que un gol en el derecho es suyo. */
export function ladoQueAnota(arco: Arco): Lado {
  return arco === "derecho" ? "local" : "visitante";
}

/** Dueño del arco más cercano a un punto. Justo en la mitad no hay uno más cercano. */
export function ladoDelArcoMasCercano(punto: Vector): Lado | null {
  const mitad = CANCHA.ancho / 2;
  if (punto.x < mitad) return "local";
  if (punto.x > mitad) return "visitante";
  return null;
}
