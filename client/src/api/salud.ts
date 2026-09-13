import type { RespuestaSalud } from "../../../compartido/salud.js";
import { obtener } from "./cliente";

export function obtenerSalud(): Promise<RespuestaSalud> {
  return obtener("/salud");
}
