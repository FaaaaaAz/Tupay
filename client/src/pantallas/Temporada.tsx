import { useState } from "react";
import type { Equipo, IdEquipo } from "../../../compartido/catalogo.js";
import type { Partida } from "../../../compartido/partida.js";
import type {
  ControlDelRival,
  PartidoDeTemporada,
  Temporada as DatosTemporada,
} from "../../../compartido/temporada.js";
import { equipoPorId } from "../hooks/useCatalogo";
import { useTemporada } from "../hooks/useTemporada";
import { IMAGEN_DE_ESCUDO } from "../recursos/indice";

type Nombre = (equipo: IdEquipo) => string;

interface Props {
  temporadaId: string;
  equipos: Equipo[];
  alJugar: (partida: Partida) => void;
  alIrAlMenu: () => void;
}

export function Temporada({ temporadaId, equipos, alJugar, alIrAlMenu }: Props) {
  const { temporada, error, enviando, jugar } = useTemporada(temporadaId);
  const [controlDelRival, setControlDelRival] = useState<ControlDelRival>("servidor");
  const nombre: Nombre = (equipo) => equipoPorId(equipos, equipo).nombre;

  if (!temporada) {
    return (
      <main className="fondo-panel">
        <div className="panel">
          <p className={error ? "mensaje mensaje--error" : "mensaje"} role={error ? "alert" : "status"}>
            {error ?? "Cargando la temporada…"}
          </p>
          {error && (
            <button type="button" className="boton boton--secundario" onClick={alIrAlMenu}>
              Volver al menú
            </button>
          )}
        </div>
      </main>
    );
  }

  const proximos = temporada.partidos.filter((partido) => temporada.proximosPartidos.includes(partido.id));
  const esEntrePersonas = (partido: PartidoDeTemporada) =>
    temporada.humanos.includes(partido.local) && temporada.humanos.includes(partido.visitante);
  const puedeTomarElRival =
    temporada.humanos.length === 2 && proximos.some((partido) => !esEntrePersonas(partido));

  const empezar = async (partido: PartidoDeTemporada) => {
    const rival = puedeTomarElRival && !esEntrePersonas(partido) ? controlDelRival : undefined;
    const partida = await jugar(partido.id, rival);
    if (partida) alJugar(partida);
  };

  return (
    <main className="fondo-panel">
      <section className="panel temporada">
        <header className="panel__cabecera">
          <button type="button" className="boton boton--enlace" disabled={enviando} onClick={alIrAlMenu}>
            ← Menú
          </button>
          <h1>Temporada</h1>
          <span className="temporada__jornada" data-testid="jornada">
            {temporada.jornadaActual === null
              ? "Temporada terminada"
              : `Jornada ${temporada.jornadaActual} de ${temporada.totalDeJornadas}`}
          </span>
        </header>

        {temporada.campeon && (
          <div className="temporada__campeon" data-testid="campeon">
            <img src={IMAGEN_DE_ESCUDO[temporada.campeon]} alt="" />
            <p>¡{nombre(temporada.campeon)} es el campeón!</p>
          </div>
        )}

        {proximos.length > 0 && (
          <section className="temporada__proximos">
            <h2>{proximos.length === 1 ? "Próximo partido" : "Próximos partidos"}</h2>
            {proximos.map((partido) => (
              <div key={partido.id} className="proximo">
                <Cruce partido={partido} nombre={nombre} />
                {partido.estado === "enJuego" && (
                  <span className="proximo__aviso">Quedó a medias: empieza de nuevo</span>
                )}
                <button
                  type="button"
                  className="boton boton--principal"
                  disabled={enviando}
                  onClick={() => void empezar(partido)}
                >
                  Jugar partido
                </button>
              </div>
            ))}

            {puedeTomarElRival && (
              <fieldset className="grupo">
                <legend>El rival que no es de ninguno de los dos</legend>
                <label className="opcion">
                  <input
                    type="radio"
                    name="rival"
                    checked={controlDelRival === "servidor"}
                    onChange={() => setControlDelRival("servidor")}
                  />
                  Lo maneja el servidor
                </label>
                <label className="opcion">
                  <input
                    type="radio"
                    name="rival"
                    checked={controlDelRival === "humano"}
                    onChange={() => setControlDelRival("humano")}
                  />
                  Lo maneja el otro jugador
                </label>
              </fieldset>
            )}
          </section>
        )}

        {error && (
          <p className="mensaje mensaje--error" role="alert">
            {error}
          </p>
        )}

        <div className="temporada__cuerpo">
          <TablaDePosiciones temporada={temporada} nombre={nombre} />
          <Calendario temporada={temporada} nombre={nombre} />
        </div>
      </section>
    </main>
  );
}

function Cruce({ partido, nombre }: { partido: PartidoDeTemporada; nombre: Nombre }) {
  return (
    <div className="cruce">
      <img src={IMAGEN_DE_ESCUDO[partido.local]} alt="" />
      <span>{nombre(partido.local)}</span>
      <span className="cruce__vs">vs</span>
      <span>{nombre(partido.visitante)}</span>
      <img src={IMAGEN_DE_ESCUDO[partido.visitante]} alt="" />
    </div>
  );
}

function TablaDePosiciones({ temporada, nombre }: { temporada: DatosTemporada; nombre: Nombre }) {
  return (
    <div>
      <h2>Tabla de posiciones</h2>
      <table className="tabla" data-testid="tabla">
        <thead>
          <tr>
            <th>#</th>
            <th className="tabla__equipo">Equipo</th>
            <th>
              <abbr title="Partidos jugados">PJ</abbr>
            </th>
            <th>
              <abbr title="Ganados">G</abbr>
            </th>
            <th>
              <abbr title="Empatados">E</abbr>
            </th>
            <th>
              <abbr title="Perdidos">P</abbr>
            </th>
            <th>
              <abbr title="Diferencia de goles">DG</abbr>
            </th>
            <th>
              <abbr title="Puntos">Pts</abbr>
            </th>
          </tr>
        </thead>
        <tbody>
          {temporada.tabla.map((fila, posicion) => (
            <tr
              key={fila.equipo}
              data-testid="fila-tabla"
              className={temporada.humanos.includes(fila.equipo) ? "tabla__fila--persona" : undefined}
            >
              <td>{posicion + 1}</td>
              <td className="tabla__equipo">
                <span className="tabla__nombre">
                  <img src={IMAGEN_DE_ESCUDO[fila.equipo]} alt="" />
                  {nombre(fila.equipo)}
                </span>
              </td>
              <td data-columna="jugados">{fila.jugados}</td>
              <td>{fila.ganados}</td>
              <td>{fila.empatados}</td>
              <td>{fila.perdidos}</td>
              <td>{fila.diferencia > 0 ? `+${fila.diferencia}` : fila.diferencia}</td>
              <td className="tabla__puntos">{fila.puntos}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Calendario({ temporada, nombre }: { temporada: DatosTemporada; nombre: Nombre }) {
  const jornadas = Array.from({ length: temporada.totalDeJornadas }, (_, indice) => indice + 1);

  return (
    <div>
      <h2>Calendario</h2>
      <ol className="calendario">
        {jornadas.map((jornada) => (
          <li
            key={jornada}
            className={
              jornada === temporada.jornadaActual
                ? "calendario__jornada calendario__jornada--actual"
                : "calendario__jornada"
            }
          >
            <h3>Jornada {jornada}</h3>
            <ul>
              {temporada.partidos
                .filter((partido) => partido.jornada === jornada)
                .map((partido) => (
                  <li key={partido.id} className={`calendario__partido calendario__partido--${partido.estado}`}>
                    <span className="calendario__equipo calendario__equipo--local">
                      {nombre(partido.local)}
                      <img src={IMAGEN_DE_ESCUDO[partido.local]} alt="" />
                    </span>
                    <strong>
                      {partido.marcador ? `${partido.marcador.local} – ${partido.marcador.visitante}` : "vs"}
                    </strong>
                    <span className="calendario__equipo">
                      <img src={IMAGEN_DE_ESCUDO[partido.visitante]} alt="" />
                      {nombre(partido.visitante)}
                    </span>
                    <small>{partido.estado === "simulado" ? "sim." : ""}</small>
                  </li>
                ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
