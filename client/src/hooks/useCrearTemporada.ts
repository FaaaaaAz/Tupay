import { useCallback, useRef, useState } from "react";
import type { PeticionCrearTemporada, Temporada } from "../../../compartido/temporada.js";
import { crearTemporada } from "../api/temporadas";
import { audio } from "../audio/audio";

export function useCrearTemporada() {
  const ocupado = useRef(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crear = useCallback(async (peticion: PeticionCrearTemporada): Promise<Temporada | null> => {
    if (ocupado.current) return null;
    ocupado.current = true;
    setEnviando(true);
    setError(null);
    try {
      return await crearTemporada(peticion);
    } catch (causa) {
      void audio.efecto("error");
      setError(causa instanceof Error ? causa.message : "No se pudo crear la temporada");
      return null;
    } finally {
      ocupado.current = false;
      setEnviando(false);
    }
  }, []);

  return { crear, enviando, error };
}
