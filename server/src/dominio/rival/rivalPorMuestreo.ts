import type { Lado, PeticionTiro } from "../../../../compartido/partida.js";
import { longitud, restar } from "../../utilidades/vector.js";
import { CANCHA } from "../fisica/configuracionFisica.js";
import type { ResultadoSimulacion } from "../fisica/simulacion.js";
import { REGLAS, RIVAL } from "../reglas/configuracionReglas.js";
import { ladoQueAnota } from "../reglas/lados.js";
import type { RegistroPartida } from "../reglas/partida.js";
import { simularEnLaPartida } from "../reglas/simulacionEnLaPartida.js";
import { limitarFuerza, tiroDeBillar } from "./billar.js";

export interface Candidato {
  /** Índice de la tapita dentro de `RegistroPartida.tapitas`. */
  indice: number;
  angulo: number;
  fuerza: number;
}

/**
 * Rival por muestreo. No usa minimax: las jugadas son continuas y dependen de la física, así
 * que no hay un árbol que recorrer. En cambio arma varios tiros candidatos, simula cada uno
 * con la misma física del juego y se queda con el de mejor puntuación. Al final le agrega un
 * error de puntería: la dificultad decide cuántos candidatos prueba y cuánto falla.
 */
export function decidirTiroDelRival(registro: RegistroPartida): PeticionTiro {
  const lado = registro.turno;
  const jugador = registro.jugadores[lado];
  const { candidatos: cantidad, errorDePunteria } =
    RIVAL.dificultades[jugador.dificultad ?? REGLAS.dificultadPorDefecto];
  // Solo gasta un tiro de poder cuando le sirve de verdad: para sacar la pelota de la nieve.
  const tiroDePoder = (registro.pelotaAtrapada?.golpesParaLiberar ?? 0) > 1 && jugador.tirosDePoder > 0;

  const candidatos = generarCandidatos(registro, lado, cantidad);
  let mejor = candidatos[0];
  let mejorPuntaje = -Infinity;
  for (const candidato of candidatos) {
    const puntaje = puntuar(simularCandidato(registro, candidato, tiroDePoder), lado);
    if (puntaje > mejorPuntaje) {
      mejor = candidato;
      mejorPuntaje = puntaje;
    }
  }

  const angulo = mejor.angulo + (registro.azar() * 2 - 1) * errorDePunteria;
  return {
    lado,
    tapita: registro.tapitas[mejor.indice].id,
    direccion: { x: Math.cos(angulo), y: Math.sin(angulo) },
    fuerza: mejor.fuerza,
    tiroDePoder,
  };
}

/**
 * Primero, un tiro de billar puro por cada tapita propia, empezando por las que están detrás de
 * la pelota y más cerca. Si la dificultad pide más candidatos, el resto son variaciones al azar
 * de esos tiros: otro ángulo y otra fuerza.
 */
export function generarCandidatos(registro: RegistroPartida, lado: Lado, cantidad: number): Candidato[] {
  const billares = registro.tapitas
    .map((tapita, indice) => ({ indice, lado: tapita.lado, ...tiroDeBillar(tapita.posicion, registro.pelota, lado) }))
    .filter((tiro) => tiro.lado === lado)
    .sort((a, b) => Number(b.empujaHaciaElArco) - Number(a.empujaHaciaElArco) || a.distancia - b.distancia);

  return Array.from({ length: cantidad }, (_, numero): Candidato => {
    const { indice, angulo, fuerza } = billares[numero % billares.length];
    if (numero < billares.length) return { indice, angulo, fuerza };

    const desvio = (registro.azar() * 2 - 1) * RIVAL.desvioDeCandidatos;
    const variacion = 1 + (registro.azar() * 2 - 1) * RIVAL.variacionDeFuerza;
    return { indice, angulo: angulo + desvio, fuerza: limitarFuerza(fuerza * variacion) };
  });
}

/** Premia el gol y llevar la pelota hacia el arco rival; castiga el autogol y dejarla cerca del propio. */
export function puntuar(resultado: ResultadoSimulacion, lado: Lado): number {
  const { gol, avance, peligro, distanciaDePeligro } = RIVAL.puntuacion;
  if (resultado.arcoConGol) return ladoQueAnota(resultado.arcoConGol) === lado ? gol : -gol;

  const { pelota } = resultado;
  const avanceHaciaElArcoRival = (lado === "local" ? pelota.x : CANCHA.ancho - pelota.x) / CANCHA.ancho;
  const arcoPropio = { x: lado === "local" ? 0 : CANCHA.ancho, y: CANCHA.alto / 2 };
  const cercaniaAlArcoPropio = Math.max(0, 1 - longitud(restar(pelota, arcoPropio)) / distanciaDePeligro);

  return avanceHaciaElArcoRival * avance - cercaniaAlArcoPropio * peligro;
}

function simularCandidato(
  registro: RegistroPartida,
  { indice, angulo, fuerza }: Candidato,
  tiroDePoder: boolean,
): ResultadoSimulacion {
  const direccion = { x: Math.cos(angulo), y: Math.sin(angulo) };
  return simularEnLaPartida(registro, indice, { direccion, fuerza, tiroDePoder });
}
