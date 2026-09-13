import { Router } from "express";
import type { ServicioPartidas } from "../servicios/servicioPartidas.js";
import { leerPeticionCrearPartida, leerPeticionTiro } from "./lecturaPeticiones.js";

/** Rutas delgadas: leen la petición, llaman al servicio y responden. Los errores los atiende `manejadorDeErrores`. */
export function crearRutaPartidas(servicio: ServicioPartidas): Router {
  const ruta = Router();

  ruta.post("/", (peticion, respuesta) => {
    respuesta.status(201).json(servicio.crear(leerPeticionCrearPartida(peticion.body)));
  });

  ruta.get("/:id", (peticion, respuesta) => {
    respuesta.json(servicio.obtener(peticion.params.id));
  });

  ruta.post("/:id/tiros", (peticion, respuesta) => {
    respuesta.json(servicio.tirar(peticion.params.id, leerPeticionTiro(peticion.body)));
  });

  ruta.post("/:id/turno-rival", (peticion, respuesta) => {
    respuesta.json(servicio.turnoRival(peticion.params.id));
  });

  return ruta;
}
