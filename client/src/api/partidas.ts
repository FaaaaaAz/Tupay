import type {
  Partida,
  PeticionCrearPartida,
  PeticionEmote,
  PeticionTiro,
  RespuestaTiro,
} from "../../../compartido/partida.js";
import { enviar, obtener } from "./cliente";

const rutaDe = (id: string) => `/partidas/${encodeURIComponent(id)}`;

export function crearPartida(peticion: PeticionCrearPartida): Promise<Partida> {
  return enviar("/partidas", peticion);
}

export function obtenerPartida(id: string): Promise<Partida> {
  return obtener(rutaDe(id));
}

export function tirar(id: string, peticion: PeticionTiro): Promise<RespuestaTiro> {
  return enviar(`${rutaDe(id)}/tiros`, peticion);
}

export function jugarTurnoRival(id: string): Promise<RespuestaTiro> {
  return enviar(`${rutaDe(id)}/turno-rival`);
}

export function lanzarEmote(id: string, peticion: PeticionEmote): Promise<Partida> {
  return enviar(`${rutaDe(id)}/emotes`, peticion);
}
