import { CERO, escalar, longitud, sumar } from "../../utilidades/vector.js";
import { ARCO, CANCHA, FISICA } from "./configuracionFisica.js";
import type { Cuerpo } from "./cuerpo.js";

/** Avanza el cuerpo `dt` segundos y lo frena por fricción. */
export function mover(cuerpo: Cuerpo, dt: number): void {
  cuerpo.posicion = sumar(cuerpo.posicion, escalar(cuerpo.velocidad, dt));

  const velocidad = escalar(cuerpo.velocidad, cuerpo.retencion ** dt);
  cuerpo.velocidad = longitud(velocidad) < FISICA.velocidadMinima ? CERO : velocidad;
}

/** Si el cuerpo se salió de la cancha, lo devuelve al borde e invierte su velocidad. */
export function rebotarEnParedes(cuerpo: Cuerpo): void {
  const { ancho, alto } = CANCHA;
  const { radio } = cuerpo;
  const rebote = FISICA.reboteParedes;
  let { x, y } = cuerpo.posicion;
  let { x: vx, y: vy } = cuerpo.velocidad;

  // Math.abs fija el sentido de salida: si ya se estaba alejando, no se invierte dos veces.
  if (y - radio < 0) {
    y = radio;
    vy = Math.abs(vy) * rebote;
  } else if (y + radio > alto) {
    y = alto - radio;
    vy = -Math.abs(vy) * rebote;
  }

  // Solo la pelota atraviesa la línea de gol, y solo entre los postes.
  const frenteAlArco = cuerpo.esPelota && y > ARCO.arriba && y < ARCO.abajo;
  if (!frenteAlArco) {
    if (x - radio < 0) {
      x = radio;
      vx = Math.abs(vx) * rebote;
    } else if (x + radio > ancho) {
      x = ancho - radio;
      vx = -Math.abs(vx) * rebote;
    }
  }

  cuerpo.posicion = { x, y };
  cuerpo.velocidad = { x: vx, y: vy };
}
