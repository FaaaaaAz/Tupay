import { useState, type FormEvent } from "react";
import type { Equipo, Estadio, IdEquipo, IdEstadio } from "../../../compartido/catalogo.js";
import type { Dificultad, Modo, Partida, PeticionCrearPartida } from "../../../compartido/partida.js";
import { DESCRIPCION_DE_EFECTO, DIFICULTADES, DURACIONES_DE_LIGA } from "../componentes/opcionesDeJuego";
import { SelectorDeEquipo } from "../componentes/SelectorDeEquipo";
import { equipoPorId } from "../hooks/useCatalogo";
import { useCrearPartida } from "../hooks/useCrearPartida";
import { IMAGEN_DE_ESTADIO } from "../recursos/indice";

const METAS_DE_GOLES = [1, 2, 3, 4, 5];

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
  const [estadio, setEstadio] = useState<IdEstadio | "">("");
  const [golesParaGanar, setGolesParaGanar] = useState(3);
  const [duracion, setDuracion] = useState(300);
  const [perroActivo, setPerroActivo] = useState(true);
  const { crear, enviando, error } = useCrearPartida();

  const estadioDelLocal = estadios.find(
    (candidato) => candidato.id === equipoPorId(equipos, local).estadio,
  );
  const estadioElegido = estadios.find((candidato) => candidato.id === estadio) ?? estadioDelLocal;

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
      estadio: estadioElegido?.id,
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

        <fieldset className="grupo">
          <legend>Jugadores</legend>
          <label className="opcion">
            <input type="radio" name="jugadores" checked={jugadores === 1} onChange={() => setJugadores(1)} />
            1 jugador contra el servidor
          </label>
          <label className="opcion">
            <input type="radio" name="jugadores" checked={jugadores === 2} onChange={() => setJugadores(2)} />
            2 jugadores en este dispositivo
          </label>
        </fieldset>

        {jugadores === 1 && (
          <fieldset className="grupo">
            <legend>Dificultad del servidor</legend>
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

        <div className="estadio-elegido">
          <label className="campo">
            <span className="campo__etiqueta">Estadio</span>
            <select value={estadio} onChange={(evento) => setEstadio(evento.target.value as IdEstadio | "")}>
              <option value="">El del equipo local ({estadioDelLocal?.nombre})</option>
              {estadios.map((opcion) => (
                <option key={opcion.id} value={opcion.id}>
                  {opcion.nombre} · {opcion.ciudad}
                </option>
              ))}
            </select>
            {estadioElegido && (
              <span className="estadio-elegido__efecto" data-testid="efecto-estadio">
                {DESCRIPCION_DE_EFECTO[estadioElegido.efecto]}
              </span>
            )}
          </label>
          {estadioElegido && (
            <img className="estadio-elegido__vista" src={IMAGEN_DE_ESTADIO[estadioElegido.id]} alt="" />
          )}
        </div>

        {modo === "eliminatoria" ? (
          <fieldset className="grupo">
            <legend>Meta de goles</legend>
            {METAS_DE_GOLES.map((meta) => (
              <label key={meta} className="opcion">
                <input
                  type="radio"
                  name="meta"
                  checked={golesParaGanar === meta}
                  onChange={() => setGolesParaGanar(meta)}
                />
                {meta}
              </label>
            ))}
          </fieldset>
        ) : (
          <label className="campo">
            <span className="campo__etiqueta">Duración real del partido</span>
            <select value={duracion} onChange={(evento) => setDuracion(Number(evento.target.value))}>
              {DURACIONES_DE_LIGA.map(({ segundos, texto }) => (
                <option key={segundos} value={segundos}>
                  {texto}
                </option>
              ))}
            </select>
          </label>
        )}

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
          {enviando ? "Preparando la cancha…" : "Jugar"}
        </button>
      </form>
    </main>
  );
}
