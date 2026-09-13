import { useState, type FormEvent } from "react";
import type { Equipo, Estadio, IdEquipo, IdEstadio } from "../../../compartido/catalogo.js";
import type { Dificultad, Modo, Partida, PeticionCrearPartida } from "../../../compartido/partida.js";
import { equipoPorId } from "../hooks/useCatalogo";
import { useCrearPartida } from "../hooks/useCrearPartida";
import { IMAGEN_DE_EQUIPO } from "../recursos/indice";

const METAS_DE_GOLES = [1, 2, 3, 4, 5];

const DURACIONES_DE_LIGA = [
  { segundos: 150, texto: "2 min 30 s" },
  { segundos: 300, texto: "5 minutos" },
  { segundos: 600, texto: "10 minutos" },
];

const DIFICULTADES: { valor: Dificultad; texto: string }[] = [
  { valor: "facil", texto: "Fácil" },
  { valor: "medio", texto: "Medio" },
  { valor: "dificil", texto: "Difícil" },
];

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
      ...(estadio ? { estadio } : {}),
      ...(modo === "eliminatoria" ? { golesParaGanar } : { duracionRealSegundos: duracion }),
    };
    const partida = await crear(peticion);
    if (partida) alJugar(partida, peticion);
  }

  return (
    <main className="fondo-panel">
      <form className="panel configuracion" onSubmit={(evento) => void empezar(evento)}>
        <header className="panel__cabecera">
          <button type="button" className="boton boton--enlace" onClick={alVolver}>
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
        </label>

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

interface PropsSelector {
  etiqueta: string;
  valor: IdEquipo;
  equipos: Equipo[];
  alCambiar: (equipo: IdEquipo) => void;
}

function SelectorDeEquipo({ etiqueta, valor, equipos, alCambiar }: PropsSelector) {
  return (
    <label className="selector-equipo">
      <span className="campo__etiqueta">{etiqueta}</span>
      <img className="selector-equipo__tapita" src={IMAGEN_DE_EQUIPO[valor]} alt="" />
      <select value={valor} onChange={(evento) => alCambiar(evento.target.value as IdEquipo)}>
        {equipos.map((equipo) => (
          <option key={equipo.id} value={equipo.id}>
            {equipo.nombre}
          </option>
        ))}
      </select>
    </label>
  );
}
