import type { EfectoEstadio, IdEmote } from "../../../compartido/catalogo.js";
import type { Dificultad } from "../../../compartido/partida.js";

/** El valor es la duración real del partido, en segundos. */
export const DURACIONES_DE_LIGA = [
  { valor: 150, texto: "2 min 30 s" },
  { valor: 300, texto: "5 minutos" },
  { valor: 600, texto: "10 minutos" },
];

export const JUGADORES_DE_PARTIDA: { valor: 1 | 2; texto: string }[] = [
  { valor: 1, texto: "1 jugador contra el servidor" },
  { valor: 2, texto: "2 jugadores en este dispositivo" },
];

export const JUGADORES_DE_TEMPORADA: { valor: 1 | 2; texto: string }[] = [
  { valor: 1, texto: "1 jugador" },
  { valor: 2, texto: "2 jugadores en este dispositivo" },
];

export const DIFICULTADES: { valor: Dificultad; texto: string }[] = [
  { valor: "facil", texto: "Fácil" },
  { valor: "medio", texto: "Medio" },
  { valor: "dificil", texto: "Difícil" },
];

/** En el orden en que aparecen en la barra: de lo más contento a lo más aburrido. */
export const EMOTES: { valor: IdEmote; texto: string }[] = [
  { valor: "felizEuforico", texto: "Feliz eufórico" },
  { valor: "feliz", texto: "Feliz" },
  { valor: "sorprendido", texto: "Sorprendido" },
  { valor: "enojado", texto: "Enojado" },
  { valor: "enojadoSerio", texto: "Enojado serio" },
  { valor: "llorando", texto: "Llorando" },
  { valor: "dormido", texto: "Dormido" },
];

export const DESCRIPCION_DE_EFECTO: Record<EfectoEstadio, string> = {
  ninguno: "Cancha soleada y tranquila: sin efecto especial.",
  charcosDeAgua: "Charcos de agua: atrapan la pelota y un golpe la saca, pero con poco impulso.",
  charcosDeNieve: "Charcos de nieve: atrapan la pelota y hacen falta dos golpes para sacarla.",
};
