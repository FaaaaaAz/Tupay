/** Devuelve un número en [0, 1), como `Math.random`, pero reproducible. */
export type Azar = () => number;

/**
 * Generador mulberry32: con la misma semilla produce siempre la misma secuencia.
 * Es lo que permite repetir un partido con azar en una prueba E2E.
 */
export function crearAzar(semilla: number): Azar {
  let estado = semilla >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
