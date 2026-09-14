import type { Vector } from "../../../../compartido/geometria.js";
import type { Lado } from "../../../../compartido/partida.js";
import { escalar, longitud, normalizar, productoPunto, restar } from "../../utilidades/vector.js";
import { CANCHA, FISICA } from "../fisica/configuracionFisica.js";
import { RIVAL } from "../reglas/configuracionReglas.js";

export interface TiroDeBillar {
  /** Hacia dónde sale la tapita, en radianes. */
  angulo: number;
  fuerza: number;
  /** Distancia desde la tapita hasta el punto donde golpea la pelota. */
  distancia: number;
  /** Si la tapita está detrás de la pelota: al golpearla, la manda hacia el arco que ataca. */
  empujaHaciaElArco: boolean;
}

/**
 * Apunta como en el billar: golpear la pelota en el punto opuesto al arco que ataca, para
 * mandarla hacia allá, con la fuerza justa para llegar con impulso.
 */
export function tiroDeBillar(tapita: Vector, pelota: Vector, lado: Lado): TiroDeBillar {
  const arcoQueAtaca: Vector = { x: lado === "local" ? CANCHA.ancho : 0, y: CANCHA.alto / 2 };
  const haciaElArco = normalizar(restar(arcoQueAtaca, pelota));
  const puntoDeGolpe = restar(pelota, escalar(haciaElArco, CANCHA.radioTapita + CANCHA.radioPelota));
  const tiro = restar(puntoDeGolpe, tapita);
  const distancia = longitud(tiro);

  // Con fricción exponencial, la velocidad cae en proporción a la distancia recorrida.
  const frenadoPorUnidad = -Math.log(FISICA.retencionTapita);
  const velocidadNecesaria = RIVAL.velocidadAlLlegar + frenadoPorUnidad * distancia;

  return {
    angulo: Math.atan2(tiro.y, tiro.x),
    fuerza: limitarFuerza(velocidadNecesaria / FISICA.velocidadMaximaTiro),
    distancia,
    empujaHaciaElArco: productoPunto(normalizar(tiro), haciaElArco) > 0,
  };
}

export function limitarFuerza(fuerza: number): number {
  return Math.min(1, Math.max(RIVAL.fuerzaMinima, fuerza));
}
