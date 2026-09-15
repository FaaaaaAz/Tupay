import { useEffect, useState } from "react";
import { audio } from "./audio/audio";
import { SONIDOS_DE_PARTIDA, sonidoDelResultado } from "./audio/sonidosDelJuego";
import type { Modo, Partida as DatosPartida, PeticionCrearPartida } from "../../compartido/partida.js";
import { useCatalogo } from "./hooks/useCatalogo";
import { Configuracion } from "./pantallas/Configuracion";
import { ConfigurarTemporada } from "./pantallas/ConfigurarTemporada";
import { Instrucciones } from "./pantallas/Instrucciones";
import { Menu } from "./pantallas/Menu";
import { Partida } from "./pantallas/Partida";
import { Portada } from "./pantallas/Portada";
import { Resultado } from "./pantallas/Resultado";
import { Temporada } from "./pantallas/Temporada";

/** De dónde salió una partida: define a dónde se vuelve al terminarla y si tiene revancha. */
type Origen = { tipo: "suelta"; peticion: PeticionCrearPartida } | { tipo: "temporada"; id: string };

type Pantalla =
  | { tipo: "portada" }
  | { tipo: "menu" }
  | { tipo: "instrucciones" }
  | { tipo: "configuracion"; modo: Modo }
  | { tipo: "configurarTemporada" }
  | { tipo: "temporada"; id: string }
  | { tipo: "partida"; partida: DatosPartida; origen: Origen }
  | { tipo: "resultado"; partida: DatosPartida; origen: Origen };

/** Sin React Router: la pantalla actual es un estado más, y navegar es cambiar ese estado. */
export function App() {
  const [pantalla, cambiarPantalla] = useState<Pantalla>({ tipo: "portada" });
  // La música sigue una navegación real, no el montaje ni los renders de React.
  const setPantalla = (siguiente: Pantalla) => {
    audio.detenerEfectos();
    const musica = siguiente.tipo === "partida" ? "partido"
      : siguiente.tipo === "resultado" ? sonidoDelResultado(siguiente.partida)
      : siguiente.tipo === "portada" ? null : "menu";
    audio.reproducirMusica(musica);
    audio.pausar(false);
    if (["configuracion", "configurarTemporada", "temporada", "partida"].includes(siguiente.tipo)) void audio.preparar(SONIDOS_DE_PARTIDA);
    if (siguiente.tipo === "partida") void audio.efecto("inicio");
    else if (siguiente.tipo !== "resultado") void audio.efecto("transicion");
    cambiarPantalla(siguiente);
  };
  useEffect(() => {
    const visibilidad = () => audio.ocultar(document.hidden);
    document.addEventListener("visibilitychange", visibilidad);
    return () => { document.removeEventListener("visibilitychange", visibilidad); audio.detenerTodo(); };
  }, []);
  const { catalogo, error } = useCatalogo();
  const irAlMenu = () => setPantalla({ tipo: "menu" });
  const volverAlOrigen = (origen: Origen) =>
    setPantalla(origen.tipo === "temporada" ? { tipo: "temporada", id: origen.id } : { tipo: "menu" });

  switch (pantalla.tipo) {
    case "portada":
      return <Portada alIniciar={() => {
        void audio.desbloquear().then(() => audio.preparar(["clic", "transicion", "confirmacion", "error"]));
        irAlMenu();
      }} />;
    case "menu":
      return (
        <Menu
          alElegirModo={(modo) => setPantalla({ tipo: "configuracion", modo })}
          alVerTemporada={() => setPantalla({ tipo: "configurarTemporada" })}
          alVerInstrucciones={() => setPantalla({ tipo: "instrucciones" })}
          alVolver={() => setPantalla({ tipo: "portada" })}
        />
      );
    case "instrucciones":
      return <Instrucciones alVolver={irAlMenu} />;
  }

  // Las pantallas siguientes necesitan los equipos y estadios que manda Express.
  if (!catalogo) {
    return (
      <main className="fondo-panel">
        <div className="panel">
          <p className={error ? "mensaje mensaje--error" : "mensaje"} role={error ? "alert" : "status"}>
            {error ?? "Cargando equipos y estadios…"}
          </p>
          {error && (
            <button type="button" className="boton boton--secundario" onClick={irAlMenu}>
              Volver al menú
            </button>
          )}
        </div>
      </main>
    );
  }

  switch (pantalla.tipo) {
    case "configuracion":
      return (
        <Configuracion
          key={pantalla.modo}
          modo={pantalla.modo}
          equipos={catalogo.equipos}
          estadios={catalogo.estadios}
          alJugar={(partida, peticion) =>
            setPantalla({ tipo: "partida", partida, origen: { tipo: "suelta", peticion } })
          }
          alVolver={irAlMenu}
        />
      );
    case "configurarTemporada":
      return (
        <ConfigurarTemporada
          equipos={catalogo.equipos}
          alEmpezar={(id) => setPantalla({ tipo: "temporada", id })}
          alVolver={irAlMenu}
        />
      );
    case "temporada":
      return (
        <Temporada
          key={pantalla.id}
          temporadaId={pantalla.id}
          equipos={catalogo.equipos}
          alJugar={(partida) =>
            setPantalla({ tipo: "partida", partida, origen: { tipo: "temporada", id: pantalla.id } })
          }
          alIrAlMenu={irAlMenu}
        />
      );
    case "partida":
      return (
        <Partida
          key={pantalla.partida.id}
          partidaInicial={pantalla.partida}
          esTemporada={pantalla.origen.tipo === "temporada"}
          equipos={catalogo.equipos}
          alTerminar={(partida) => setPantalla({ tipo: "resultado", partida, origen: pantalla.origen })}
          alSalir={() => volverAlOrigen(pantalla.origen)}
        />
      );
    case "resultado":
      return (
        <Resultado
          partida={pantalla.partida}
          equipos={catalogo.equipos}
          revancha={pantalla.origen.tipo === "suelta" ? pantalla.origen.peticion : null}
          alJugarDeNuevo={(partida) => setPantalla({ tipo: "partida", partida, origen: pantalla.origen })}
          textoParaSalir={pantalla.origen.tipo === "temporada" ? "Volver a la temporada" : "Volver al menú"}
          alSalir={() => volverAlOrigen(pantalla.origen)}
        />
      );
  }
}
