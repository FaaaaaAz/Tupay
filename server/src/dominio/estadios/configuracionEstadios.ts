import type { EfectoEstadio } from "../../../../compartido/catalogo.js";
import type { TipoCharco } from "../../../../compartido/partida.js";

// Todos los números de los estadios con efecto están aquí, igual que los de la física y las
// reglas. Qué efecto tiene cada estadio se define en `dominio/catalogo.ts`.

export interface ConfiguracionCharco {
  /** Medidas de la elipse, en unidades de cancha. */
  ancho: number;
  alto: number;
  /** Tiros que dura antes de secarse. */
  duracionTurnos: number;
  golpesParaLiberar: number;
  /** Fracción de la velocidad del choque con la que sale la pelota al liberarse. */
  impulsoAlLiberar: number;
}

export const CHARCOS: Record<TipoCharco, ConfiguracionCharco> = {
  agua: { ancho: 170, alto: 80, duracionTurnos: 2, golpesParaLiberar: 1, impulsoAlLiberar: 0.4 },
  nieve: { ancho: 170, alto: 80, duracionTurnos: 4, golpesParaLiberar: 2, impulsoAlLiberar: 0.25 },
};

export const APARICION_DE_CHARCOS = {
  /** Charcos que ya están en la cancha cuando empieza el partido. */
  alEmpezar: 2,
  /** Probabilidad de que aparezca uno nuevo después de cada tiro. */
  probabilidadPorTiro: 0.4,
  maximoEnCancha: 3,
  /** Distancia mínima entre un charco nuevo y la pelota, para no nacer debajo de ella. */
  separacionDeLaPelota: 40,
  intentosParaUbicarlo: 20,
} as const;

export const CHARCO_DE_CADA_EFECTO: Record<EfectoEstadio, TipoCharco | null> = {
  ninguno: null,
  charcosDeAgua: "agua",
  charcosDeNieve: "nieve",
};
