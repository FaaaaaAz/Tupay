import { useEffect, useState } from "react";

/** Igual que en el reglamento: la Liga dura 90 minutos de juego. */
const SEGUNDOS_DE_JUEGO = 90 * 60;

interface Props {
  duracionRealSegundos: number;
  /** Segundos reales que le quedaban a la Liga en `medidoEn`. */
  restante: number;
  medidoEn: number;
  /** En pausa, sin partida o terminada, el reloj se queda quieto. */
  detenido: boolean;
}

function segundoDeJuego(duracion: number, restante: number): number {
  const transcurrido = Math.min(duracion, Math.max(0, duracion - restante));
  return Math.floor((transcurrido / duracion) * SEGUNDOS_DE_JUEGO);
}

/**
 * Minutos y segundos de juego. Con 5 minutos reales, cada segundo real son 18 de juego: los segundos
 * corren rápido y se nota que el reloj está acelerado. Cuenta por cuadro, sin volver a dibujar la cancha.
 */
export function RelojDeLiga({ duracionRealSegundos, restante, medidoEn, detenido }: Props) {
  const [segundos, setSegundos] = useState(() => segundoDeJuego(duracionRealSegundos, restante));

  useEffect(() => {
    const medir = () =>
      setSegundos(segundoDeJuego(duracionRealSegundos, detenido ? restante : restante - (Date.now() - medidoEn) / 1000));
    medir();
    if (detenido) return;
    let cuadro = requestAnimationFrame(function avanzar() {
      medir();
      cuadro = requestAnimationFrame(avanzar);
    });
    return () => cancelAnimationFrame(cuadro);
  }, [duracionRealSegundos, restante, medidoEn, detenido]);

  const minutos = String(Math.floor(segundos / 60)).padStart(2, "0");
  const resto = String(segundos % 60).padStart(2, "0");
  return (
    <span className="marcador__detalle marcador__reloj" title="Minuto de juego">
      {minutos}:{resto}
    </span>
  );
}
