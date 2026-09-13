import type { Vector } from "../../../../compartido/geometria.js";
import { CERO } from "../../utilidades/vector.js";
import { ARCO, CANCHA, FISICA } from "./configuracionFisica.js";

/** Cualquier cosa redonda que participa en la simulación. */
export interface Cuerpo {
  posicion: Vector;
  velocidad: Vector;
  radio: number;
  /** Inversa de la masa. Los postes tienen 0: ningún choque los mueve. */
  masaInversa: number;
  /** Fracción de la velocidad que conserva después de un segundo rodando. */
  retencion: number;
  /** Solo la pelota puede pasar por la boca del arco. */
  esPelota: boolean;
}

export function crearTapita(posicion: Vector): Cuerpo {
  return {
    posicion,
    velocidad: CERO,
    radio: CANCHA.radioTapita,
    masaInversa: 1 / FISICA.masaTapita,
    retencion: FISICA.retencionTapita,
    esPelota: false,
  };
}

export function crearPelota(posicion: Vector): Cuerpo {
  return {
    posicion,
    velocidad: CERO,
    radio: CANCHA.radioPelota,
    masaInversa: 1 / FISICA.masaPelota,
    retencion: FISICA.retencionPelota,
    esPelota: true,
  };
}

/** Los cuatro postes son círculos fijos: así un tiro puede pegar en el palo. */
export function crearPostes(): Cuerpo[] {
  const posiciones: Vector[] = [
    { x: 0, y: ARCO.arriba },
    { x: 0, y: ARCO.abajo },
    { x: CANCHA.ancho, y: ARCO.arriba },
    { x: CANCHA.ancho, y: ARCO.abajo },
  ];
  return posiciones.map((posicion) => ({
    posicion,
    velocidad: CERO,
    radio: FISICA.radioPoste,
    masaInversa: 0,
    retencion: 1,
    esPelota: false,
  }));
}

export function enReposo(cuerpo: Cuerpo): boolean {
  return cuerpo.velocidad.x === 0 && cuerpo.velocidad.y === 0;
}
