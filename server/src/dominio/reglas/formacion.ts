import type { Vector } from "../../../../compartido/geometria.js";
import type { Tapita } from "../../../../compartido/partida.js";
import { CANCHA } from "../fisica/configuracionFisica.js";

/** Formación del local en proporciones de la cancha: arquero, dos defensas y dos delanteros. */
const FORMACION: Vector[] = [
  { x: 0.1, y: 0.5 },
  { x: 0.25, y: 0.29 },
  { x: 0.25, y: 0.71 },
  { x: 0.4, y: 0.4 },
  { x: 0.4, y: 0.6 },
];

export const CENTRO_DE_LA_CANCHA: Vector = { x: CANCHA.ancho / 2, y: CANCHA.alto / 2 };

/** El local defiende el arco izquierdo; el visitante forma en espejo frente al derecho. */
export function formacionInicial(): Tapita[] {
  return (["local", "visitante"] as const).flatMap((lado) =>
    FORMACION.map((punto, indice) => ({
      id: `${lado}-${indice + 1}`,
      lado,
      posicion: {
        x: CANCHA.ancho * (lado === "local" ? punto.x : 1 - punto.x),
        y: CANCHA.alto * punto.y,
      },
    })),
  );
}
