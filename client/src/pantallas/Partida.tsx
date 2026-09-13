import { useEffect, useState, type CSSProperties } from "react";
import type { Equipo } from "../../../compartido/catalogo.js";
import type { Partida as DatosPartida, Evento, Jugador, Lado } from "../../../compartido/partida.js";
import { Cancha } from "../componentes/Cancha";
import { equipoPorId } from "../hooks/useCatalogo";
import { usePartida, type TiroDesdeLaCancha } from "../hooks/usePartida";
import { IMAGEN_DE_EQUIPO } from "../recursos/indice";

/** Tiempo para ver la última jugada antes de pasar a la pantalla de resultado. */
const PAUSA_ANTES_DEL_RESULTADO_MS = 1800;

interface Props {
  partidaInicial: DatosPartida;
  equipos: Equipo[];
  alTerminar: (partida: DatosPartida) => void;
  alSalir: () => void;
}

export function Partida({ partidaInicial, equipos, alTerminar, alSalir }: Props) {
  const juego = usePartida(partidaInicial);
  const { partida } = juego;
  const [tiroDePoder, setTiroDePoder] = useState(false);

  const equipoDe = (lado: Lado) => equipoPorId(equipos, partida[lado].equipo);
  const ladoDelTurno = partida.turno.lado;
  const jugadorDelTurno = partida[ladoDelTurno];
  const terminada = partida.estado === "finalizada" && !juego.animando;

  useEffect(() => {
    if (!terminada) return;
    const espera = setTimeout(() => alTerminar(partida), PAUSA_ANTES_DEL_RESULTADO_MS);
    return () => clearTimeout(espera);
  }, [terminada, partida, alTerminar]);

  function tirar(tiro: TiroDesdeLaCancha) {
    juego.tirar({ ...tiro, tiroDePoder });
    setTiroDePoder(false);
  }

  function salir() {
    if (window.confirm("¿Salir del partido? Se va a perder el marcador.")) alSalir();
  }

  const mensaje =
    juego.error ??
    describirEventos(juego.eventos, (lado) => equipoDe(lado).nombre) ??
    instruccion(juego.puedeTirar, juego.animando, jugadorDelTurno, equipoDe(ladoDelTurno).nombre);

  return (
    <main className="partida">
      <header className="marcador">
        <EquipoEnMarcador
          equipo={equipoDe("local")}
          jugador={partida.local}
          activo={ladoDelTurno === "local" && !terminada}
        />
        <div className="marcador__centro">
          <span className="marcador__goles" data-testid="marcador">
            {partida.marcador.local} – {partida.marcador.visitante}
          </span>
          <span className="marcador__detalle">
            {partida.modo === "eliminatoria"
              ? `Gana quien llegue a ${partida.golesParaGanar}`
              : `Minuto ${juego.minutoDeJuego ?? 0}'`}
          </span>
        </div>
        <EquipoEnMarcador
          equipo={equipoDe("visitante")}
          jugador={partida.visitante}
          activo={ladoDelTurno === "visitante" && !terminada}
        />
      </header>

      <section className="partida__cancha">
        <Cancha
          partida={partida}
          cuadro={juego.cuadro}
          puedeApuntar={juego.puedeTirar}
          tiroDePoder={tiroDePoder}
          alTirar={tirar}
        />
      </section>

      <footer className="partida__pie">
        <p className="turno" data-testid="turno">
          {terminada ? (
            "Partido terminado"
          ) : (
            <>
              Turno de <strong>{equipoDe(ladoDelTurno).nombre}</strong>
              {juego.segundosDelTurno !== null && (
                <>
                  {" · "}
                  <span
                    className={
                      juego.segundosDelTurno <= 5 ? "turno__segundos turno__segundos--urgente" : "turno__segundos"
                    }
                  >
                    {juego.segundosDelTurno} s
                  </span>
                </>
              )}
            </>
          )}
        </p>

        <button
          type="button"
          className="boton boton--secundario boton--poder"
          aria-pressed={tiroDePoder}
          disabled={!juego.puedeTirar || jugadorDelTurno.tirosDePoder === 0}
          onClick={() => setTiroDePoder((activo) => !activo)}
        >
          Tiro de poder ({jugadorDelTurno.tirosDePoder})
        </button>

        <p className={juego.error ? "mensaje mensaje--error" : "mensaje"} role="status" data-testid="mensaje">
          {mensaje}
        </p>

        <button type="button" className="boton boton--enlace" onClick={salir}>
          Salir
        </button>
      </footer>

      {juego.perdida && (
        <div className="aviso-perdida" role="alertdialog" aria-labelledby="titulo-perdida">
          <div className="panel">
            <h2 id="titulo-perdida">Esta partida ya no existe</h2>
            <p>
              El servidor se reinició y las partidas se guardan en memoria. Empieza una nueva desde el
              menú.
            </p>
            <button type="button" className="boton boton--principal" onClick={alSalir}>
              Ir al menú
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

interface PropsEquipo {
  equipo: Equipo;
  jugador: Jugador;
  activo: boolean;
}

function EquipoEnMarcador({ equipo, jugador, activo }: PropsEquipo) {
  const clases = ["marcador__equipo", `marcador__equipo--${jugador.lado}`, activo && "marcador__equipo--activo"]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={clases} style={{ "--color-equipo": equipo.colorPrincipal } as CSSProperties}>
      <img className="marcador__tapita" src={IMAGEN_DE_EQUIPO[equipo.id]} alt="" />
      <div>
        <span className="marcador__nombre">{equipo.nombre}</span>
        <span className="marcador__rol">
          {jugador.tipo === "servidor" ? "Servidor" : "Jugador"} · tiros de poder: {jugador.tirosDePoder}
        </span>
      </div>
    </div>
  );
}

function describirEventos(eventos: Evento[], nombre: (lado: Lado) => string): string | null {
  if (eventos.length === 0) return null;
  return eventos
    .map((evento) => {
      switch (evento.tipo) {
        case "gol":
          return `¡Gol de ${nombre(evento.lado)}!`;
        case "perro":
          return `¡El perro se metió a la cancha! Ahora le toca a ${nombre(evento.turnoPara)}.`;
        case "finDelPartido":
          return "¡Final del partido!";
        case "pelotaAtrapada":
          return "La pelota quedó atrapada en un charco.";
        case "pelotaLiberada":
          return "La pelota salió del charco.";
        case "turnoPerdido":
          return `${nombre(evento.lado)} perdió el turno.`;
      }
    })
    .join(" ");
}

function instruccion(puedeTirar: boolean, animando: boolean, jugador: Jugador, nombre: string): string {
  if (animando) return "";
  if (puedeTirar) return "Arrastra hacia atrás desde una de tus tapitas y suelta para tirar.";
  if (jugador.tipo === "servidor") return `${nombre} está pensando su tiro…`;
  return "";
}
