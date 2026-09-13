import express from "express";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";
import { DIRECTORIO_CLIENTE } from "./configuracion.js";
import { MENSAJES } from "./dominio/mensajes.js";
import { RepositorioPartidasEnMemoria } from "./repositorios/repositorioPartidas.js";
import { rutaCatalogo } from "./rutas/catalogo.js";
import { manejadorDeErrores } from "./rutas/manejadorDeErrores.js";
import { crearRutaPartidas } from "./rutas/partidas.js";
import { rutaSalud } from "./rutas/salud.js";
import { ServicioPartidas } from "./servicios/servicioPartidas.js";

export function crearApp() {
  const app = express();
  const servicioPartidas = new ServicioPartidas({
    repositorio: new RepositorioPartidasEnMemoria(),
    ahora: () => Date.now(),
    crearId: () => `p_${randomUUID().slice(0, 8)}`,
    semillaAleatoria: () => Math.floor(Math.random() * 2 ** 32),
  });

  app.use(express.json());
  app.use("/api/salud", rutaSalud);
  app.use("/api", rutaCatalogo);
  app.use("/api/partidas", crearRutaPartidas(servicioPartidas));

  app.use("/api", (_peticion, respuesta) => {
    respuesta.status(404).json({ error: MENSAJES.rutaInexistente });
  });

  // En desarrollo el cliente lo sirve Vite; en producción lo sirve Express desde dist/cliente.
  if (existsSync(DIRECTORIO_CLIENTE)) {
    app.use(express.static(DIRECTORIO_CLIENTE));
    app.use((_peticion, respuesta) => {
      respuesta.sendFile(path.join(DIRECTORIO_CLIENTE, "index.html"));
    });
  }

  app.use(manejadorDeErrores);
  return app;
}
