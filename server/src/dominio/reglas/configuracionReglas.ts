// Todos los números de las reglas están aquí, igual que los de la física están en
// `fisica/configuracionFisica.ts`. Son los valores que se cambian en la defensa.

export const REGLAS = {
  golesParaGanarPorDefecto: 3,
  golesParaGanarMinimo: 1,
  golesParaGanarMaximo: 5,
  limiteTurnoSegundos: 15,
  /** Tiempo real que duran los 90 minutos de un partido de Liga. */
  duracionLigaSegundos: 300,
  minutosDeJuego: 90,
  tirosDePoderPorPartido: 2,
  multiplicadorTiroDePoder: 1.5,
  probabilidadPerro: 0.12,
  aparicionesMaximasDelPerro: 5,
  dificultadPorDefecto: "medio",
} as const;

/** Cómo juega el servidor en el modo de 1 jugador. */
export const RIVAL = {
  /** Error máximo de puntería, en radianes: cuanto más alto, más falla. */
  errorDePunteria: { facil: 0.35, medio: 0.18, dificil: 0.06 },
  /** Velocidad con la que intenta llegar a la pelota, en unidades por segundo. */
  velocidadAlLlegar: 900,
  /** Variación al azar de la fuerza, para que no tire siempre igual. */
  variacionDeFuerza: 0.1,
} as const;

export const TEMPORADA = {
  puntosPorVictoria: 3,
  puntosPorEmpate: 1,
  /** Probabilidad de que un equipo haga 0, 1, 2, 3 o 4 goles en un partido simulado. */
  probabilidadDeGoles: [0.28, 0.34, 0.22, 0.11, 0.05],
} as const;
