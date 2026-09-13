import type { Dificultad } from "../../../compartido/partida.js";

export const DURACIONES_DE_LIGA = [
  { segundos: 150, texto: "2 min 30 s" },
  { segundos: 300, texto: "5 minutos" },
  { segundos: 600, texto: "10 minutos" },
];

export const DIFICULTADES: { valor: Dificultad; texto: string }[] = [
  { valor: "facil", texto: "Fácil" },
  { valor: "medio", texto: "Medio" },
  { valor: "dificil", texto: "Difícil" },
];
