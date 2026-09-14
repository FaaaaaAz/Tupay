import type { IdEmote, IdEquipo, IdEstadio } from "../../../../compartido/catalogo.js";
import type { Vector } from "../../../../compartido/geometria.js";
import type {
  Charco,
  ConfiguracionJugador,
  Dificultad,
  EstadoPartida,
  Lado,
  Marcador,
  Modo,
  OpcionesDePrueba,
  PeticionCrearPartida,
  Resultado,
  Tapita,
  TipoJugador,
} from "../../../../compartido/partida.js";
import { crearAzar, type Azar } from "../../utilidades/azar.js";
import { EQUIPOS } from "../catalogo.js";
import { crearCharcosIniciales } from "../estadios/charcos.js";
import { ErrorDeJuego } from "../errores.js";
import type { PelotaAtrapada } from "../fisica/charcos.js";
import { MENSAJES } from "../mensajes.js";
import { REGLAS } from "./configuracionReglas.js";
import { CENTRO_DE_LA_CANCHA, formacionInicial } from "./formacion.js";

export interface JugadorInterno {
  equipo: IdEquipo;
  tipo: TipoJugador;
  dificultad: Dificultad | null;
  tirosDePoder: number;
  /** Último emote lanzado y cuándo. De ahí salen su duración y la espera para el siguiente. */
  emote: { id: IdEmote; desde: number } | null;
}

/**
 * Lo que el servidor guarda de cada partido. El cliente nunca lo ve tal cual: recibe
 * `aPartidaPublica`. Aquí los tiempos son instantes en milisegundos, y los segundos
 * restantes se calculan en el momento de cada consulta.
 */
export interface RegistroPartida {
  id: string;
  pausadaDesde: number | null;
  modo: Modo;
  estado: EstadoPartida;
  estadio: IdEstadio;
  jugadores: Record<Lado, JugadorInterno>;
  tapitas: Tapita[];
  pelota: Vector;
  /** `null` mientras la pelota está libre. */
  pelotaAtrapada: PelotaAtrapada | null;
  charcos: Charco[];
  /** Para darle a cada charco un id que no se repita en la partida. */
  charcosCreados: number;
  marcador: Marcador;
  turno: Lado;
  /** Cuándo empieza a correr el turno. Queda en el futuro mientras se anima el tiro anterior. */
  inicioTurno: number;
  limiteTurnoMs: number;
  /** Último lado que dejó vencer su turno, para avisarle si intenta tirar tarde. */
  turnoVencido: Lado | null;
  /** Solo en Eliminatoria. */
  golesParaGanar: number | null;
  /** Solo en Liga. */
  reloj: { inicio: number; duracionMs: number } | null;
  perro: { activo: boolean; probabilidad: number; apariciones: number };
  emotes: { duracionMs: number; esperaMs: number };
  resultado: Resultado | null;
  azar: Azar;
}

export function crearRegistro(
  peticion: PeticionCrearPartida,
  id: string,
  ahora: number,
  semilla: number,
): RegistroPartida {
  validarConfiguracion(peticion);
  const azar = crearAzar(semilla);
  const esLiga = peticion.modo === "liga";
  const duracionLigaSegundos = peticion.duracionRealSegundos ?? REGLAS.duracionLigaSegundos;

  const registro: RegistroPartida = {
    id,
    pausadaDesde: null,
    modo: peticion.modo,
    estado: "enJuego",
    estadio: peticion.estadio ?? EQUIPOS[peticion.local.equipo].estadio,
    jugadores: {
      local: crearJugador(peticion.local),
      visitante: crearJugador(peticion.visitante),
    },
    tapitas: formacionInicial(),
    pelota: CENTRO_DE_LA_CANCHA,
    pelotaAtrapada: null,
    charcos: [],
    charcosCreados: 0,
    marcador: { local: 0, visitante: 0 },
    turno: azar() < 0.5 ? "local" : "visitante",
    inicioTurno: ahora,
    limiteTurnoMs: (peticion.limiteTurnoSegundos ?? REGLAS.limiteTurnoSegundos) * 1000,
    turnoVencido: null,
    golesParaGanar: esLiga ? null : (peticion.golesParaGanar ?? REGLAS.golesParaGanarPorDefecto),
    reloj: esLiga ? { inicio: ahora, duracionMs: duracionLigaSegundos * 1000 } : null,
    perro: {
      activo: peticion.perroActivo ?? true,
      probabilidad: peticion.probabilidadPerro ?? REGLAS.probabilidadPerro,
      apariciones: 0,
    },
    emotes: {
      duracionMs: (peticion.duracionEmoteSegundos ?? REGLAS.duracionEmoteSegundos) * 1000,
      esperaMs: (peticion.esperaEmoteSegundos ?? REGLAS.esperaEmoteSegundos) * 1000,
    },
    resultado: null,
    azar,
  };
  // Después del sorteo del saque: así los charcos no cambian quién saca con cada semilla.
  crearCharcosIniciales(registro);
  return registro;
}

/** Cierra el partido y decide el resultado por el marcador. En Liga puede ser empate. */
export function finalizar(registro: RegistroPartida): Resultado {
  const { local, visitante } = registro.marcador;
  let ganador: Lado | null = null;
  if (local > visitante) ganador = "local";
  else if (visitante > local) ganador = "visitante";

  registro.estado = "finalizada";
  registro.resultado = { ganador, marcador: { local, visitante } };
  return registro.resultado;
}

function validarConfiguracion(peticion: PeticionCrearPartida): void {
  if (peticion.local.equipo === peticion.visitante.equipo) {
    throw new ErrorDeJuego(MENSAJES.equiposRepetidos);
  }

  const meta = peticion.golesParaGanar;
  const metaFueraDeRango =
    meta !== undefined &&
    (!Number.isInteger(meta) ||
      meta < REGLAS.golesParaGanarMinimo ||
      meta > REGLAS.golesParaGanarMaximo);
  if (peticion.modo === "eliminatoria" && metaFueraDeRango) {
    throw new ErrorDeJuego(MENSAJES.metaDeGolesInvalida);
  }

  validarOpcionesDePrueba(peticion);
}

/** Las opciones de prueba pueden faltar, pero si vienen: duraciones positivas y probabilidad entre 0 y 1. */
export function validarOpcionesDePrueba(opciones: OpcionesDePrueba): void {
  const { probabilidadPerro } = opciones;
  const duraciones = [
    opciones.duracionRealSegundos,
    opciones.limiteTurnoSegundos,
    opciones.duracionEmoteSegundos,
    opciones.esperaEmoteSegundos,
  ];
  const duracionesValidas = duraciones.every((valor) => valor === undefined || valor > 0);
  const probabilidadValida =
    probabilidadPerro === undefined || (probabilidadPerro >= 0 && probabilidadPerro <= 1);
  if (!duracionesValidas || !probabilidadValida) {
    throw new ErrorDeJuego(MENSAJES.configuracionInvalida);
  }
}

function crearJugador({ equipo, tipo, dificultad }: ConfiguracionJugador): JugadorInterno {
  return {
    equipo,
    tipo,
    dificultad: tipo === "servidor" ? (dificultad ?? REGLAS.dificultadPorDefecto) : null,
    tirosDePoder: REGLAS.tirosDePoderPorPartido,
    emote: null,
  };
}
