import type { IdEquipo } from "./catalogo.js";
import type { Marcador, Modo, OpcionesDePrueba } from "./partida.js";

export type EstadoJornada = "pendiente" | "enJuego" | "jugada" | "simulada";
export type EstadoTemporada = "enCurso" | "finalizada";

/**
 * Un partido del calendario. `jugada` significa que lo jugó una persona con la
 * física completa; `simulada`, que se resolvió con la semilla porque no
 * participaba ningún humano.
 */
export interface Jornada {
  id: string;
  numero: number;
  local: IdEquipo;
  visitante: IdEquipo;
  estado: EstadoJornada;
  marcador: Marcador | null;
  /** Id de la partida creada, cuando la juega una persona. */
  partida: string | null;
}

export interface FilaTabla {
  equipo: IdEquipo;
  jugados: number;
  ganados: number;
  empatados: number;
  perdidos: number;
  golesAFavor: number;
  golesEnContra: number;
  diferencia: number;
  puntos: number;
}

export interface Temporada {
  id: string;
  equipos: IdEquipo[];
  /** Equipos controlados por personas: uno o dos. */
  humanos: IdEquipo[];
  jornadas: Jornada[];
  /** Ordenada por puntos, diferencia de goles y goles a favor. */
  tabla: FilaTabla[];
  estado: EstadoTemporada;
  campeon: IdEquipo | null;
}

export interface PeticionCrearTemporada extends OpcionesDePrueba {
  /** Por defecto, los diez equipos del catálogo. */
  equipos?: IdEquipo[];
  humanos: IdEquipo[];
  perroActivo?: boolean;
}

/**
 * Antes de una jornada donde solo hay un equipo humano, el segundo jugador puede
 * tomar el control del rival en vez de dejarlo en manos del servidor.
 */
export interface PeticionJugarJornada {
  rivalControladoPor?: "servidor" | "humano";
}

export interface RespuestaJugarJornada {
  jornada: Jornada;
  temporada: Temporada;
  /** Modo con el que se creó la partida, cuando la juega una persona. */
  modo: Modo | null;
}
