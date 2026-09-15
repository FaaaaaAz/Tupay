import type { PeticionCrearPartida } from "../../../compartido/partida.js";
import { IMAGENES, IMAGEN_DE_CHARCO, IMAGEN_DE_EQUIPO, IMAGEN_DE_ESTADIO } from "./indice";

const pendientes = new Map<string, Promise<void>>();

/** Reutiliza descargas y decodifica fuera del render. Un recurso fallido permite reintentar. */
export function precargarImagen(url: string): Promise<void> {
  const existente = pendientes.get(url);
  if (existente) return existente;
  const imagen = new Image();
  imagen.decoding = "async";
  imagen.src = url;
  const carga = imagen.decode().catch(() => { pendientes.delete(url); });
  pendientes.set(url, carga);
  return carga;
}

export async function precargarPartida(peticion: PeticionCrearPartida): Promise<void> {
  // Los árbitros de los modales también: la pausa y la salida no pueden abrirse con un hueco vacío.
  const urls = [IMAGENES.pelota, IMAGENES.arco, IMAGENES.pausa, IMAGENES.salir,IMAGEN_DE_EQUIPO[peticion.local.equipo], IMAGEN_DE_EQUIPO[peticion.visitante.equipo]];
  if (peticion.estadio) urls.push(IMAGEN_DE_ESTADIO[peticion.estadio]);
  if (peticion.perroActivo !== false) urls.push(IMAGENES.perro);
  urls.push(...Object.values(IMAGEN_DE_CHARCO));
  // Un problema de red no puede dejar bloqueado indefinidamente el formulario.
  let tiempo: ReturnType<typeof setTimeout> | undefined;
  await Promise.race([Promise.all(urls.map(precargarImagen)), new Promise<void>((resolver) => { tiempo = setTimeout(resolver, 2500); })]);
  clearTimeout(tiempo);
}
