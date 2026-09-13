import type { Cancha } from "../../../../compartido/partida.js";

// Todos los números de la física están aquí. Para ajustar cómo se siente el juego
// no hace falta tocar ningún otro archivo.

export const CANCHA: Cancha = {
  ancho: 1200,
  alto: 700,
  altoDelArco: 180,
  radioTapita: 28,
  radioPelota: 18,
};

/** Altura de los postes: la boca del arco queda centrada en cada lado corto. */
export const ARCO = {
  arriba: (CANCHA.alto - CANCHA.altoDelArco) / 2,
  abajo: (CANCHA.alto + CANCHA.altoDelArco) / 2,
};

export const FISICA = {
  pasosPorSegundo: 60,
  /** Subpasos cortos para que ningún cuerpo avance más que una fracción de su radio. */
  subpasosPorPaso: 8,
  /** Un cuadro cada 2 pasos: la animación va a 30 cuadros por segundo. */
  pasosPorCuadro: 2,
  /** Unidades por segundo con la fuerza al máximo. */
  velocidadMaximaTiro: 1500,
  masaTapita: 1,
  masaPelota: 0.6,
  /** Fracción de la velocidad que conserva cada cuerpo después de un segundo rodando. */
  retencionTapita: 0.25,
  retencionPelota: 0.35,
  reboteParedes: 0.75,
  reboteEntreCuerpos: 0.9,
  radioPoste: 6,
  /** Por debajo de esta velocidad el cuerpo se da por detenido. */
  velocidadMinima: 8,
  /** Tope de seguridad: ninguna simulación sigue más allá de este tiempo de juego. */
  segundosMaximosDeSimulacion: 20,
} as const;
