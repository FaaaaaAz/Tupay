import { useState, type FormEvent } from "react";
import type { Equipo, Estadio, IdEquipo, IdEstadio } from "../../../compartido/catalogo.js";
import type { Dificultad, Modo, Partida, PeticionCrearPartida } from "../../../compartido/partida.js";
import { CasillaDelPerro } from "../componentes/CasillaDelPerro";
import { GrupoDeOpciones } from "../componentes/GrupoDeOpciones";
import { DIFICULTADES, DURACIONES_DE_LIGA, JUGADORES_DE_PARTIDA } from "../componentes/opcionesDeJuego";
import { SelectorDeEquipo } from "../componentes/SelectorDeEquipo";
import { SelectorDeEstadio } from "../componentes/SelectorDeEstadio";
import { equipoPorId } from "../hooks/useCatalogo";
import { useCrearPartida } from "../hooks/useCrearPartida";

const METAS_DE_GOLES = [1, 2, 3, 4, 5].map((meta) => ({ valor: meta, texto: String(meta) }));

interface Props {
  modo: Modo;
  equipos: Equipo[];
  estadios: Estadio[];
  alJugar: (partida: Partida, peticion: PeticionCrearPartida) => void;
  alVolver: () => void;
}

export function Configuracion({ modo, equipos, estadios, alJugar, alVolver }: Props) {
  const [jugadores, setJugadores] = useState<1 | 2>(1);
  const [dificultad, setDificultad] = useState<Dificultad>("medio");
  const [local, setLocal] = useState<IdEquipo>("bolivar");
  const [visitante, setVisitante] = useState<IdEquipo>("theStrongest");
  // El estadio acompaña al equipo local hasta que se elige otro a mano.
  const [estadioAMano, setEstadioAMano] = useState<IdEstadio | null>(null);
  const [golesParaGanar, setGolesParaGanar] = useState(3);
  const [duracion, setDuracion] = useState(300);
  // Empieza desactivado: al activarlo se oye ladrar al perro.
  const [perroActivo, setPerroActivo] = useState(false);
  const { crear, enviando, error } = useCrearPartida();

  const estadioDelLocal = equipoPorId(equipos, local).estadio;
  const estadio = estadioAMano ?? estadioDelLocal;

  // Que los dos equipos sean distintos no se revisa aquí: lo valida Express y aquí se muestra su respuesta.
  async function empezar(evento: FormEvent) {
    evento.preventDefault();
    const peticion: PeticionCrearPartida = {
      modo,
      local: { equipo: local, tipo: "humano" },
      visitante:
        jugadores === 1
          ? { equipo: visitante, tipo: "servidor", dificultad }
          : { equipo: visitante, tipo: "humano" },
      perroActivo,
      estadio,
      ...(modo === "eliminatoria" ? { golesParaGanar } : { duracionRealSegundos: duracion }),
    };
    const partida = await crear(peticion);
    if (partida) alJugar(partida, peticion);
  }

  return (
    <main className="fondo-panel">
      <form className="panel configuracion" onSubmit={(evento) => void empezar(evento)}>
        <header className="panel__cabecera">
          <button type="button" className="boton boton--enlace" disabled={enviando} onClick={alVolver}>
            ← Volver
          </button>
          <h1>{modo === "eliminatoria" ? "Eliminatoria" : "Liga"}</h1>
        </header>

        <GrupoDeOpciones titulo="Jugadores" nombre="jugadores" opciones={JUGADORES_DE_PARTIDA}
          valor={jugadores} alCambiar={setJugadores} />

        {jugadores === 1 && (
          <GrupoDeOpciones titulo="Dificultad del servidor" nombre="dificultad" opciones={DIFICULTADES}
            valor={dificultad} alCambiar={setDificultad} />
        )}

        <div className="enfrentamiento">
          <SelectorDeEquipo
            etiqueta={jugadores === 1 ? "Tu equipo" : "Equipo local"}
            valor={local}
            equipos={equipos}
            alCambiar={setLocal}
          />
          <span className="enfrentamiento__vs">vs</span>
          <SelectorDeEquipo
            etiqueta={jugadores === 1 ? "Rival" : "Equipo visitante"}
            valor={visitante}
            equipos={equipos}
            alCambiar={setVisitante}
          />
        </div>

        <SelectorDeEstadio
          valor={estadio}
          estadios={estadios}
          estadioDelLocal={estadioDelLocal}
          alCambiar={setEstadioAMano}
        />

        {modo === "eliminatoria" ? (
          <GrupoDeOpciones titulo="Meta de goles" nombre="meta" opciones={METAS_DE_GOLES}
            valor={golesParaGanar} alCambiar={setGolesParaGanar} />
        ) : (
          <GrupoDeOpciones titulo="Duración real del partido" nombre="duracion" opciones={DURACIONES_DE_LIGA}
            valor={duracion} alCambiar={setDuracion} />
        )}

        <CasillaDelPerro activo={perroActivo} alCambiar={setPerroActivo} />

        {error && (
          <p className="mensaje mensaje--error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="boton boton--principal" disabled={enviando}>
          {enviando ? "Preparando la cancha…" : "Jugar"}
        </button>
      </form>
    </main>
  );
}
