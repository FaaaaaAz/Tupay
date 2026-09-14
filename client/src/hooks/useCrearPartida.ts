import { useCallback, useRef, useState } from "react";
import type { Partida, PeticionCrearPartida } from "../../../compartido/partida.js";
import { crearPartida } from "../api/partidas";
import { precargarPartida } from "../recursos/precargar";

/** Crea una partida en Express y deja listo el mensaje de error si la rechaza. */
export function useCrearPartida() {
  const ocupado = useRef(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crear = useCallback(async (peticion: PeticionCrearPartida): Promise<Partida | null> => {
    if (ocupado.current) return null;
    ocupado.current = true;
    setEnviando(true);
    setError(null);
    try {
      await precargarPartida(peticion);
      return await crearPartida(peticion);
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : "No se pudo crear la partida");
      return null;
    } finally {
      ocupado.current = false;
      setEnviando(false);
    }
  }, []);

  return { crear, enviando, error };
}
