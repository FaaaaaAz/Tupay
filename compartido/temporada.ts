import type { IdEquipo } from "./catalogo.js";
import type { Dificultad, Marcador, OpcionesDePrueba, Partida } from "./partida.js";

export type EstadoPartidoDeTemporada = "pendiente" | "enJuego" | "jugado" | "simulado";
export type EstadoTemporada = "enCurso" | "finalizada";
export type ControlDelRival = "servidor" | "humano";

/**
 * Un partido del calendario. En cada jornada todos los equipos juegan una vez. `jugado`
 * significa que lo jugó una persona con la física completa; `simulado`, que se resolvió con
 * la semilla porque no participaba ninguna.
 */
export interface PartidoDeTemporada {
  id: string;
  jornada: number;
  local: IdEquipo;
  visitante: IdEquipo;
  estado: EstadoPartidoDeTemporada;
  marcador: Marcador | null;
  /** Id de la partida creada para jugarlo, cuando participa una persona. */
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
  partidos: PartidoDeTemporada[];
  /** Ordenada por puntos, diferencia de goles y goles a favor. */
  tabla: FilaTabla[];
  /** `null` cuando ya se jugaron todas. */
  jornadaActual: number | null;
  totalDeJornadas: number;
  /** Ids de los partidos que las personas pueden jugar ahora. */
  proximosPartidos: string[];
  estado: EstadoTemporada;
  campeon: IdEquipo | null;
}

export interface PeticionCrearTemporada extends OpcionesDePrueba {
  /** Por defecto, los diez equipos del catálogo. */
  equipos?: IdEquipo[];
  humanos: IdEquipo[];
  /** Dificultad de los rivales que maneja el servidor. Por defecto, medio. */
  dificultad?: Dificultad;
  /** Por defecto `true`. */
  perroActivo?: boolean;
}

/** Con dos personas, antes de enfrentar a un equipo de nadie, el segundo jugador puede tomarlo. */
export interface PeticionJugarPartidoDeTemporada {
  rivalControladoPor?: ControlDelRival;
}

export interface RespuestaJugarPartidoDeTemporada {
  temporada: Temporada;
  /** La partida recién creada, lista para abrir la cancha. */
  partida: Partida;
}
