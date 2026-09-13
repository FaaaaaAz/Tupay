import { Router } from "express";
import { EQUIPOS, ESTADIOS } from "../dominio/catalogo.js";

export const rutaCatalogo = Router();

rutaCatalogo.get("/equipos", (_peticion, respuesta) => {
  respuesta.json(Object.values(EQUIPOS));
});

rutaCatalogo.get("/estadios", (_peticion, respuesta) => {
  respuesta.json(Object.values(ESTADIOS));
});
