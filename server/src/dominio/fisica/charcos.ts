import type { Vector } from "../../../../compartido/geometria.js";
import { CERO, longitud, productoPunto, restar } from "../../utilidades/vector.js";
import { FISICA } from "./configuracionFisica.js";
import type { Cuerpo } from "./cuerpo.js";

/**
 * Un charco visto por la física: una elipse que atrapa la pelota. La física no sabe si es
 * de agua o de nieve, ni cuántos turnos dura; eso lo decide `dominio/estadios`.
 */
export interface ZonaDeCharco {
  id: string;
  posicion: Vector;
  ancho: number;
  alto: number;
  /** Choques de tapita que hacen falta para sacar la pelota. */
  golpesParaLiberar: number;
  /** Fracción de la velocidad del choque con la que sale la pelota. */
  impulsoAlLiberar: number;
}

export interface PelotaAtrapada {
  charco: string;
  golpesParaLiberar: number;
}

export type EventoDeCharco =
  | { tipo: "pelotaAtrapada"; charco: string }
  | { tipo: "pelotaLiberada"; charco: string };

/** La pelota cayó en un charco en este cuadro del recorrido: ahí suena el splash. */
export interface CaidaEnCharco {
  cuadro: number;
  charco: string;
}

/** Lo que cambia en los charcos mientras se simula un tiro. */
export interface EstadoDeCharcos {
  zonas: ZonaDeCharco[];
  atrapada: PelotaAtrapada | null;
  /** Charco donde está la pelota sin estar atrapada: no la atrapa hasta que salga de él. */
  ignorado: string | null;
  /**
   * Si cayó en este mismo tiro. La tapita que la llevó al charco suele venir detrás y volver a
   * tocarla: esos choques no cuentan, los golpes para liberarla empiezan en el tiro siguiente.
   */
  cayoEnEsteTiro: boolean;
  eventos: EventoDeCharco[];
}

export function crearEstadoDeCharcos(
  zonas: ZonaDeCharco[],
  atrapada: PelotaAtrapada | null,
  pelota: Cuerpo,
): EstadoDeCharcos {
  if (atrapada) fijar(pelota);
  return {
    zonas,
    // Copia: la simulación descuenta golpes y no debe tocar el estado de la partida.
    atrapada: atrapada && { ...atrapada },
    ignorado: atrapada ? atrapada.charco : (zonaQueContiene(zonas, pelota.posicion)?.id ?? null),
    cayoEnEsteTiro: false,
    eventos: [],
  };
}

/**
 * Si una tapita choca la pelota atrapada, descuenta un golpe. Con el tiro de poder, la tapita
 * lanzada la libera de una sola vez. Devuelve con qué fracción de impulso sale, o `null` si sigue atrapada.
 */
export function golpearPelotaAtrapada(
  estado: EstadoDeCharcos,
  tapitas: Cuerpo[],
  pelota: Cuerpo,
  tapitaQueLiberaDeUnGolpe: number | null,
): number | null {
  const { atrapada } = estado;
  if (!atrapada) return null;

  const golpe = tapitas.findIndex((tapita) => seAcercaYLaToca(tapita, pelota));
  if (golpe === -1 || estado.cayoEnEsteTiro) return null;

  atrapada.golpesParaLiberar = golpe === tapitaQueLiberaDeUnGolpe ? 0 : atrapada.golpesParaLiberar - 1;
  if (atrapada.golpesParaLiberar > 0) return null;

  estado.atrapada = null;
  estado.ignorado = atrapada.charco;
  estado.eventos.push({ tipo: "pelotaLiberada", charco: atrapada.charco });
  pelota.masaInversa = 1 / FISICA.masaPelota;
  return estado.zonas.find((zona) => zona.id === atrapada.charco)?.impulsoAlLiberar ?? 1;
}

/** La pelota queda atrapada cuando su centro entra a un charco. Uno donde ya estaba no cuenta. */
export function atraparSiEntra(estado: EstadoDeCharcos, pelota: Cuerpo): void {
  if (estado.atrapada) return;

  const zona = zonaQueContiene(estado.zonas, pelota.posicion);
  if (!zona) {
    estado.ignorado = null;
    return;
  }
  if (zona.id === estado.ignorado) return;

  fijar(pelota);
  estado.atrapada = { charco: zona.id, golpesParaLiberar: zona.golpesParaLiberar };
  estado.cayoEnEsteTiro = true;
  estado.eventos.push({ tipo: "pelotaAtrapada", charco: zona.id });
}

export function contiene(zona: Pick<ZonaDeCharco, "posicion" | "ancho" | "alto">, punto: Vector): boolean {
  const dx = (punto.x - zona.posicion.x) / (zona.ancho / 2);
  const dy = (punto.y - zona.posicion.y) / (zona.alto / 2);
  return dx * dx + dy * dy <= 1;
}

function zonaQueContiene(zonas: ZonaDeCharco[], punto: Vector): ZonaDeCharco | undefined {
  return zonas.find((zona) => contiene(zona, punto));
}

/** Atrapada, la pelota se comporta como un poste: quieta y sin que ningún choque la mueva. */
function fijar(pelota: Cuerpo): void {
  pelota.velocidad = CERO;
  pelota.masaInversa = 0;
}

function seAcercaYLaToca(tapita: Cuerpo, pelota: Cuerpo): boolean {
  const separacion = restar(pelota.posicion, tapita.posicion);
  if (longitud(separacion) >= tapita.radio + pelota.radio) return false;
  return productoPunto(restar(pelota.velocidad, tapita.velocidad), separacion) < 0;
}
