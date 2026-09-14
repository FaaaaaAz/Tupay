import { useCallback, useEffect, useRef, useState } from "react";
import type { IdEmote } from "../../../compartido/catalogo.js";
import type {
  Evento,
  Jugador,
  Lado,
  Partida,
  PeticionTiro,
  RespuestaTiro,
} from "../../../compartido/partida.js";
import { ErrorDeApi } from "../api/cliente";
import {
  jugarTurnoRival,
  lanzarEmote as pedirEmote,
  obtenerPartida,
  tirar as pedirTiro,
  cambiarPausa as pedirPausa,
  abandonarPartida,
} from "../api/partidas";
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

/** Hasta cuándo se ve la carita de un jugador y hasta cuándo tiene que esperar para lanzar otra. */
interface RelojDeEmote {
  id: IdEmote | null;
  hasta: number;
  esperaHasta: number;
}

function relojDeEmote(jugador: Jugador, recibido: number): RelojDeEmote {
  return {
    id: jugador.emote?.id ?? null,
    hasta: recibido + (jugador.emote?.segundosRestantes ?? 0) * 1000,
    esperaHasta: recibido + jugador.esperaEmote * 1000,
  };
}

/**
 * Coordina un partido en curso: guarda el estado que confirma Express, reproduce cada jugada,
 * descuenta el tiempo del turno y hace jugar al servidor cuando le toca.
 * Ningún componente visual llama a la API: todo pasa por este hook.
 */
export function usePartida(inicial: Partida) {
  const ocupado = useRef(false);
  const emoteOcupado = useRef(false);
  const [pausada, setPausada] = useState(inicial.pausada);
  const [cambiandoPausa, setCambiandoPausa] = useState(false);
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
  // Los emotes llevan su propio reloj: si se lanzan durante una animación, la jugada que termina
  // trae un estado anterior al emote y no debe borrar la carita.
  const [relojesDeEmote, setRelojesDeEmote] = useState<Record<Lado, RelojDeEmote>>(() => ({
    local: relojDeEmote(inicial.local, Date.now()),
    visitante: relojDeEmote(inicial.visitante, Date.now()),
  }));
  const [enviandoEmote, setEnviandoEmote] = useState(false);

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
    if (ocupado.current) return;
    ocupado.current = true;
    setEsperando(true);
    try {
      aplicar(await obtenerPartida(partida.id));
    } catch (causa) {
      informarError(causa);
    } finally {
      ocupado.current = false;
      setEsperando(false);
    }
  }, [partida.id, aplicar, informarError]);

  const reproducir = useCallback(
    async (pedirJugada: () => Promise<RespuestaTiro>) => {
      if (ocupado.current) return;
      ocupado.current = true;
      setEsperando(true);
      setError(null);
      setEventos([]);
      try {
        setJugada({ respuesta: await pedirJugada(), recibidaEn: Date.now() });
      } catch (causa) {
        informarError(causa);
        // Un turno vencido o una partida terminada se entienden mejor con el estado al día.
        ocupado.current = false;
        await refrescar();
      } finally {
        ocupado.current = false;
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

  const { cuadro, rotacion } = useAnimacion(
    jugada?.respuesta.recorrido ?? null,
    jugada?.respuesta.cuadrosPorSegundo ?? 0,
    terminarAnimacion,
    pausada || cambiandoPausa || perdida,
    partida.cancha.radioPelota,
  );

  const libre = partida.estado === "enJuego" && !perdida && !jugada && !esperando && !pausada && !cambiandoPausa;
  const leTocaAlServidor = partida[partida.turno.lado].tipo === "servidor";

  const tirar = useCallback(
    (tiro: TiroDesdeLaCancha) => {
      if (!libre || leTocaAlServidor) return;
      void reproducir(() => pedirTiro(partida.id, { ...tiro, lado: partida.turno.lado }));
    },
    [libre, leTocaAlServidor, reproducir, partida.id, partida.turno.lado],
  );

  /** Se puede en cualquier momento, incluso mientras se anima una jugada: el servidor valida la espera. */
  const lanzarEmote = useCallback(
    async (lado: Lado, emote: IdEmote) => {
      if (emoteOcupado.current || ocupado.current || pausada || cambiandoPausa || perdida) return;
      emoteOcupado.current = true;
      setEnviandoEmote(true);
      try {
        const actualizada = await pedirEmote(partida.id, { lado, emote });
        const recibida = Date.now();
        setRelojesDeEmote((anteriores) => ({ ...anteriores, [lado]: relojDeEmote(actualizada[lado], recibida) }));
      } catch (causa) {
        informarError(causa);
      } finally {
        emoteOcupado.current = false;
        setEnviandoEmote(false);
      }
    },
    [partida.id, informarError, pausada, cambiandoPausa, perdida],
  );

  async function cambiarPausa(valor: boolean): Promise<boolean> {
    if (ocupado.current || emoteOcupado.current || perdida) return false;
    ocupado.current = true;
    setCambiandoPausa(true);
    setError(null);
    try {
      const nueva = await pedirPausa(partida.id, valor);
      const recibida = Date.now();
      setPausada(nueva.pausada);
      setAhora(recibida);
      setRelojesDeEmote({ local: relojDeEmote(nueva.local, recibida), visitante: relojDeEmote(nueva.visitante, recibida) });
      if (jugada) {
        // Express ya tiene el final del tiro, pero la cancha debe conservar el cuadro pausado.
        setJugada({ respuesta: { ...jugada.respuesta, partida: nueva }, recibidaEn: recibida });
        setPartida((anterior) => ({ ...anterior, reloj: nueva.reloj }));
        setRespondidaEn(recibida);
      } else aplicar(nueva, recibida);
      return true;
    } catch (causa) {
      informarError(causa);
      // Una respuesta perdida puede ocultar una pausa aceptada. El modal permite reintentar.
      setPausada(true);
      return false;
    } finally {
      ocupado.current = false;
      setCambiandoPausa(false);
    }
  }

  async function abandonar(): Promise<boolean> {
    if (ocupado.current) return false;
    ocupado.current = true;
    setCambiandoPausa(true);
    try {
      await abandonarPartida(partida.id);
      return true;
    } catch (causa) {
      if (causa instanceof ErrorDeApi && causa.estado === 404) return true;
      informarError(causa);
      return false;
    } finally {
      ocupado.current = false;
      setCambiandoPausa(false);
    }
  }

  useEffect(() => {
    if (!libre || !leTocaAlServidor) return;
    const espera = setTimeout(
      () => void reproducir(() => jugarTurnoRival(partida.id)),
      PAUSA_DEL_RIVAL_MS,
    );
    return () => clearTimeout(espera);
  }, [libre, leTocaAlServidor, reproducir, partida.id]);

  useEffect(() => {
    if (pausada || cambiandoPausa || perdida) return;
    const intervalo = setInterval(() => setAhora(Date.now()), 250);
    return () => clearInterval(intervalo);
  }, [pausada, cambiandoPausa, perdida]);

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

  const emoteVisible = (lado: Lado) => (ahora < relojesDeEmote[lado].hasta ? relojesDeEmote[lado].id : null);
  const segundosDeEspera = (lado: Lado) =>
    Math.max(0, Math.ceil((relojesDeEmote[lado].esperaHasta - ahora) / 1000));

  return {
    partida,
    cuadro,
    rotacion,
    pausada,
    cambiandoPausa,
    puedePausar: !esperando && !enviandoEmote && !cambiandoPausa && !perdida,
    cambiarPausa,
    abandonar,
    animando: jugada !== null,
    puedeTirar: libre && !leTocaAlServidor,
    segundosDelTurno: jugada || esperando ? null : Math.max(0, Math.ceil(restanteDelTurno)),
    minutoDeJuego,
    eventos,
    error,
    perdida,
    tirar,
    emotes: { local: emoteVisible("local"), visitante: emoteVisible("visitante") },
    esperaEmote: { local: segundosDeEspera("local"), visitante: segundosDeEspera("visitante") },
    puedeLanzarEmote: partida.estado === "enJuego" && !perdida && !enviandoEmote && !pausada && !cambiandoPausa,
    lanzarEmote,
  };
}
