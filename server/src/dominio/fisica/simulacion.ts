import type { Vector } from "../../../../compartido/geometria.js";
import type { Cuadro } from "../../../../compartido/partida.js";
import { escalar, normalizar, redondear } from "../../utilidades/vector.js";
import {
  atraparSiEntra,
  crearEstadoDeCharcos,
  golpearPelotaAtrapada,
  type EstadoDeCharcos,
  type EventoDeCharco,
  type PelotaAtrapada,
  type ZonaDeCharco,
} from "./charcos.js";
import { resolverColisiones } from "./colisiones.js";
import { FISICA } from "./configuracionFisica.js";
import { crearPelota, crearPostes, crearTapita, enReposo, type Cuerpo } from "./cuerpo.js";
import { detectarGol, type Arco } from "./goles.js";
import { mover, rebotarEnParedes } from "./movimiento.js";

export interface Tiro {
  /** Índice de la tapita dentro de `EntradaSimulacion.tapitas`. */
  tapita: number;
  direccion: Vector;
  /** Proporción de la velocidad máxima. Llega a 1, o más con un tiro de poder. */
  fuerza: number;
  /** Si la tapita lanzada saca la pelota de un charco de un solo golpe. Por defecto `false`. */
  liberaDeUnGolpe?: boolean;
}

export interface EntradaSimulacion {
  tapitas: Vector[];
  pelota: Vector;
  tiro: Tiro;
  /** Por defecto, ninguno. */
  charcos?: ZonaDeCharco[];
  /** Por defecto, la pelota está libre. */
  pelotaAtrapada?: PelotaAtrapada | null;
}

export type FinDeSimulacion = "reposo" | "gol" | "limite";

export interface ResultadoSimulacion {
  /** Posiciones a lo largo del tiro, para que React las anime. */
  cuadros: Cuadro[];
  /** Posiciones finales, en el mismo orden que la entrada. */
  tapitas: Vector[];
  pelota: Vector;
  pelotaAtrapada: PelotaAtrapada | null;
  /** En el orden en que ocurrieron: una pelota puede salir de un charco y caer en otro. */
  eventosDeCharco: EventoDeCharco[];
  arcoConGol: Arco | null;
  terminoPor: FinDeSimulacion;
}

interface Cuerpos {
  tapitas: Cuerpo[];
  pelota: Cuerpo;
  moviles: Cuerpo[];
  postes: Cuerpo[];
}

const DT = 1 / (FISICA.pasosPorSegundo * FISICA.subpasosPorPaso);
const PASOS_MAXIMOS = FISICA.segundosMaximosDeSimulacion * FISICA.pasosPorSegundo;

/** Simula un tiro hasta que todo se detiene, entra un gol o se alcanza el tope de seguridad. */
export function simularTiro(entrada: EntradaSimulacion): ResultadoSimulacion {
  const tapitas = entrada.tapitas.map((posicion) => crearTapita(posicion));
  const pelota = crearPelota(entrada.pelota);
  const cuerpos: Cuerpos = { tapitas, pelota, moviles: [...tapitas, pelota], postes: crearPostes() };
  const charcos = crearEstadoDeCharcos(entrada.charcos ?? [], entrada.pelotaAtrapada ?? null, pelota);

  const { tiro } = entrada;
  tapitas[tiro.tapita].velocidad = escalar(
    normalizar(tiro.direccion),
    tiro.fuerza * FISICA.velocidadMaximaTiro,
  );
  const liberaDeUnGolpe = tiro.liberaDeUnGolpe ? tiro.tapita : null;

  const cuadros: Cuadro[] = [fotografiar(tapitas, pelota)];
  let arcoConGol: Arco | null = null;
  let terminoPor: FinDeSimulacion = "limite";

  for (let paso = 1; paso <= PASOS_MAXIMOS; paso++) {
    arcoConGol = avanzarUnPaso(cuerpos, charcos, liberaDeUnGolpe);
    if (arcoConGol) terminoPor = "gol";
    else if (cuerpos.moviles.every(enReposo)) terminoPor = "reposo";

    const termino = terminoPor !== "limite";
    if (termino || paso % FISICA.pasosPorCuadro === 0 || paso === PASOS_MAXIMOS) {
      cuadros.push(fotografiar(tapitas, pelota));
    }
    if (termino) break;
  }

  return {
    cuadros,
    tapitas: tapitas.map((tapita) => tapita.posicion),
    pelota: pelota.posicion,
    pelotaAtrapada: charcos.atrapada,
    eventosDeCharco: charcos.eventos,
    arcoConGol,
    terminoPor,
  };
}

function avanzarUnPaso(
  { tapitas, pelota, moviles, postes }: Cuerpos,
  charcos: EstadoDeCharcos,
  liberaDeUnGolpe: number | null,
): Arco | null {
  for (let subpaso = 0; subpaso < FISICA.subpasosPorPaso; subpaso++) {
    for (const cuerpo of moviles) mover(cuerpo, DT);

    // Se revisa antes de los choques: si este golpe la libera, el choque ya la trata como pelota libre.
    const impulsoAlLiberar = golpearPelotaAtrapada(charcos, tapitas, pelota, liberaDeUnGolpe);
    resolverColisiones(moviles, postes);
    if (impulsoAlLiberar !== null) pelota.velocidad = escalar(pelota.velocidad, impulsoAlLiberar);

    // Las paredes van después de los choques: un choque no puede empujar nada fuera de la cancha.
    for (const cuerpo of moviles) rebotarEnParedes(cuerpo);
    atraparSiEntra(charcos, pelota);

    const arco = detectarGol(pelota.posicion);
    if (arco) return arco;
  }
  return null;
}

function fotografiar(tapitas: Cuerpo[], pelota: Cuerpo): Cuadro {
  return {
    tapitas: tapitas.map((tapita) => redondear(tapita.posicion)),
    pelota: redondear(pelota.posicion),
    perro: null,
  };
}
