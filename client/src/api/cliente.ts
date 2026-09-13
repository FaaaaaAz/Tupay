import type { RespuestaError } from "../../../compartido/errores.js";

/** Error que respondió Express, con el mensaje listo para mostrar en pantalla. */
export class ErrorDeApi extends Error {
  readonly estado: number;

  constructor(mensaje: string, estado: number) {
    super(mensaje);
    this.name = "ErrorDeApi";
    this.estado = estado;
  }
}

export function obtener<T>(ruta: string): Promise<T> {
  return pedir<T>(ruta, { method: "GET" });
}

export function enviar<T>(ruta: string, cuerpo: unknown = {}): Promise<T> {
  return pedir<T>(ruta, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo),
  });
}

/** Única función del cliente que llama a `fetch`. */
async function pedir<T>(ruta: string, opciones: RequestInit): Promise<T> {
  let respuesta: Response;
  try {
    respuesta = await fetch(`/api${ruta}`, opciones);
  } catch {
    throw new ErrorDeApi("No se pudo conectar con el servidor", 0);
  }

  const datos: unknown = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    const mensaje =
      (datos as Partial<RespuestaError> | null)?.error ?? `El servidor respondió ${respuesta.status}`;
    throw new ErrorDeApi(mensaje, respuesta.status);
  }
  return datos as T;
}
