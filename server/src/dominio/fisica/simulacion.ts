import type { Vector } from "../../../../compartido/geometria.js";
import type { Cuadro } from "../../../../compartido/partida.js";
import { escalar, normalizar } from "../../utilidades/vector.js";
import { resolverColisiones } from "./colisiones.js";
import { FISICA } from "./configuracionFisica.js";
import { crearPelota, crearPostes, crearTapita, enReposo, type Cuerpo } from "./cuerpo.js";
import { detectarGol, type Arco } from "./goles.js";
import { mover, rebotarEnParedes } from "./movimiento.js";

export interface Tiro {
  /** Índice de la tapita dentro de `EntradaSimulacion.tapitas`. */
  tapita: number;
  direccion: Vector;
  /** Proporción de la velocidad máxima, de 0 a 1. */
  fuerza: number;
}

export interface EntradaSimulacion {
  tapitas: Vector[];
  pelota: Vector;
  tiro: Tiro;
}

export type FinDeSimulacion = "reposo" | "gol" | "limite";

export interface ResultadoSimulacion {
  /** Posiciones a lo largo del tiro, para que React las anime. */
  cuadros: Cuadro[];
  /** Posiciones finales, en el mismo orden que la entrada. */
  tapitas: Vector[];
  pelota: Vector;
  arcoConGol: Arco | null;
  terminoPor: FinDeSimulacion;
}

const DT = 1 / (FISICA.pasosPorSegundo * FISICA.subpasosPorPaso);
const PASOS_MAXIMOS = FISICA.segundosMaximosDeSimulacion * FISICA.pasosPorSegundo;

/** Simula un tiro hasta que todo se detiene, entra un gol o se alcanza el tope de seguridad. */
export function simularTiro(entrada: EntradaSimulacion): ResultadoSimulacion {
  const tapitas = entrada.tapitas.map((posicion) => crearTapita(posicion));
  const pelota = crearPelota(entrada.pelota);
  const moviles = [...tapitas, pelota];
  const postes = crearPostes();

  const { tiro } = entrada;
  tapitas[tiro.tapita].velocidad = escalar(
    normalizar(tiro.direccion),
    tiro.fuerza * FISICA.velocidadMaximaTiro,
  );

  const cuadros: Cuadro[] = [fotografiar(tapitas, pelota)];
  let arcoConGol: Arco | null = null;
  let terminoPor: FinDeSimulacion = "limite";

  for (let paso = 1; paso <= PASOS_MAXIMOS; paso++) {
    arcoConGol = avanzarUnPaso(moviles, postes, pelota);
    if (arcoConGol) terminoPor = "gol";
    else if (moviles.every(enReposo)) terminoPor = "reposo";

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
    arcoConGol,
    terminoPor,
  };
}

function avanzarUnPaso(moviles: Cuerpo[], postes: Cuerpo[], pelota: Cuerpo): Arco | null {
  for (let subpaso = 0; subpaso < FISICA.subpasosPorPaso; subpaso++) {
    for (const cuerpo of moviles) mover(cuerpo, DT);
    resolverColisiones(moviles, postes);
    // Las paredes van después de los choques: un choque no puede empujar nada fuera de la cancha.
    for (const cuerpo of moviles) rebotarEnParedes(cuerpo);

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

/** Un decimal alcanza para dibujar y achica bastante el JSON del recorrido. */
function redondear({ x, y }: Vector): Vector {
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}
