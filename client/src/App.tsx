import { useState } from "react";
import type { Modo, Partida as DatosPartida, PeticionCrearPartida } from "../../compartido/partida.js";
import { useCatalogo } from "./hooks/useCatalogo";
import { Configuracion } from "./pantallas/Configuracion";
import { Instrucciones } from "./pantallas/Instrucciones";
import { Menu } from "./pantallas/Menu";
import { Partida } from "./pantallas/Partida";
import { Portada } from "./pantallas/Portada";
import { Resultado } from "./pantallas/Resultado";

type Pantalla =
  | { tipo: "portada" }
  | { tipo: "menu" }
  | { tipo: "instrucciones" }
  | { tipo: "configuracion"; modo: Modo }
  | { tipo: "partida"; partida: DatosPartida; peticion: PeticionCrearPartida }
  | { tipo: "resultado"; partida: DatosPartida; peticion: PeticionCrearPartida };

/** Sin React Router: la pantalla actual es un estado más, y navegar es cambiar ese estado. */
export function App() {
  const [pantalla, setPantalla] = useState<Pantalla>({ tipo: "portada" });
  const { catalogo, error } = useCatalogo();
  const irAlMenu = () => setPantalla({ tipo: "menu" });

  switch (pantalla.tipo) {
    case "portada":
      return <Portada alIniciar={irAlMenu} />;
    case "menu":
      return (
        <Menu
          alElegirModo={(modo) => setPantalla({ tipo: "configuracion", modo })}
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
          alJugar={(partida, peticion) => setPantalla({ tipo: "partida", partida, peticion })}
          alVolver={irAlMenu}
        />
      );
    case "partida":
      return (
        <Partida
          key={pantalla.partida.id}
          partidaInicial={pantalla.partida}
          equipos={catalogo.equipos}
          alTerminar={(partida) => setPantalla({ tipo: "resultado", partida, peticion: pantalla.peticion })}
          alSalir={irAlMenu}
        />
      );
    case "resultado":
      return (
        <Resultado
          partida={pantalla.partida}
          peticion={pantalla.peticion}
          equipos={catalogo.equipos}
          alJugarDeNuevo={(partida) => setPantalla({ tipo: "partida", partida, peticion: pantalla.peticion })}
          alIrAlMenu={irAlMenu}
        />
      );
  }
}
