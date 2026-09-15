import { escalar, longitud, productoPunto, restar, sumar } from "../../utilidades/vector.js";
import { FISICA } from "./configuracionFisica.js";
import type { Cuerpo } from "./cuerpo.js";

/** Recibe los dos cuerpos que chocaron y la velocidad con que se acercaban. */
export type AlGolpear = (a: Cuerpo, b: Cuerpo, velocidad: number) => void;

/**
 * Choque elástico entre dos círculos, con pérdida de energía según `reboteEntreCuerpos`.
 * Devuelve la velocidad con que se acercaban, o 0 si no hubo golpe.
 */
export function resolverColision(a: Cuerpo, b: Cuerpo): number {
  const masaInversaTotal = a.masaInversa + b.masaInversa;
  if (masaInversaTotal === 0) return 0;

  const separacion = restar(b.posicion, a.posicion);
  const distancia = longitud(separacion);
  const solapamiento = a.radio + b.radio - distancia;
  if (solapamiento <= 0) return 0;

  // Con los centros en el mismo punto no hay dirección: se separan en horizontal.
  const normal = distancia === 0 ? { x: 1, y: 0 } : escalar(separacion, 1 / distancia);

  // 1. Desencimarlos. El más liviano se mueve más.
  const correccion = solapamiento / masaInversaTotal;
  a.posicion = restar(a.posicion, escalar(normal, correccion * a.masaInversa));
  b.posicion = sumar(b.posicion, escalar(normal, correccion * b.masaInversa));

  // 2. Si se están acercando, intercambiar impulso sobre la línea que une los centros.
  const velocidadDeAcercamiento = productoPunto(restar(b.velocidad, a.velocidad), normal);
  if (velocidadDeAcercamiento >= 0) return 0;

  const impulso =
    (-(1 + FISICA.reboteEntreCuerpos) * velocidadDeAcercamiento) / masaInversaTotal;
  a.velocidad = restar(a.velocidad, escalar(normal, impulso * a.masaInversa));
  b.velocidad = sumar(b.velocidad, escalar(normal, impulso * b.masaInversa));
  return -velocidadDeAcercamiento;
}

/** Revisa todos los pares: con once cuerpos y cuatro postes, compararlos todos es instantáneo. */
export function resolverColisiones(moviles: Cuerpo[], fijos: Cuerpo[], alGolpear?: AlGolpear): void {
  for (let i = 0; i < moviles.length; i++) {
    for (let j = i + 1; j < moviles.length; j++) {
      avisar(alGolpear, moviles[i], moviles[j], resolverColision(moviles[i], moviles[j]));
    }
    for (const fijo of fijos) {
      avisar(alGolpear, moviles[i], fijo, resolverColision(moviles[i], fijo));
    }
  }
}

function avisar(alGolpear: AlGolpear | undefined, a: Cuerpo, b: Cuerpo, velocidad: number): void {
  if (alGolpear && velocidad > 0) alGolpear(a, b, velocidad);
}
