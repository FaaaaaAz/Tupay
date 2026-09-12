import { useEffect, useState } from "react";
import type { RespuestaSalud } from "../../compartido/salud.js";
import { obtenerSalud } from "./api/salud";

type EstadoConsulta =
  | { situacion: "cargando" }
  | { situacion: "listo"; salud: RespuestaSalud }
  | { situacion: "error"; mensaje: string };

export function App() {
  const [consulta, setConsulta] = useState<EstadoConsulta>({ situacion: "cargando" });

  useEffect(() => {
    obtenerSalud()
      .then((salud) => setConsulta({ situacion: "listo", salud }))
      .catch((error: unknown) => {
        const mensaje = error instanceof Error ? error.message : "Error desconocido";
        setConsulta({ situacion: "error", mensaje });
      });
  }, []);

  return (
    <main className="pantalla">
      <h1 className="titulo">Tupay</h1>
      <p className="subtitulo">Fútbol de tapitas de la Liga boliviana</p>

      <section className="tarjeta" aria-live="polite">
        <h2 className="tarjeta__titulo">Estado del servidor</h2>
        {consulta.situacion === "cargando" && <p data-testid="estado-servidor">Consultando…</p>}
        {consulta.situacion === "error" && (
          <p className="tarjeta__error" data-testid="estado-servidor">
            Sin conexión con Express: {consulta.mensaje}
          </p>
        )}
        {consulta.situacion === "listo" && (
          <>
            <p data-testid="estado-servidor">
              Express responde: <strong>{consulta.salud.estado}</strong>
            </p>
            <p className="tarjeta__version">
              Versión publicada: <code>{consulta.salud.version}</code>
            </p>
          </>
        )}
      </section>
    </main>
  );
}
