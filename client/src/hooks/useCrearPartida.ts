import { useCallback, useState } from "react";
import type { Partida, PeticionCrearPartida } from "../../../compartido/partida.js";
import { crearPartida } from "../api/partidas";

/** Crea una partida en Express y deja listo el mensaje de error si la rechaza. */
export function useCrearPartida() {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crear = useCallback(async (peticion: PeticionCrearPartida): Promise<Partida | null> => {
    setEnviando(true);
    setError(null);
    try {
      return await crearPartida(peticion);
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : "No se pudo crear la partida");
      return null;
    } finally {
      setEnviando(false);
    }
  }, []);

  return { crear, enviando, error };
}
