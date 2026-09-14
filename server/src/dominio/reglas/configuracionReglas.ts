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
  /** Cuánto dura la carita sobre las tapitas. */
  duracionEmoteSegundos: 5,
  /** Cuánto hay que esperar, desde que se lanzó, para lanzar otro emote. */
  esperaEmoteSegundos: 15,
} as const;

/** Cómo juega el servidor en el modo de 1 jugador. */
export const RIVAL = {
  /**
   * Cuántos tiros prueba antes de elegir y cuánto falla al ejecutar el elegido. El error es el
   * desvío máximo de la dirección, en radianes.
   */
  dificultades: {
    facil: { candidatos: 3, errorDePunteria: 0.3 },
    medio: { candidatos: 12, errorDePunteria: 0.12 },
    dificil: { candidatos: 36, errorDePunteria: 0.04 },
  },
  /** Velocidad con la que intenta llegar a la pelota, en unidades por segundo. */
  velocidadAlLlegar: 900,
  /** Cuánto se apartan de un tiro de billar los candidatos que no son de billar puro. */
  desvioDeCandidatos: 0.4,
  variacionDeFuerza: 0.3,
  fuerzaMinima: 0.2,
  /** Cómo califica el resultado simulado de cada candidato. */
  puntuacion: {
    gol: 1000,
    /** Por llevar la pelota de su propio arco hasta el arco rival. */
    avance: 100,
    /** Castigo máximo por dejar la pelota pegada a su propio arco. */
    peligro: 150,
    /** Desde esta distancia a su arco la pelota empieza a considerarse peligrosa. */
    distanciaDePeligro: 350,
  },
} as const;

export const TEMPORADA = {
  puntosPorVictoria: 3,
  puntosPorEmpate: 1,
  /** Probabilidad de que un equipo haga 0, 1, 2, 3 o 4 goles en un partido simulado. */
  probabilidadDeGoles: [0.28, 0.34, 0.22, 0.11, 0.05],
} as const;
