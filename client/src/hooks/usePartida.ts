import { useCallback, useEffect, useState } from "react";
import type { Evento, Partida, PeticionTiro, RespuestaTiro } from "../../../compartido/partida.js";
import { ErrorDeApi } from "../api/cliente";
import { jugarTurnoRival, obtenerPartida, tirar as pedirTiro } from "../api/partidas";
import { useAnimacion } from "./useAnimacion";

/** Pausa antes de que tire el servidor, para que se note de quién es el turno. */
const PAUSA_DEL_RIVAL_MS = 800;
/** Igual que en el reglamento: la Liga dura 90 minutos de juego. */
const MINUTOS_DE_JUEGO = 90;

export type TiroDesdeLaCancha = Omit<PeticionTiro, "lado">;

interface JugadaEnCurso {
  respuesta: RespuestaTiro;
  recibidaEn: number;
}

/**
 * Coordina un partido en curso: guarda el estado que confirma Express, reproduce cada jugada,
 * descuenta el tiempo del turno y hace jugar al servidor cuando le toca.
 * Ningún componente visual llama a la API: todo pasa por este hook.
 */
export function usePartida(inicial: Partida) {
  const [partida, setPartida] = useState(inicial);
  /** Cuándo respondió el servidor con este estado: desde ahí corre el reloj de la Liga. */
  const [respondidaEn, setRespondidaEn] = useState(() => Date.now());
  /** Desde cuándo corre el turno: después de la animación, igual que en el servidor. */
  const [turnoDesde, setTurnoDesde] = useState(() => Date.now());
  const [ahora, setAhora] = useState(() => Date.now());
  const [jugada, setJugada] = useState<JugadaEnCurso | null>(null);
  const [esperando, setEsperando] = useState(false);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [perdida, setPerdida] = useState(false);

  const aplicar = useCallback((nueva: Partida, respondida = Date.now()) => {
    setPartida(nueva);
    setRespondidaEn(respondida);
    setTurnoDesde(Date.now());
  }, []);

  const informarError = useCallback((causa: unknown) => {
    if (causa instanceof ErrorDeApi && causa.estado === 404) setPerdida(true);
    setError(causa instanceof Error ? causa.message : "Algo salió mal");
  }, []);

  const refrescar = useCallback(async () => {
    try {
      aplicar(await obtenerPartida(partida.id));
    } catch (causa) {
      informarError(causa);
    }
  }, [partida.id, aplicar, informarError]);

  const reproducir = useCallback(
    async (pedirJugada: () => Promise<RespuestaTiro>) => {
      setEsperando(true);
      setError(null);
      setEventos([]);
      try {
        setJugada({ respuesta: await pedirJugada(), recibidaEn: Date.now() });
      } catch (causa) {
        informarError(causa);
        // Un turno vencido o una partida terminada se entienden mejor con el estado al día.
        await refrescar();
      } finally {
        setEsperando(false);
      }
    },
    [informarError, refrescar],
  );

  const terminarAnimacion = useCallback(() => {
    if (!jugada) return;
    aplicar(jugada.respuesta.partida, jugada.recibidaEn);
    setEventos(jugada.respuesta.eventos);
    setJugada(null);
  }, [jugada, aplicar]);

  const cuadro = useAnimacion(
    jugada?.respuesta.recorrido ?? null,
    jugada?.respuesta.cuadrosPorSegundo ?? 0,
    terminarAnimacion,
  );

  const libre = partida.estado === "enJuego" && !perdida && !jugada && !esperando;
  const leTocaAlServidor = partida[partida.turno.lado].tipo === "servidor";

  const tirar = useCallback(
    (tiro: TiroDesdeLaCancha) => {
      if (!libre || leTocaAlServidor) return;
      void reproducir(() => pedirTiro(partida.id, { ...tiro, lado: partida.turno.lado }));
    },
    [libre, leTocaAlServidor, reproducir, partida.id, partida.turno.lado],
  );

  useEffect(() => {
    if (!libre || !leTocaAlServidor) return;
    const espera = setTimeout(
      () => void reproducir(() => jugarTurnoRival(partida.id)),
      PAUSA_DEL_RIVAL_MS,
    );
    return () => clearTimeout(espera);
  }, [libre, leTocaAlServidor, reproducir, partida.id]);

  useEffect(() => {
    const intervalo = setInterval(() => setAhora(Date.now()), 250);
    return () => clearInterval(intervalo);
  }, []);

  // Express informa los segundos que quedaban al responder; aquí se descuenta lo que pasó desde entonces.
  const restanteDelTurno = partida.turno.segundosRestantes - Math.max(0, ahora - turnoDesde) / 1000;
  const reloj = partida.reloj;
  const restanteDeLiga = reloj
    ? reloj.segundosRealesRestantes - Math.max(0, ahora - respondidaEn) / 1000
    : null;
  const vencio = libre && (restanteDelTurno <= 0 || (restanteDeLiga !== null && restanteDeLiga <= 0));

  useEffect(() => {
    if (vencio) void refrescar();
  }, [vencio, refrescar]);

  const minutoDeJuego =
    reloj && restanteDeLiga !== null
      ? Math.floor(
          ((reloj.duracionRealSegundos - Math.max(0, restanteDeLiga)) / reloj.duracionRealSegundos) *
            MINUTOS_DE_JUEGO,
        )
      : null;

  return {
    partida,
    cuadro,
    animando: jugada !== null,
    puedeTirar: libre && !leTocaAlServidor,
    segundosDelTurno: jugada || esperando ? null : Math.max(0, Math.ceil(restanteDelTurno)),
    minutoDeJuego,
    eventos,
    error,
    perdida,
    tirar,
  };
}
