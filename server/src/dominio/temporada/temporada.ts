import type { IdEquipo } from "../../../../compartido/catalogo.js";
import type {
  ConfiguracionJugador,
  Dificultad,
  Marcador,
  PeticionCrearPartida,
} from "../../../../compartido/partida.js";
import type {
  ControlDelRival,
  EstadoTemporada,
  PartidoDeTemporada,
  PeticionCrearTemporada,
  Temporada,
} from "../../../../compartido/temporada.js";
import { crearAzar, type Azar } from "../../utilidades/azar.js";
import { EQUIPOS } from "../catalogo.js";
import { ErrorDeJuego } from "../errores.js";
import { MENSAJES } from "../mensajes.js";
import { REGLAS } from "../reglas/configuracionReglas.js";
import { validarOpcionesDePrueba } from "../reglas/partida.js";
import { barajar, generarCalendario } from "./calendario.js";
import { simularMarcador } from "./marcadorSimulado.js";
import { calcularTabla } from "./tabla.js";

/** Lo que el servidor guarda de cada temporada. El cliente recibe `aTemporadaPublica`. */
export interface RegistroTemporada {
  id: string;
  equipos: IdEquipo[];
  /** Orden sorteado con la semilla: arma el calendario y desempata la tabla cuando todo lo demás es igual. */
  sorteo: IdEquipo[];
  humanos: IdEquipo[];
  partidos: PartidoDeTemporada[];
  estado: EstadoTemporada;
  /** Con esto se arma cada partida que se juega dentro de la temporada. */
  configuracion: {
    dificultad: Dificultad;
    perroActivo: boolean;
    duracionRealSegundos?: number;
    limiteTurnoSegundos?: number;
    probabilidadPerro?: number;
  };
  azar: Azar;
}

export function crearRegistroTemporada(
  peticion: PeticionCrearTemporada,
  id: string,
  semilla: number,
): RegistroTemporada {
  const equipos = peticion.equipos ?? (Object.keys(EQUIPOS) as IdEquipo[]);
  validarTemporada(equipos, peticion);

  const azar = crearAzar(semilla);
  const sorteo = barajar(equipos, azar);
  const partidos = generarCalendario(sorteo).map(
    (cruce, indice): PartidoDeTemporada => ({
      id: `partido-${indice + 1}`,
      ...cruce,
      estado: "pendiente",
      marcador: null,
      partida: null,
    }),
  );

  const registro: RegistroTemporada = {
    id,
    equipos: [...equipos],
    sorteo,
    humanos: [...peticion.humanos],
    partidos,
    estado: "enCurso",
    configuracion: {
      dificultad: peticion.dificultad ?? REGLAS.dificultadPorDefecto,
      perroActivo: peticion.perroActivo ?? true,
      duracionRealSegundos: peticion.duracionRealSegundos,
      limiteTurnoSegundos: peticion.limiteTurnoSegundos,
      probabilidadPerro: peticion.probabilidadPerro,
    },
    azar,
  };
  // Con una cantidad impar de equipos, una persona puede descansar justo en la primera jornada.
  avanzarTemporada(registro);
  return registro;
}

export function involucraAUnaPersona(registro: RegistroTemporada, partido: PartidoDeTemporada): boolean {
  return registro.humanos.includes(partido.local) || registro.humanos.includes(partido.visitante);
}

/** La primera jornada con algún partido sin resultado, o `null` si ya no queda ninguna. */
export function jornadaActual(registro: RegistroTemporada): number | null {
  const sinResultado = registro.partidos.filter((partido) => !tieneResultado(partido));
  return sinResultado.length === 0 ? null : Math.min(...sinResultado.map((partido) => partido.jornada));
}

/** Los partidos de la jornada actual que todavía tiene que jugar alguna persona. */
export function proximosPartidos(registro: RegistroTemporada): PartidoDeTemporada[] {
  const jornada = jornadaActual(registro);
  return registro.partidos.filter(
    (partido) =>
      partido.jornada === jornada && !tieneResultado(partido) && involucraAUnaPersona(registro, partido),
  );
}

/**
 * Cierra las jornadas en las que las personas ya jugaron: los partidos que quedan se resuelven
 * con la semilla. Cuando no queda ninguna jornada, termina la temporada.
 */
export function avanzarTemporada(registro: RegistroTemporada): void {
  let jornada = jornadaActual(registro);
  while (jornada !== null && proximosPartidos(registro).length === 0) {
    for (const partido of registro.partidos) {
      if (partido.jornada === jornada && partido.estado === "pendiente") {
        partido.marcador = simularMarcador(registro.azar);
        partido.estado = "simulado";
      }
    }
    jornada = jornadaActual(registro);
  }
  if (jornada === null) registro.estado = "finalizada";
}

/**
 * Arma la partida de Liga para jugar un partido de la temporada. Es una partida común:
 * la temporada solo decide quién maneja a cada equipo.
 */
export function peticionParaJugar(
  registro: RegistroTemporada,
  partido: PartidoDeTemporada,
  rivalControladoPor?: ControlDelRival,
): PeticionCrearPartida {
  validarQueSePuedeJugar(registro, partido, rivalControladoPor);

  const { dificultad, perroActivo, duracionRealSegundos, limiteTurnoSegundos, probabilidadPerro } =
    registro.configuracion;
  const jugador = (equipo: IdEquipo): ConfiguracionJugador =>
    registro.humanos.includes(equipo) || rivalControladoPor === "humano"
      ? { equipo, tipo: "humano" }
      : { equipo, tipo: "servidor", dificultad };

  return {
    modo: "liga",
    local: jugador(partido.local),
    visitante: jugador(partido.visitante),
    perroActivo,
    duracionRealSegundos,
    limiteTurnoSegundos,
    probabilidadPerro,
    semilla: Math.floor(registro.azar() * 2 ** 32),
  };
}

export function empezarPartido(partido: PartidoDeTemporada, partidaId: string): void {
  partido.estado = "enJuego";
  partido.partida = partidaId;
}

export function registrarResultado(partido: PartidoDeTemporada, marcador: Marcador): void {
  partido.estado = "jugado";
  partido.marcador = { ...marcador };
}

/** La partida se perdió, por ejemplo en un reinicio del servidor: el partido se vuelve a jugar. */
export function reiniciarPartido(partido: PartidoDeTemporada): void {
  partido.estado = "pendiente";
  partido.partida = null;
}

export function aTemporadaPublica(registro: RegistroTemporada): Temporada {
  // En el orden del sorteo: si dos equipos empatan en todo, no gana siempre el primero del catálogo.
  const tabla = calcularTabla(registro.sorteo, registro.partidos);
  return {
    id: registro.id,
    equipos: [...registro.equipos],
    humanos: [...registro.humanos],
    partidos: registro.partidos.map((partido) => ({
      ...partido,
      marcador: partido.marcador && { ...partido.marcador },
    })),
    tabla,
    jornadaActual: jornadaActual(registro),
    totalDeJornadas: Math.max(...registro.partidos.map((partido) => partido.jornada)),
    proximosPartidos: proximosPartidos(registro).map((partido) => partido.id),
    estado: registro.estado,
    campeon: registro.estado === "finalizada" ? tabla[0].equipo : null,
  };
}

function tieneResultado(partido: PartidoDeTemporada): boolean {
  return partido.estado === "jugado" || partido.estado === "simulado";
}

function validarTemporada(equipos: IdEquipo[], peticion: PeticionCrearTemporada): void {
  const { humanos } = peticion;
  if (humanos.length < 1 || humanos.length > 2) {
    throw new ErrorDeJuego(MENSAJES.humanosInvalidos);
  }
  if (new Set(humanos).size !== humanos.length) {
    throw new ErrorDeJuego(MENSAJES.equiposRepetidos);
  }

  const equiposValidos =
    equipos.length >= 2 &&
    new Set(equipos).size === equipos.length &&
    humanos.every((humano) => equipos.includes(humano));
  if (!equiposValidos) throw new ErrorDeJuego(MENSAJES.configuracionInvalida);

  validarOpcionesDePrueba(peticion);
}

function validarQueSePuedeJugar(
  registro: RegistroTemporada,
  partido: PartidoDeTemporada,
  rivalControladoPor?: ControlDelRival,
): void {
  if (registro.estado === "finalizada") {
    throw new ErrorDeJuego(MENSAJES.temporadaTerminada, 409);
  }
  if (tieneResultado(partido)) {
    throw new ErrorDeJuego(MENSAJES.partidoYaJugado, 409);
  }
  if (!involucraAUnaPersona(registro, partido)) {
    throw new ErrorDeJuego(MENSAJES.partidoSinPersonas);
  }
  if (!proximosPartidos(registro).includes(partido)) {
    throw new ErrorDeJuego(MENSAJES.jornadaAnterior(jornadaActual(registro) ?? partido.jornada));
  }
  if (rivalControladoPor === "humano" && registro.humanos.length < 2) {
    throw new ErrorDeJuego(MENSAJES.rivalSoloConDosJugadores);
  }
}
