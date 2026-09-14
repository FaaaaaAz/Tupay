import type { IdEquipo } from "../../../compartido/catalogo.js";
import type { Vector } from "../../../compartido/geometria.js";
import type {
  ConfiguracionJugador,
  Dificultad,
  Lado,
  Modo,
  OpcionesDePrueba,
  PeticionCrearPartida,
  PeticionEmote,
  PeticionTiro,
  TipoJugador,
} from "../../../compartido/partida.js";
import type {
  ControlDelRival,
  PeticionCrearTemporada,
  PeticionJugarPartidoDeTemporada,
} from "../../../compartido/temporada.js";
import { esIdEmote, esIdEquipo, esIdEstadio } from "../dominio/catalogo.js";
import { ErrorDeJuego } from "../dominio/errores.js";
import { MENSAJES } from "../dominio/mensajes.js";

// Aquí solo se comprueba que el JSON tenga la forma del contrato. Si además respeta
// las reglas del juego (equipos distintos, fuerza en rango, turno…) lo decide el dominio.

type Guardia<T> = (valor: unknown) => valor is T;

const esObjeto = (valor: unknown): valor is Record<string, unknown> =>
  typeof valor === "object" && valor !== null && !Array.isArray(valor);

const esNumero = (valor: unknown): valor is number =>
  typeof valor === "number" && Number.isFinite(valor);

const esBooleano = (valor: unknown): valor is boolean => typeof valor === "boolean";

const esTexto = (valor: unknown): valor is string => typeof valor === "string";

const esVector = (valor: unknown): valor is Vector =>
  esObjeto(valor) && esNumero(valor.x) && esNumero(valor.y);

const esListaDeEquipos = (valor: unknown): valor is IdEquipo[] =>
  Array.isArray(valor) && valor.every(esIdEquipo);

function esUnoDe<T extends string>(opciones: readonly T[]): Guardia<T> {
  return (valor): valor is T =>
    typeof valor === "string" && (opciones as readonly string[]).includes(valor);
}

const esModo = esUnoDe<Modo>(["eliminatoria", "liga"]);
const esTipoJugador = esUnoDe<TipoJugador>(["humano", "servidor"]);
const esDificultad = esUnoDe<Dificultad>(["facil", "medio", "dificil"]);
const esLado = esUnoDe<Lado>(["local", "visitante"]);
const esControlDelRival = esUnoDe<ControlDelRival>(["servidor", "humano"]);

/** Un campo que puede faltar, pero que si viene debe tener el tipo correcto. */
function opcional<T>(valor: unknown, esValido: Guardia<T>, mensaje: string): T | undefined {
  if (valor === undefined) return undefined;
  if (!esValido(valor)) throw new ErrorDeJuego(mensaje);
  return valor;
}

function leerOpcionesDePrueba(cuerpo: Record<string, unknown>, mensaje: string): OpcionesDePrueba {
  return {
    semilla: opcional(cuerpo.semilla, esNumero, mensaje),
    duracionRealSegundos: opcional(cuerpo.duracionRealSegundos, esNumero, mensaje),
    limiteTurnoSegundos: opcional(cuerpo.limiteTurnoSegundos, esNumero, mensaje),
    probabilidadPerro: opcional(cuerpo.probabilidadPerro, esNumero, mensaje),
    duracionEmoteSegundos: opcional(cuerpo.duracionEmoteSegundos, esNumero, mensaje),
    esperaEmoteSegundos: opcional(cuerpo.esperaEmoteSegundos, esNumero, mensaje),
  };
}

export function leerPeticionCrearPartida(cuerpo: unknown): PeticionCrearPartida {
  const mensaje = MENSAJES.configuracionInvalida;
  if (!esObjeto(cuerpo)) throw new ErrorDeJuego(mensaje);

  const { modo } = cuerpo;
  if (!esModo(modo)) throw new ErrorDeJuego(mensaje);

  return {
    modo,
    local: leerJugador(cuerpo.local),
    visitante: leerJugador(cuerpo.visitante),
    estadio: opcional(cuerpo.estadio, esIdEstadio, mensaje),
    perroActivo: opcional(cuerpo.perroActivo, esBooleano, mensaje),
    golesParaGanar: opcional(cuerpo.golesParaGanar, esNumero, mensaje),
    ...leerOpcionesDePrueba(cuerpo, mensaje),
  };
}

export function leerPeticionTiro(cuerpo: unknown): PeticionTiro {
  const mensaje = MENSAJES.tiroInvalido;
  if (!esObjeto(cuerpo)) throw new ErrorDeJuego(mensaje);

  const { lado, tapita, direccion, fuerza, tiroDePoder } = cuerpo;
  if (!esLado(lado) || !esTexto(tapita) || !esVector(direccion) || !esNumero(fuerza)) {
    throw new ErrorDeJuego(mensaje);
  }

  return {
    lado,
    tapita,
    direccion: { x: direccion.x, y: direccion.y },
    fuerza,
    tiroDePoder: opcional(tiroDePoder, esBooleano, mensaje),
  };
}

export function leerPeticionEmote(cuerpo: unknown): PeticionEmote {
  const mensaje = MENSAJES.emoteInvalido;
  if (!esObjeto(cuerpo)) throw new ErrorDeJuego(mensaje);

  const { lado, emote } = cuerpo;
  if (!esLado(lado) || !esIdEmote(emote)) throw new ErrorDeJuego(mensaje);

  return { lado, emote };
}

export function leerPeticionCrearTemporada(cuerpo: unknown): PeticionCrearTemporada {
  const mensaje = MENSAJES.configuracionInvalida;
  if (!esObjeto(cuerpo)) throw new ErrorDeJuego(mensaje);

  const { humanos } = cuerpo;
  if (!esListaDeEquipos(humanos)) throw new ErrorDeJuego(mensaje);

  return {
    humanos,
    equipos: opcional(cuerpo.equipos, esListaDeEquipos, mensaje),
    dificultad: opcional(cuerpo.dificultad, esDificultad, mensaje),
    perroActivo: opcional(cuerpo.perroActivo, esBooleano, mensaje),
    ...leerOpcionesDePrueba(cuerpo, mensaje),
  };
}

export function leerPeticionJugarPartido(cuerpo: unknown): PeticionJugarPartidoDeTemporada {
  const mensaje = MENSAJES.configuracionInvalida;
  const datos = cuerpo ?? {};
  if (!esObjeto(datos)) throw new ErrorDeJuego(mensaje);

  return { rivalControladoPor: opcional(datos.rivalControladoPor, esControlDelRival, mensaje) };
}

function leerJugador(valor: unknown): ConfiguracionJugador {
  const mensaje = MENSAJES.configuracionInvalida;
  if (!esObjeto(valor)) throw new ErrorDeJuego(mensaje);

  const { equipo, tipo, dificultad } = valor;
  if (!esIdEquipo(equipo) || !esTipoJugador(tipo)) throw new ErrorDeJuego(mensaje);

  return { equipo, tipo, dificultad: opcional(dificultad, esDificultad, mensaje) };
}
