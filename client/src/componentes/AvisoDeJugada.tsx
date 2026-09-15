import { useEffect, useRef, useState } from "react";

interface Props {
  titulo: string;
  detalle: string;
  tipo: "gol" | "turno" | "perro" | "charco" | "final";
  pausado: boolean;
}

/** Aviso no bloqueante. La clave del padre identifica el evento, no los renders del reloj. */
export function AvisoDeJugada({ titulo, detalle, tipo, pausado }: Props) {
  const [visible, setVisible] = useState(true);
  const restante = useRef(tipo === "turno" ? 1800 : 2600);

  useEffect(() => {
    if (pausado || !visible) return;
    const inicio = performance.now();
    const temporizador = setTimeout(() => setVisible(false), restante.current);
    return () => {
      clearTimeout(temporizador);
      restante.current = Math.max(0, restante.current - (performance.now() - inicio));
    };
  }, [pausado, visible]);

  if (!visible) return null;
  return (
    <div className={`aviso-jugada aviso-jugada--${tipo}`} role="status" aria-live="polite" aria-atomic="true">
      <span className="aviso-jugada__simbolo" aria-hidden="true">
        {tipo === "gol" ? "★" : tipo === "perro" ? "!" : tipo === "charco" ? "≈" : tipo === "final" ? "✓" : "→"}
      </span>
      <div><strong>{titulo}</strong><span>{detalle}</span></div>
    </div>
  );
}
