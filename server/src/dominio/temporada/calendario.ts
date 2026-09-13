import type { IdEquipo } from "../../../../compartido/catalogo.js";
import type { Azar } from "../../utilidades/azar.js";

export interface Cruce {
  jornada: number;
  local: IdEquipo;
  visitante: IdEquipo;
}

/** Mezcla de Fisher-Yates con el azar de la temporada: con la misma semilla, el mismo orden. */
export function barajar<T>(elementos: readonly T[], azar: Azar): T[] {
  const mezcla = [...elementos];
  for (let i = mezcla.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [mezcla[i], mezcla[j]] = [mezcla[j], mezcla[i]];
  }
  return mezcla;
}

/**
 * Todos contra todos a una vuelta, con el método del círculo: el primer equipo queda fijo y los
 * demás rotan una posición por jornada, así cada par se cruza exactamente una vez. Con una
 * cantidad impar se agrega un lugar vacío, y quien lo enfrenta descansa esa jornada.
 */
export function generarCalendario(equipos: readonly IdEquipo[]): Cruce[] {
  const ronda: (IdEquipo | null)[] = equipos.length % 2 === 0 ? [...equipos] : [...equipos, null];
  const lugares = ronda.length;
  const cruces: Cruce[] = [];

  for (let jornada = 1; jornada < lugares; jornada++) {
    for (let i = 0; i < lugares / 2; i++) {
      const uno = ronda[i];
      const otro = ronda[lugares - 1 - i];
      if (uno === null || otro === null) continue;

      // Se alterna quién es local para que ningún equipo juegue siempre en casa.
      const invertir = (jornada + i) % 2 === 0;
      cruces.push({ jornada, local: invertir ? otro : uno, visitante: invertir ? uno : otro });
    }
    const ultimo = ronda.pop() ?? null;
    ronda.splice(1, 0, ultimo);
  }

  return cruces;
}
