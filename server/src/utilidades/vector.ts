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

/** Punto intermedio entre `a` y `b`: con `t = 0` es `a`; con `t = 1`, `b`. */
export function interpolar(a: Vector, b: Vector, t: number): Vector {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/** Un decimal alcanza para dibujar y achica bastante el JSON. */
export function redondear({ x, y }: Vector): Vector {
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}
