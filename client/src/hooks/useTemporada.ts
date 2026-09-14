import { useCallback, useEffect, useRef, useState } from "react";
import type { Partida } from "../../../compartido/partida.js";
import type { ControlDelRival, Temporada } from "../../../compartido/temporada.js";
import { jugarPartidoDeTemporada, obtenerTemporada } from "../api/temporadas";

/** Carga la temporada al entrar: Express aprovecha la consulta para anotar los partidos que terminaron. */
export function useTemporada(id: string) {
  const ocupado = useRef(false);
  const [temporada, setTemporada] = useState<Temporada | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let vigente = true;
    obtenerTemporada(id)
      .then((cargada) => {
        if (vigente) setTemporada(cargada);
      })
      .catch((causa: unknown) => {
        if (vigente) setError(causa instanceof Error ? causa.message : "No se pudo cargar la temporada");
      });
    return () => {
      vigente = false;
    };
  }, [id]);

  const jugar = useCallback(
    async (partidoId: string, rivalControladoPor?: ControlDelRival): Promise<Partida | null> => {
      if (ocupado.current) return null;
      ocupado.current = true;
      setEnviando(true);
      setError(null);
      try {
        const respuesta = await jugarPartidoDeTemporada(id, partidoId, { rivalControladoPor });
        setTemporada(respuesta.temporada);
        return respuesta.partida;
      } catch (causa) {
        setError(causa instanceof Error ? causa.message : "No se pudo empezar el partido");
        return null;
      } finally {
        ocupado.current = false;
        setEnviando(false);
      }
    },
    [id],
  );

  return { temporada, error, enviando, jugar };
}
