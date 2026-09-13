import type { ErrorRequestHandler } from "express";
import type { RespuestaError } from "../../../compartido/errores.js";
import { ErrorDeJuego } from "../dominio/errores.js";
import { MENSAJES } from "../dominio/mensajes.js";

/** Único lugar que convierte errores en respuestas HTTP: las rutas solo lanzan. */
export const manejadorDeErrores: ErrorRequestHandler = (error, _peticion, respuesta, _siguiente) => {
  const [estado, mensaje] = clasificar(error);
  if (estado === 500) console.error(error);

  const cuerpo: RespuestaError = { error: mensaje };
  respuesta.status(estado).json(cuerpo);
};

function clasificar(error: unknown): [number, string] {
  if (error instanceof ErrorDeJuego) return [error.estado, error.message];
  // express.json() lanza un SyntaxError cuando el cuerpo no es JSON válido.
  if (error instanceof SyntaxError) return [400, MENSAJES.cuerpoNoJson];
  return [500, MENSAJES.errorInterno];
}
