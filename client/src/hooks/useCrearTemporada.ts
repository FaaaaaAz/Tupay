import { useCallback, useState } from "react";
import type { PeticionCrearTemporada, Temporada } from "../../../compartido/temporada.js";
import { crearTemporada } from "../api/temporadas";

export function useCrearTemporada() {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crear = useCallback(async (peticion: PeticionCrearTemporada): Promise<Temporada | null> => {
    setEnviando(true);
    setError(null);
    try {
      return await crearTemporada(peticion);
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : "No se pudo crear la temporada");
      return null;
    } finally {
      setEnviando(false);
    }
  }, []);

  return { crear, enviando, error };
}
