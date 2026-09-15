import type { Equipo } from "../../../compartido/catalogo.js";
import type { Lado, Partida, PeticionCrearPartida } from "../../../compartido/partida.js";
import { equipoPorId } from "../hooks/useCatalogo";
import { useCrearPartida } from "../hooks/useCrearPartida";
import { IMAGEN_DE_ESCUDO } from "../recursos/indice";

interface Props {
  partida: Partida;
  equipos: Equipo[];
  /** Configuración para jugar la revancha. Un partido de temporada no tiene revancha. */
  revancha: PeticionCrearPartida | null;
  alJugarDeNuevo: (partida: Partida) => void;
  textoParaSalir: string;
  alSalir: () => void;
}

export function Resultado({ partida, equipos, revancha, alJugarDeNuevo, textoParaSalir, alSalir }: Props) {
  const { crear, enviando, error } = useCrearPartida();
  const marcador = partida.resultado?.marcador ?? partida.marcador;
  const ganador = partida.resultado?.ganador ?? null;
  const equipoDe = (lado: Lado) => equipoPorId(equipos, partida[lado].equipo);

  async function jugarRevancha(peticion: PeticionCrearPartida) {
    const nueva = await crear(peticion);
    if (nueva) alJugarDeNuevo(nueva);
  }

  return (
    <main className="fondo-panel">
      <section className="panel resultado">
        <p className="resultado__etiqueta">Pitazo final · {partida.modo === "liga" ? "Liga" : "Eliminatoria"}</p>
        <h1 data-testid="resultado">{ganador ? `¡Ganó ${equipoDe(ganador).nombre}!` : "¡Empate!"}</h1>

        <div className="resultado__marcador">
          <EquipoFinal equipo={equipoDe("local")} gano={ganador === "local"} />
          <span className="resultado__goles">
            {marcador.local} – {marcador.visitante}
          </span>
          <EquipoFinal equipo={equipoDe("visitante")} gano={ganador === "visitante"} />
        </div>

        {error && (
          <p className="mensaje mensaje--error" role="alert">
            {error}
          </p>
        )}

        <div className="resultado__acciones">
          {revancha && (
            <button
              type="button"
              className="boton boton--principal"
              disabled={enviando}
              onClick={() => void jugarRevancha(revancha)}
            >
              {enviando ? "Preparando…" : "Revancha"}
            </button>
          )}
          <button
            type="button"
            className={revancha ? "boton boton--secundario" : "boton boton--principal"}
            disabled={enviando}
            onClick={alSalir}
          >
            {textoParaSalir}
          </button>
        </div>
      </section>
    </main>
  );
}

function EquipoFinal({ equipo, gano }: { equipo: Equipo; gano: boolean }) {
  return (
    <div className={gano ? "resultado__equipo resultado__equipo--ganador" : "resultado__equipo"}>
      <img src={IMAGEN_DE_ESCUDO[equipo.id]} alt="" />
      <span>{equipo.nombre}</span>
    </div>
  );
}
