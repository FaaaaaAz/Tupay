import { useEffect, useMemo, useRef, useState } from "react";
import type { Vector } from "../../../compartido/geometria.js";
import type { Cuadro } from "../../../compartido/partida.js";

interface Progreso {
  recorrido: Cuadro[] | null;
  /** Posición dentro del recorrido, con decimales: 2.5 es la mitad entre el cuadro 2 y el 3. */
  posicion: number;
  rotacion: number;
}

/**
 * Reproduce con requestAnimationFrame un recorrido calculado por Express. Entre dos cuadros
 * del servidor interpola las posiciones, así se ve fluido aunque lleguen 30 cuadros por segundo.
 */
export function useAnimacion(
  recorrido: Cuadro[] | null,
  cuadrosPorSegundo: number,
  alTerminar: () => void,
  pausada = false,
  radioPelota = 1,
): { cuadro: Cuadro | null; rotacion: number; indice: number | null } {
  const [progreso, setProgreso] = useState<Progreso>({ recorrido: null, posicion: 0, rotacion: 0 });
  const reloj = useRef({ recorrido: null as Cuadro[] | null, transcurrido: 0, base: 0 });
  const rotacionActual = useRef(0);
  const alTerminarRef = useRef(alTerminar);
  // Se calcula una sola vez por jugada, no en cada render. El perro transporta la pelota: no rueda.
  const angulos = useMemo(() => {
    let angulo = 0;
    return recorrido?.map((cuadro, i) => {
      const anterior = recorrido[i - 1];
      if (anterior && !cuadro.perro && !anterior.perro) {
        angulo += Math.hypot(cuadro.pelota.x - anterior.pelota.x, cuadro.pelota.y - anterior.pelota.y)
          / radioPelota * 180 / Math.PI;
      }
      return angulo;
    }) ?? [];
  }, [recorrido, radioPelota]);

  useEffect(() => {
    alTerminarRef.current = alTerminar;
  });

  useEffect(() => {
    if (!recorrido || pausada) return;
    if (reloj.current.recorrido !== recorrido) {
      reloj.current = { recorrido, transcurrido: 0, base: rotacionActual.current };
    }
    const inicio = performance.now() - reloj.current.transcurrido;

    let pedido = requestAnimationFrame(function avanzar(ahora) {
      // El navegador le pasa a cada cuadro el instante en que empezó a dibujarlo, que puede ser
      // un poco anterior a `inicio`. Sin el mínimo, la posición daba negativa y no había cuadro -1.
      const posicion = Math.max(0, ((ahora - inicio) / 1000) * cuadrosPorSegundo);
      reloj.current.transcurrido = Math.max(0, ahora - inicio);
      const indice = Math.min(Math.floor(posicion), recorrido.length - 1);
      const siguiente = Math.min(indice + 1, recorrido.length - 1);
      const rotacion = reloj.current.base + angulos[indice]
        + (angulos[siguiente] - angulos[indice]) * (posicion - Math.floor(posicion));
      rotacionActual.current = rotacion;
      setProgreso({ recorrido, posicion: Math.min(posicion, recorrido.length - 1), rotacion });
      if (posicion >= recorrido.length - 1) {
        alTerminarRef.current();
        return;
      }
      pedido = requestAnimationFrame(avanzar);
    });

    return () => cancelAnimationFrame(pedido);
  }, [recorrido, cuadrosPorSegundo, pausada, angulos]);

  if (!recorrido) return { cuadro: null, rotacion: progreso.rotacion, indice: null };
  const posicion = progreso.recorrido === recorrido ? progreso.posicion : 0;
  const indice = Math.floor(posicion);
  const siguiente = Math.min(indice + 1, recorrido.length - 1);
  return { cuadro: mezclar(recorrido[indice], recorrido[siguiente], posicion - indice), rotacion: progreso.rotacion, indice };
}

function mezclar(a: Cuadro, b: Cuadro, t: number): Cuadro {
  return {
    tapitas: a.tapitas.map((posicion, i) => interpolar(posicion, b.tapitas[i], t)),
    pelota: interpolar(a.pelota, b.pelota, t),
    perro: a.perro && b.perro ? interpolar(a.perro, b.perro, t) : a.perro,
  };
}

function interpolar(a: Vector, b: Vector, t: number): Vector {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}
