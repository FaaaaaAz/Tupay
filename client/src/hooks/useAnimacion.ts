import { useEffect, useRef, useState } from "react";
import type { Vector } from "../../../compartido/geometria.js";
import type { Cuadro } from "../../../compartido/partida.js";

interface Progreso {
  recorrido: Cuadro[] | null;
  /** Posición dentro del recorrido, con decimales: 2.5 es la mitad entre el cuadro 2 y el 3. */
  posicion: number;
}

/**
 * Reproduce con requestAnimationFrame un recorrido calculado por Express. Entre dos cuadros
 * del servidor interpola las posiciones, así se ve fluido aunque lleguen 30 cuadros por segundo.
 */
export function useAnimacion(
  recorrido: Cuadro[] | null,
  cuadrosPorSegundo: number,
  alTerminar: () => void,
): Cuadro | null {
  const [progreso, setProgreso] = useState<Progreso>({ recorrido: null, posicion: 0 });
  const alTerminarRef = useRef(alTerminar);

  useEffect(() => {
    alTerminarRef.current = alTerminar;
  });

  useEffect(() => {
    if (!recorrido) return;
    const inicio = performance.now();

    let pedido = requestAnimationFrame(function avanzar(ahora) {
      const posicion = ((ahora - inicio) / 1000) * cuadrosPorSegundo;
      if (posicion >= recorrido.length - 1) {
        alTerminarRef.current();
        return;
      }
      setProgreso({ recorrido, posicion });
      pedido = requestAnimationFrame(avanzar);
    });

    return () => cancelAnimationFrame(pedido);
  }, [recorrido, cuadrosPorSegundo]);

  if (!recorrido) return null;
  const posicion = progreso.recorrido === recorrido ? progreso.posicion : 0;
  const indice = Math.floor(posicion);
  const siguiente = Math.min(indice + 1, recorrido.length - 1);
  return mezclar(recorrido[indice], recorrido[siguiente], posicion - indice);
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
