import express from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import { DIRECTORIO_CLIENTE } from "./configuracion.js";
import { rutaSalud } from "./rutas/salud.js";

export function crearApp() {
  const app = express();

  app.use(express.json());
  app.use("/api/salud", rutaSalud);

  app.use("/api", (_peticion, respuesta) => {
    respuesta.status(404).json({ error: "Ruta de API no encontrada" });
  });

  // En desarrollo el cliente lo sirve Vite; en producción lo sirve Express desde dist/cliente.
  if (existsSync(DIRECTORIO_CLIENTE)) {
    app.use(express.static(DIRECTORIO_CLIENTE));
    app.use((_peticion, respuesta) => {
      respuesta.sendFile(path.join(DIRECTORIO_CLIENTE, "index.html"));
    });
  }

  return app;
}
