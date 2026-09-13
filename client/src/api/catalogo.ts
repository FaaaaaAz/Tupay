import type { Equipo, Estadio } from "../../../compartido/catalogo.js";
import { obtener } from "./cliente";

export function obtenerEquipos(): Promise<Equipo[]> {
  return obtener("/equipos");
}

export function obtenerEstadios(): Promise<Estadio[]> {
  return obtener("/estadios");
}
