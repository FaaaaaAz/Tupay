import type { IdEquipo } from "../../../../compartido/catalogo.js";
import type { FilaTabla, PartidoDeTemporada } from "../../../../compartido/temporada.js";
import { TEMPORADA } from "../reglas/configuracionReglas.js";

/**
 * La tabla no se guarda: se calcula cada vez a partir de los resultados. Así es imposible
 * que quede desincronizada con los partidos. Si dos equipos empatan en todo, quedan en el
 * orden en que llegan en `equipos`.
 */
export function calcularTabla(
  equipos: readonly IdEquipo[],
  partidos: readonly PartidoDeTemporada[],
): FilaTabla[] {
  const filas = new Map(equipos.map((equipo) => [equipo, filaVacia(equipo)]));
  const filaDe = (equipo: IdEquipo): FilaTabla => {
    const fila = filas.get(equipo);
    if (!fila) throw new Error(`El equipo ${equipo} no participa de la temporada`);
    return fila;
  };

  for (const { local, visitante, marcador } of partidos) {
    if (!marcador) continue;
    anotar(filaDe(local), marcador.local, marcador.visitante);
    anotar(filaDe(visitante), marcador.visitante, marcador.local);
  }

  return [...filas.values()].sort(
    (a, b) => b.puntos - a.puntos || b.diferencia - a.diferencia || b.golesAFavor - a.golesAFavor,
  );
}

function filaVacia(equipo: IdEquipo): FilaTabla {
  return {
    equipo,
    jugados: 0,
    ganados: 0,
    empatados: 0,
    perdidos: 0,
    golesAFavor: 0,
    golesEnContra: 0,
    diferencia: 0,
    puntos: 0,
  };
}

function anotar(fila: FilaTabla, aFavor: number, enContra: number): void {
  fila.jugados += 1;
  fila.golesAFavor += aFavor;
  fila.golesEnContra += enContra;
  fila.diferencia = fila.golesAFavor - fila.golesEnContra;

  if (aFavor > enContra) {
    fila.ganados += 1;
    fila.puntos += TEMPORADA.puntosPorVictoria;
  } else if (aFavor === enContra) {
    fila.empatados += 1;
    fila.puntos += TEMPORADA.puntosPorEmpate;
  } else {
    fila.perdidos += 1;
  }
}
