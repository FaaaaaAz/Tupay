import { useState, type FormEvent } from "react";
import type { Equipo, IdEquipo } from "../../../compartido/catalogo.js";
import type { Dificultad } from "../../../compartido/partida.js";
import type { PeticionCrearTemporada } from "../../../compartido/temporada.js";
import { CasillaDelPerro } from "../componentes/CasillaDelPerro";
import { GrupoDeOpciones } from "../componentes/GrupoDeOpciones";
import { DIFICULTADES, DURACIONES_DE_LIGA, JUGADORES_DE_TEMPORADA } from "../componentes/opcionesDeJuego";
import { SelectorDeEquipo } from "../componentes/SelectorDeEquipo";
import { useCrearTemporada } from "../hooks/useCrearTemporada";

interface Props {
  equipos: Equipo[];
  alEmpezar: (temporadaId: string) => void;
  alVolver: () => void;
}

export function ConfigurarTemporada({ equipos, alEmpezar, alVolver }: Props) {
  const [jugadores, setJugadores] = useState<1 | 2>(1);
  const [primero, setPrimero] = useState<IdEquipo>("bolivar");
  const [segundo, setSegundo] = useState<IdEquipo>("theStrongest");
  const [dificultad, setDificultad] = useState<Dificultad>("medio");
  const [duracion, setDuracion] = useState(300);
  // Empieza desactivado: al activarlo se oye ladrar al perro.
  const [perroActivo, setPerroActivo] = useState(false);
  const { crear, enviando, error } = useCrearTemporada();

  async function empezar(evento: FormEvent) {
    evento.preventDefault();
    const peticion: PeticionCrearTemporada = {
      humanos: jugadores === 1 ? [primero] : [primero, segundo],
      dificultad,
      duracionRealSegundos: duracion,
      perroActivo,
    };
    const temporada = await crear(peticion);
    if (temporada) alEmpezar(temporada.id);
  }

  return (
    <main className="fondo-panel">
      <form className="panel configuracion" onSubmit={(evento) => void empezar(evento)}>
        <header className="panel__cabecera">
          <button type="button" className="boton boton--enlace" disabled={enviando} onClick={alVolver}>
            ← Volver
          </button>
          <h1>Temporada</h1>
        </header>

        <p className="configuracion__resumen">
          Los {equipos.length} equipos juegan todos contra todos a una vuelta: {equipos.length - 1} partidos de
          Liga para cada uno. Los partidos en los que no juega ninguna persona los resuelve el servidor, y al
          final el primero de la tabla es campeón.
        </p>

        <GrupoDeOpciones titulo="Jugadores" nombre="jugadores" opciones={JUGADORES_DE_TEMPORADA}
          valor={jugadores} alCambiar={setJugadores} />

        <div className="equipos-temporada">
          <SelectorDeEquipo
            etiqueta={jugadores === 1 ? "Tu equipo" : "Jugador 1"}
            valor={primero}
            equipos={equipos}
            alCambiar={setPrimero}
          />
          {jugadores === 2 && (
            <SelectorDeEquipo etiqueta="Jugador 2" valor={segundo} equipos={equipos} alCambiar={setSegundo} />
          )}
        </div>

        <GrupoDeOpciones titulo="Dificultad de los rivales del servidor" nombre="dificultad" opciones={DIFICULTADES}
          valor={dificultad} alCambiar={setDificultad} />

        <GrupoDeOpciones titulo="Duración real de cada partido" nombre="duracion" opciones={DURACIONES_DE_LIGA}
          valor={duracion} alCambiar={setDuracion} />

        <CasillaDelPerro activo={perroActivo} alCambiar={setPerroActivo} />

        {error && (
          <p className="mensaje mensaje--error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="boton boton--principal" disabled={enviando}>
          {enviando ? "Armando el calendario…" : "Empezar temporada"}
        </button>
      </form>
    </main>
  );
}
