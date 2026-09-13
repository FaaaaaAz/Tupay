import type {
  PeticionCrearTemporada,
  PeticionJugarPartidoDeTemporada,
  RespuestaJugarPartidoDeTemporada,
  Temporada,
} from "../../../compartido/temporada.js";
import { enviar, obtener } from "./cliente";

const rutaDe = (id: string) => `/temporadas/${encodeURIComponent(id)}`;

export function crearTemporada(peticion: PeticionCrearTemporada): Promise<Temporada> {
  return enviar("/temporadas", peticion);
}

export function obtenerTemporada(id: string): Promise<Temporada> {
  return obtener(rutaDe(id));
}

export function jugarPartidoDeTemporada(
  id: string,
  partidoId: string,
  peticion: PeticionJugarPartidoDeTemporada,
): Promise<RespuestaJugarPartidoDeTemporada> {
  return enviar(`${rutaDe(id)}/partidos/${encodeURIComponent(partidoId)}/jugar`, peticion);
}
