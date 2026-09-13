import type { IdEmote, IdEquipo, IdEstadio } from "./catalogo.js";
import type { Vector } from "./geometria.js";

export type Lado = "local" | "visitante";
export type Modo = "eliminatoria" | "liga";
export type TipoJugador = "humano" | "servidor";
export type Dificultad = "facil" | "medio" | "dificil";
export type EstadoPartida = "enJuego" | "finalizada";
export type TipoCharco = "agua" | "nieve";

/**
 * Medidas de la cancha en unidades del servidor. El cliente las recibe y escala
 * el SVG a la pantalla, así no hay ningún número de la cancha escrito en React.
 */
export interface Cancha {
  ancho: number;
  alto: number;
  /** Alto de la boca del arco, centrada en cada lado corto. */
  altoDelArco: number;
  radioTapita: number;
  radioPelota: number;
}

export interface Tapita {
  id: string;
  lado: Lado;
  posicion: Vector;
}

export interface Pelota {
  posicion: Vector;
  /** Charco donde quedó atrapada, o `null` si está libre. */
  atrapadaEn: string | null;
  /** Choques que faltan para liberarla. `0` cuando está libre. */
  golpesParaLiberar: number;
}

export interface Charco {
  id: string;
  tipo: TipoCharco;
  posicion: Vector;
  radio: number;
  turnosRestantes: number;
}

export interface EmoteActivo {
  id: IdEmote;
  segundosRestantes: number;
}

export interface Jugador {
  lado: Lado;
  equipo: IdEquipo;
  tipo: TipoJugador;
  /** Solo cuando `tipo` es `"servidor"`. */
  dificultad: Dificultad | null;
  tirosDePoder: number;
  emote: EmoteActivo | null;
  /** Segundos que faltan para poder lanzar otro emote. `0` si ya puede. */
  esperaEmote: number;
}

export interface Marcador {
  local: number;
  visitante: number;
}

export interface Turno {
  lado: Lado;
  segundosRestantes: number;
}

export interface Perro {
  activo: boolean;
  apariciones: number;
}

/** Solo en modo Liga: los 90 minutos de juego y cuánto tiempo real queda. */
export interface Reloj {
  minutoDeJuego: number;
  segundosRealesRestantes: number;
}

export interface Resultado {
  /** `null` significa empate, posible únicamente en Liga. */
  ganador: Lado | null;
  marcador: Marcador;
}

/** Estado completo de un partido. Es lo que devuelven todos los endpoints de partida. */
export interface Partida {
  id: string;
  modo: Modo;
  estado: EstadoPartida;
  estadio: IdEstadio;
  cancha: Cancha;
  local: Jugador;
  visitante: Jugador;
  tapitas: Tapita[];
  pelota: Pelota;
  charcos: Charco[];
  turno: Turno;
  marcador: Marcador;
  perro: Perro;
  /** Solo en Eliminatoria; `null` en Liga. */
  golesParaGanar: number | null;
  /** Solo en Liga; `null` en Eliminatoria. */
  reloj: Reloj | null;
  /** `null` mientras el partido sigue en juego. */
  resultado: Resultado | null;
}

export interface ConfiguracionJugador {
  equipo: IdEquipo;
  tipo: TipoJugador;
  dificultad?: Dificultad;
}

/** Valores opcionales que hacen repetibles y cortas las pruebas E2E. */
export interface OpcionesDePrueba {
  semilla?: number;
  duracionRealSegundos?: number;
  limiteTurnoSegundos?: number;
  probabilidadPerro?: number;
  duracionEmoteSegundos?: number;
  esperaEmoteSegundos?: number;
}

export interface PeticionCrearPartida extends OpcionesDePrueba {
  modo: Modo;
  local: ConfiguracionJugador;
  visitante: ConfiguracionJugador;
  /** Por defecto, el estadio del equipo local. */
  estadio?: IdEstadio;
  /** Por defecto `true`. */
  perroActivo?: boolean;
  /** Solo en Eliminatoria: de 1 a 5, por defecto 3. */
  golesParaGanar?: number;
}

export interface PeticionTiro {
  /** Quién tira. Permite distinguir "no es tu turno" de "ese jugador no es tuyo". */
  lado: Lado;
  /** Id de una tapita propia. */
  tapita: string;
  /** El servidor solo usa su dirección; no hace falta que venga normalizada. */
  direccion: Vector;
  /** Proporción de la fuerza máxima, de 0 a 1. */
  fuerza: number;
  /** Por defecto `false`. */
  tiroDePoder?: boolean;
}

/**
 * Un instante del recorrido. Las posiciones de `tapitas` van en el mismo orden
 * que `Partida.tapitas`: repetir los identificadores en cada cuadro multiplicaría
 * el tamaño de la respuesta sin agregar información.
 */
export interface Cuadro {
  tapitas: Vector[];
  pelota: Vector;
  /** Posición del perro mientras está en la cancha. */
  perro: Vector | null;
}

export type Evento =
  | { tipo: "gol"; lado: Lado }
  | { tipo: "perro"; posicionPelota: Vector; turnoPara: Lado }
  | { tipo: "pelotaAtrapada"; charco: string; tipoCharco: TipoCharco }
  | { tipo: "pelotaLiberada" }
  | { tipo: "turnoPerdido"; lado: Lado }
  | { tipo: "finDelPartido"; resultado: Resultado };

export interface RespuestaTiro {
  recorrido: Cuadro[];
  eventos: Evento[];
  /** Estado confirmado por el servidor, que React aplica al terminar la animación. */
  partida: Partida;
}

export interface PeticionEmote {
  lado: Lado;
  emote: IdEmote;
}
