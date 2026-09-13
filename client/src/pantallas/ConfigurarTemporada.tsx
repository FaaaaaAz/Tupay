import { useState, type FormEvent } from "react";
import type { Equipo, IdEquipo } from "../../../compartido/catalogo.js";
import type { Dificultad } from "../../../compartido/partida.js";
import type { PeticionCrearTemporada } from "../../../compartido/temporada.js";
import { DIFICULTADES, DURACIONES_DE_LIGA } from "../componentes/opcionesDeJuego";
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
  const [perroActivo, setPerroActivo] = useState(true);
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
          <button type="button" className="boton boton--enlace" onClick={alVolver}>
            ← Volver
          </button>
          <h1>Temporada</h1>
        </header>

        <p className="configuracion__resumen">
          Los {equipos.length} equipos juegan todos contra todos a una vuelta: {equipos.length - 1} partidos de
          Liga para cada uno. Los partidos en los que no juega ninguna persona los resuelve el servidor, y al
          final el primero de la tabla es campeón.
        </p>

        <fieldset className="grupo">
          <legend>Jugadores</legend>
          <label className="opcion">
            <input type="radio" name="jugadores" checked={jugadores === 1} onChange={() => setJugadores(1)} />
            1 jugador
          </label>
          <label className="opcion">
            <input type="radio" name="jugadores" checked={jugadores === 2} onChange={() => setJugadores(2)} />
            2 jugadores en este dispositivo
          </label>
        </fieldset>

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

        <fieldset className="grupo">
          <legend>Dificultad de los rivales del servidor</legend>
          {DIFICULTADES.map(({ valor, texto }) => (
            <label key={valor} className="opcion">
              <input
                type="radio"
                name="dificultad"
                checked={dificultad === valor}
                onChange={() => setDificultad(valor)}
              />
              {texto}
            </label>
          ))}
        </fieldset>

        <label className="campo">
          <span className="campo__etiqueta">Duración real de cada partido</span>
          <select value={duracion} onChange={(evento) => setDuracion(Number(evento.target.value))}>
            {DURACIONES_DE_LIGA.map(({ segundos, texto }) => (
              <option key={segundos} value={segundos}>
                {texto}
              </option>
            ))}
          </select>
        </label>

        <label className="opcion">
          <input type="checkbox" checked={perroActivo} onChange={(evento) => setPerroActivo(evento.target.checked)} />
          El perro puede meterse a la cancha
        </label>

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
