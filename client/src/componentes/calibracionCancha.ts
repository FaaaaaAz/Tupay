import type { Cancha } from "../../../compartido/partida.js";

// Medidas tomadas de las imágenes con un script. Los seis estadios comparten la misma cancha
// dibujada, con diferencias de un píxel. Si se cambia una imagen, hay que volver a medir.

/** Imagen del estadio, en píxeles: dónde están dibujadas las líneas de gol y el centro. */
export const IMAGEN_ESTADIO = {
  ancho: 1672,
  alto: 941,
  lineaDeGolIzquierda: 340,
  lineaDeGolDerecha: 1331.5,
  centroY: 450,
};

/** `juego/arco.webp`, en proporciones de la propia imagen. */
const IMAGEN_ARCO = {
  anchoSobreAlto: 480 / 1136,
  /** Dónde terminan los palos, que se apoyan sobre la línea de gol. */
  puntaDeLosPalos: 0.875,
  /** Distancia entre los dos palos: es la boca del arco. */
  separacionEntrePalos: 0.813,
  centroEntrePalos: 0.51,
};

/** Qué parte de cada imagen ocupa el dibujo, para que coincida con el radio de la física. */
const RELLENO = { tapita: 0.935, pelota: 0.856, perro: 0.81 };

/** Margen alrededor de la cancha que siempre queda a la vista, en píxeles de la imagen. */
const MARGEN_VISIBLE = 30;

/**
 * Cómo se superpone la física sobre la imagen. Las líneas de gol de la física coinciden
 * exactamente con las dibujadas, y la escala es la misma en los dos ejes para no deformar
 * las tapitas: por eso las paredes de arriba y abajo quedan un poco por fuera de las bandas.
 */
export function geometriaDeLaCancha(cancha: Cancha) {
  const escala =
    (IMAGEN_ESTADIO.lineaDeGolDerecha - IMAGEN_ESTADIO.lineaDeGolIzquierda) / cancha.ancho;
  const origen = {
    x: IMAGEN_ESTADIO.lineaDeGolIzquierda,
    y: IMAGEN_ESTADIO.centroY - (cancha.alto / 2) * escala,
  };

  const altoDelArco = cancha.altoDelArco / IMAGEN_ARCO.separacionEntrePalos;
  const anchoDelArco = altoDelArco * IMAGEN_ARCO.anchoSobreAlto;
  const arco = {
    ancho: anchoDelArco,
    alto: altoDelArco,
    x: -anchoDelArco * IMAGEN_ARCO.puntaDeLosPalos,
    y: cancha.alto / 2 - altoDelArco * IMAGEN_ARCO.centroEntrePalos,
  };

  const fondoDeLaRed = -arco.x * escala;
  const vista = [
    origen.x - fondoDeLaRed - MARGEN_VISIBLE,
    origen.y - MARGEN_VISIBLE,
    cancha.ancho * escala + 2 * (fondoDeLaRed + MARGEN_VISIBLE),
    cancha.alto * escala + 2 * MARGEN_VISIBLE,
  ].join(" ");

  return {
    escala,
    origen,
    vista,
    arco,
    tamanoTapita: (2 * cancha.radioTapita) / RELLENO.tapita,
    tamanoPelota: (2 * cancha.radioPelota) / RELLENO.pelota,
    tamanoPerro: (3 * cancha.radioTapita) / RELLENO.perro,
  };
}
