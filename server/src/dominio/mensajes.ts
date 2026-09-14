import { REGLAS } from "./reglas/configuracionReglas.js";

/** Todos los textos de error que ve el jugador, tal como figuran en `docs/reglas.md`. */
export const MENSAJES = {
  equiposRepetidos: "Elijan equipos distintos: todavía no hay camisetas alternativas",
  metaDeGolesInvalida: `Elige una meta de goles entre ${REGLAS.golesParaGanarMinimo} y ${REGLAS.golesParaGanarMaximo}`,
  configuracionInvalida: "La configuración de la partida no es válida",
  partidaInexistente: "Esa partida no existe",
  partidaTerminada: "La partida ya terminó",
  noEsTuTurno: "No es tu turno",
  tapitaRival: "Ese jugador no es tuyo",
  noEsTurnoDelRival: "Todavía no le toca al rival",
  temporadaInexistente: "Esa temporada no existe",
  partidoDeTemporadaInexistente: "Ese partido no está en la temporada",
  humanosInvalidos: "Elige uno o dos equipos para jugar la temporada",
  temporadaTerminada: "La temporada ya terminó",
  partidoYaJugado: "Ese partido ya se jugó",
  partidoSinPersonas: "En ese partido no juega nadie: lo resuelve el servidor",
  rivalSoloConDosJugadores: "Solo un segundo jugador puede tomar el control del rival",
  jornadaAnterior: (jornada: number) => `Primero hay que terminar la jornada ${jornada}`,
  tiempoAgotado: "Se acabó tu tiempo: pierdes el turno",
  tiroInvalido: "Tiro inválido",
  sinTirosDePoder: "Ya no te quedan tiros de poder",
  esperaEmote: "Espera unos segundos para volver a usar un emote",
  emoteInvalido: "Ese emote no existe",
  cuerpoNoJson: "El cuerpo de la solicitud no es JSON válido",
  rutaInexistente: "Ruta de API no encontrada",
  errorInterno: "Error interno del servidor",
} as const;
