import type { Lado } from "../../../../compartido/partida.js";
import type { Arco } from "../fisica/goles.js";

export function rival(lado: Lado): Lado {
  return lado === "local" ? "visitante" : "local";
}

/** El local defiende el arco izquierdo, así que un gol en el derecho es suyo. */
export function ladoQueAnota(arco: Arco): Lado {
  return arco === "derecho" ? "local" : "visitante";
}
