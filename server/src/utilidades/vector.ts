import type { Vector } from "../../../compartido/geometria.js";

export const CERO: Vector = { x: 0, y: 0 };

export function sumar(a: Vector, b: Vector): Vector {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function restar(a: Vector, b: Vector): Vector {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function escalar(v: Vector, factor: number): Vector {
  return { x: v.x * factor, y: v.y * factor };
}

export function productoPunto(a: Vector, b: Vector): number {
  return a.x * b.x + a.y * b.y;
}

export function longitud(v: Vector): number {
  return Math.hypot(v.x, v.y);
}

/** Mismo sentido, longitud 1. El vector cero no tiene dirección y se devuelve tal cual. */
export function normalizar(v: Vector): Vector {
  const largo = longitud(v);
  return largo === 0 ? CERO : { x: v.x / largo, y: v.y / largo };
}
