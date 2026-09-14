import { Router } from "express";
import type { ServicioPartidas } from "../servicios/servicioPartidas.js";
import { leerPeticionCrearPartida, leerPeticionEmote, leerPeticionTiro } from "./lecturaPeticiones.js";

/** Rutas delgadas: leen la petición, llaman al servicio y responden. Los errores los atiende `manejadorDeErrores`. */
export function crearRutaPartidas(servicio: ServicioPartidas): Router {
  const ruta = Router();

  ruta.post("/", (peticion, respuesta) => {
    respuesta.status(201).json(servicio.crear(leerPeticionCrearPartida(peticion.body)));
  });

  ruta.get("/:id", (peticion, respuesta) => {
    respuesta.json(servicio.obtener(peticion.params.id));
  });

  ruta.post("/:id/pausar", (peticion, respuesta) => {
    respuesta.json(servicio.pausar(peticion.params.id, true));
  });

  ruta.post("/:id/reanudar", (peticion, respuesta) => {
    respuesta.json(servicio.pausar(peticion.params.id, false));
  });

  ruta.post("/:id/abandonar", (peticion, respuesta) => {
    servicio.abandonar(peticion.params.id);
    respuesta.json({ abandonada: true });
  });

  ruta.post("/:id/tiros", (peticion, respuesta) => {
    respuesta.json(servicio.tirar(peticion.params.id, leerPeticionTiro(peticion.body)));
  });

  ruta.post("/:id/turno-rival", (peticion, respuesta) => {
    respuesta.json(servicio.turnoRival(peticion.params.id));
  });

  ruta.post("/:id/emotes", (peticion, respuesta) => {
    respuesta.json(servicio.lanzarEmote(peticion.params.id, leerPeticionEmote(peticion.body)));
  });

  return ruta;
}
