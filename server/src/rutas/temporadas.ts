import { Router } from "express";
import type { ServicioTemporadas } from "../servicios/servicioTemporadas.js";
import { leerPeticionCrearTemporada, leerPeticionJugarPartido } from "./lecturaPeticiones.js";

export function crearRutaTemporadas(servicio: ServicioTemporadas): Router {
  const ruta = Router();

  ruta.post("/", (peticion, respuesta) => {
    respuesta.status(201).json(servicio.crear(leerPeticionCrearTemporada(peticion.body)));
  });

  ruta.get("/:id", (peticion, respuesta) => {
    respuesta.json(servicio.obtener(peticion.params.id));
  });

  ruta.post("/:id/partidos/:partidoId/jugar", (peticion, respuesta) => {
    const { id, partidoId } = peticion.params;
    respuesta.json(servicio.jugar(id, partidoId, leerPeticionJugarPartido(peticion.body)));
  });

  return ruta;
}
