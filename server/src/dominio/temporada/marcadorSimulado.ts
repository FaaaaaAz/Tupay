import type { Marcador } from "../../../../compartido/partida.js";
import type { Azar } from "../../utilidades/azar.js";
import { TEMPORADA } from "../reglas/configuracionReglas.js";

/** Resultado de un partido en el que no juega ninguna persona: sin física, solo con la semilla. */
export function simularMarcador(azar: Azar): Marcador {
  return { local: sortearGoles(azar), visitante: sortearGoles(azar) };
}

function sortearGoles(azar: Azar): number {
  const probabilidades = TEMPORADA.probabilidadDeGoles;
  let tirada = azar();
  for (let goles = 0; goles < probabilidades.length; goles++) {
    tirada -= probabilidades[goles];
    if (tirada < 0) return goles;
  }
  return probabilidades.length - 1;
}
