import type { RespuestaSalud } from "../../../compartido/salud.js";

export async function obtenerSalud(): Promise<RespuestaSalud> {
  const respuesta = await fetch("/api/salud");
  if (!respuesta.ok) {
    throw new Error(`El servidor respondió ${respuesta.status}`);
  }
  return (await respuesta.json()) as RespuestaSalud;
}
