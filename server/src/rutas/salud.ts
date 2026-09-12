import { Router } from "express";
import type { RespuestaSalud } from "../../../compartido/salud.js";
import { VERSION } from "../configuracion.js";

export const rutaSalud = Router();

rutaSalud.get("/", (_peticion, respuesta) => {
  const cuerpo: RespuestaSalud = { estado: "ok", juego: "Tupay", version: VERSION };
  respuesta.json(cuerpo);
});
