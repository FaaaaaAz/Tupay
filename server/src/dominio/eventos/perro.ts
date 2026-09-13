import type { Vector } from "../../../../compartido/geometria.js";
import type { Cuadro } from "../../../../compartido/partida.js";
import type { Azar } from "../../utilidades/azar.js";
import { interpolar, longitud, redondear, restar } from "../../utilidades/vector.js";
import { CANCHA, CUADROS_POR_SEGUNDO } from "../fisica/configuracionFisica.js";

export interface AparicionDelPerro {
  /** Cuadros que se agregan al final del recorrido del tiro. */
  cuadros: Cuadro[];
  /** Dónde dejó la pelota. */
  pelota: Vector;
}

const SEGUNDOS_ENTRANDO = 0.8;
const SEGUNDOS_LLEVANDO_LA_PELOTA = 1.2;
const SEGUNDOS_SALIENDO = 0.8;
/** Desde qué distancia fuera de la cancha entra y hasta dónde sale. */
const DISTANCIA_FUERA_DE_LA_CANCHA = 80;
/** Desvío máximo respecto del punto en espejo, para que no sea siempre el mismo lugar. */
const DESVIO_HORIZONTAL = 150;
const INTENTOS_PARA_DEJAR_LA_PELOTA = 20;

/**
 * Sortea si el perro entra. Si entra, se lleva la pelota al lado opuesto de la cancha,
 * a un lugar libre y siempre dentro del campo: por eso nunca puede dejarla dentro de un arco.
 */
export function intentarAparicion(
  tapitas: Vector[],
  pelota: Vector,
  probabilidad: number,
  azar: Azar,
): AparicionDelPerro | null {
  if (azar() >= probabilidad) return null;

  const destino = elegirDestino(tapitas, pelota, azar);
  if (!destino) return null;

  return { cuadros: animarPerro(tapitas, pelota, destino), pelota: destino };
}

function elegirDestino(tapitas: Vector[], pelota: Vector, azar: Azar): Vector | null {
  const margen = CANCHA.radioPelota + 10;
  const separacionMinima = CANCHA.radioTapita + CANCHA.radioPelota + 4;

  for (let intento = 0; intento < INTENTOS_PARA_DEJAR_LA_PELOTA; intento++) {
    const enEspejo = CANCHA.ancho - pelota.x + (azar() * 2 - 1) * DESVIO_HORIZONTAL;
    const destino = {
      x: Math.min(CANCHA.ancho - margen, Math.max(margen, enEspejo)),
      y: margen + azar() * (CANCHA.alto - 2 * margen),
    };
    const libre = tapitas.every(
      (tapita) => longitud(restar(tapita, destino)) >= separacionMinima,
    );
    if (libre) return destino;
  }
  return null;
}

/** Entra desde arriba hasta la pelota, se la lleva y sale por abajo. */
function animarPerro(tapitas: Vector[], pelota: Vector, destino: Vector): Cuadro[] {
  const quietas = tapitas.map(redondear);
  const entrada = { x: pelota.x, y: -DISTANCIA_FUERA_DE_LA_CANCHA };
  const salida = { x: destino.x, y: CANCHA.alto + DISTANCIA_FUERA_DE_LA_CANCHA };
  const cuadro = (perro: Vector, posicionPelota: Vector): Cuadro => ({
    tapitas: quietas,
    pelota: redondear(posicionPelota),
    perro: redondear(perro),
  });

  return [
    ...tramo(SEGUNDOS_ENTRANDO, (t) => cuadro(interpolar(entrada, pelota, t), pelota)),
    ...tramo(SEGUNDOS_LLEVANDO_LA_PELOTA, (t) => {
      const juntos = interpolar(pelota, destino, t);
      return cuadro(juntos, juntos);
    }),
    ...tramo(SEGUNDOS_SALIENDO, (t) => cuadro(interpolar(destino, salida, t), destino)),
  ];
}

/** Cuadros de un tramo de la animación, con `t` avanzando hasta 1. */
function tramo(segundos: number, crearCuadro: (t: number) => Cuadro): Cuadro[] {
  const cantidad = Math.round(segundos * CUADROS_POR_SEGUNDO);
  return Array.from({ length: cantidad }, (_, i) => crearCuadro((i + 1) / cantidad));
}
