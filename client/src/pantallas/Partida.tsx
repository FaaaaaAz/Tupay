import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import type { Equipo } from "../../../compartido/catalogo.js";
import type {
  Partida as DatosPartida,
  Evento,
  Jugador,
  Lado,
  Pelota,
} from "../../../compartido/partida.js";
import { BarraDeEmotes } from "../componentes/BarraDeEmotes";
import { Cancha } from "../componentes/Cancha";
import { Modal } from "../componentes/Modal";
import { AvisoDeJugada } from "../componentes/AvisoDeJugada";
import { equipoPorId } from "../hooks/useCatalogo";
import { usePartida, type TiroDesdeLaCancha } from "../hooks/usePartida";
import { IMAGEN_DE_ESCUDO } from "../recursos/indice";

/** Tiempo para ver la última jugada antes de pasar a la pantalla de resultado. */
const PAUSA_ANTES_DEL_RESULTADO_MS = 1800;

interface Props {
  partidaInicial: DatosPartida;
  equipos: Equipo[];
  alTerminar: (partida: DatosPartida) => void;
  alSalir: () => void;
  esTemporada: boolean;
}

export function Partida({ partidaInicial, equipos, alTerminar, alSalir, esTemporada }: Props) {
  const juego = usePartida(partidaInicial);
  const { partida } = juego;
  const [tiroDePoder, setTiroDePoder] = useState(false);
  const [modal, setModal] = useState<"pausa" | "salir" | null>(null);
  const [volverAPausa, setVolverAPausa] = useState(false);
  // La selección de poder no se hereda cuando se agota un turno.
  const [turnoDelPoder, setTurnoDelPoder] = useState(partida.turno);
  const poderVigente = tiroDePoder && turnoDelPoder === partida.turno;

  const equipoDe = (lado: Lado) => equipoPorId(equipos, partida[lado].equipo);
  const ladoDelTurno = partida.turno.lado;
  const jugadorDelTurno = partida[ladoDelTurno];
  const terminada = partida.estado === "finalizada" && !juego.animando;

  useEffect(() => {
    if (!terminada || modal || juego.pausada || juego.cambiandoPausa) return;
    const espera = setTimeout(() => alTerminar(partida), PAUSA_ANTES_DEL_RESULTADO_MS);
    return () => clearTimeout(espera);
  }, [terminada, partida, alTerminar, modal, juego.pausada, juego.cambiandoPausa]);

  useEffect(() => {
    function tecla(evento: KeyboardEvent) {
      if (evento.key !== "Escape" || modal || juego.perdida || terminada || !juego.puedePausar) return;
      evento.preventDefault();
      setModal("pausa");
      void juego.cambiarPausa(true);
    }
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [juego, modal, terminada]);

  function tirar(tiro: TiroDesdeLaCancha) {
    juego.tirar({ ...tiro, tiroDePoder: poderVigente });
    setTiroDePoder(false);
  }

  function salir() {
    setVolverAPausa(modal === "pausa");
    setModal("salir");
    if (!juego.pausada) void juego.cambiarPausa(true);
  }

  async function continuar() {
    if (modal === "salir" && volverAPausa) { setModal("pausa"); return; }
    if (await juego.cambiarPausa(false)) setModal(null);
  }

  /** Solo las personas tienen caritas: el equipo del servidor no las usa. */
  function barraDeEmotes(lado: Lado) {
    if (partida[lado].tipo !== "humano") return null;
    return (
      <BarraDeEmotes
        nombreDelEquipo={equipoDe(lado).nombre}
        espera={juego.esperaEmote[lado]}
        deshabilitada={!juego.puedeLanzarEmote}
        alElegir={(emote) => void juego.lanzarEmote(lado, emote)}
      />
    );
  }

  const mensaje =
    juego.error ??
    describirEventos(juego.eventos, (lado) => equipoDe(lado).nombre) ??
    instruccion(juego.puedeTirar, juego.animando, jugadorDelTurno, equipoDe(ladoDelTurno).nombre, partida.pelota);

  const gol = juego.eventos.find((evento) => evento.tipo === "gol");
  const atrapada = juego.eventos.find((evento) => evento.tipo === "pelotaAtrapada");
  const aviso = juego.cuadro?.perro
    ? { tipo: "perro" as const, titulo: "¡El perro entró!", detalle: "Se lleva la pelota al otro lado" }
    : juego.animando ? null
    : gol ? { tipo: "gol" as const, titulo: "¡Gooool!", detalle: `${equipoDe(gol.lado).nombre}${terminada ? " · Final del partido" : " · ¡A seguir jugando!"}` }
    : terminada ? { tipo: "final" as const, titulo: "Final del partido", detalle: "El resultado ya está confirmado" }
    : atrapada ? { tipo: "charco" as const, titulo: "Pelota atrapada", detalle: `${atrapada.tipoCharco === "nieve" ? "Nieve" : "Agua"} · Golpéala para liberarla` }
    : { tipo: "turno" as const, titulo: `Turno de ${equipoDe(ladoDelTurno).nombre}`, detalle: jugadorDelTurno.tipo === "humano" ? "Elige tu tapita y prepara el tiro" : "El rival prepara su jugada" };

  return (
    <main className={juego.pausada || modal ? "partida partida--pausada" : "partida"}>
      <header className="marcador">
        <EquipoEnMarcador
          equipo={equipoDe("local")}
          jugador={partida.local}
          activo={ladoDelTurno === "local" && !terminada}
        >
          {barraDeEmotes("local")}
        </EquipoEnMarcador>
        <div className="marcador__centro">
          <span key={`${partida.marcador.local}-${partida.marcador.visitante}`} className="marcador__goles" data-testid="marcador">
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
        >
          {barraDeEmotes("visitante")}
        </EquipoEnMarcador>
      </header>

      <section className="partida__cancha">
        {aviso && !juego.perdida && (
          <AvisoDeJugada key={`${aviso.tipo}-${aviso.titulo}-${partida.marcador.local}-${partida.marcador.visitante}`}
            {...aviso} pausado={juego.pausada || juego.cambiandoPausa || modal !== null} />
        )}
        <Cancha
          partida={partida}
          cuadro={juego.cuadro}
          rotacionPelota={juego.rotacion}
          puedeApuntar={juego.puedeTirar && !modal}
          tiroDePoder={poderVigente}
          emotes={juego.emotes}
          alTirar={tirar}
        />
      </section>

      <footer className="partida__pie">
        <p key={ladoDelTurno} className="turno" data-testid="turno">
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
          aria-pressed={poderVigente}
          aria-label={`Tiro de poder (${jugadorDelTurno.tirosDePoder})`}
          disabled={!juego.puedeTirar || jugadorDelTurno.tirosDePoder === 0}
          onClick={() => { setTurnoDelPoder(partida.turno); setTiroDePoder(!poderVigente); }}
        >
          Tiro de poder ({jugadorDelTurno.tirosDePoder})
          {poderVigente && <span className="poder-activado" aria-hidden="true">Activado · +50 %</span>}
        </button>

        <p className={juego.error ? "mensaje mensaje--error" : "mensaje"} role="status" data-testid="mensaje">
          {mensaje}
        </p>

        <div className="partida__acciones">
          <button type="button" className="boton boton--secundario" disabled={!juego.puedePausar || terminada}
            onClick={() => { setModal("pausa"); void juego.cambiarPausa(true); }}>
            <span aria-hidden="true">Ⅱ </span>Pausar
          </button>
          <button type="button" className="boton boton--enlace" disabled={!juego.puedePausar} onClick={salir}>Salir</button>
        </div>
      </footer>

      {juego.perdida && (
        <Modal titulo="Esta partida ya no existe" detalle="No pudimos recuperar el partido. Puedes volver y empezar uno nuevo." alCancelar={alSalir}>
            <button type="button" className="boton boton--principal" onClick={alSalir}>
              {esTemporada ? "Volver a la temporada" : "Ir al menú"}
            </button>
        </Modal>
      )}
      {modal && !juego.perdida && (
        <Modal titulo={modal === "salir" ? "¿Abandonar el partido?" : "Partido en pausa"}
          detalle={modal === "salir"
            ? esTemporada
              ? "Si el partido no terminó, el marcador se descarta y podrás volver a jugarlo desde la temporada. Los resultados ya confirmados se conservan."
              : "Perderás el progreso de este partido y volverás al menú."
            : juego.error
              ? "No pudimos confirmar el estado del partido. Reintenta reanudar cuando vuelva la conexión."
              : juego.cambiandoPausa
                ? "Estamos sincronizando la pausa. Un momento…"
                : "Respira, prepara tu próxima jugada y vuelve a la cancha. El tiempo está detenido."}
          ocupado={juego.cambiandoPausa} alCancelar={() => void continuar()}>
          <div className="modal__marcador" aria-label="Marcador actual">{equipoDe("local").nombre}<strong>{partida.marcador.local} – {partida.marcador.visitante}</strong>{equipoDe("visitante").nombre}</div>
          {juego.error && <p role="alert" className="mensaje mensaje--error">{juego.error}</p>}
          <button type="button" className="boton boton--principal" disabled={juego.cambiandoPausa} onClick={() => void continuar()}>
            {modal === "salir" ? "Seguir jugando" : "Reanudar partido"}
          </button>
          <button type="button" className={modal === "salir" ? "boton boton--peligro" : "boton boton--secundario"}
            disabled={juego.cambiandoPausa} onClick={modal === "salir"
              ? () => { void juego.abandonar().then((salio) => { if (salio) alSalir(); }); }
              : salir}>
            {modal === "salir" ? "Sí, abandonar" : "Salir del partido"}
          </button>
        </Modal>
      )}
    </main>
  );
}

interface PropsEquipo {
  equipo: Equipo;
  jugador: Jugador;
  activo: boolean;
  /** La barra de emotes, cuando el equipo lo maneja una persona. */
  children?: ReactNode;
}

function EquipoEnMarcador({ equipo, jugador, activo, children }: PropsEquipo) {
  const clases = ["marcador__equipo", `marcador__equipo--${jugador.lado}`, activo && "marcador__equipo--activo"]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={clases} style={{ "--color-equipo": equipo.colorPrincipal } as CSSProperties}>
      <img className="marcador__escudo" src={IMAGEN_DE_ESCUDO[equipo.id]} alt="" />
      <div>
        <span className="marcador__nombre">{equipo.nombre}</span>
        <span className="marcador__rol">
          {jugador.tipo === "servidor" ? "Servidor" : "Jugador"} · tiros de poder: {jugador.tirosDePoder}
        </span>
      </div>
      {children}
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
          return `¡La pelota cayó en un charco de ${evento.tipoCharco}!`;
        case "pelotaLiberada":
          return "La pelota salió del charco.";
        case "turnoPerdido":
          return `${nombre(evento.lado)} perdió el turno.`;
      }
    })
    .join(" ");
}

function instruccion(
  puedeTirar: boolean,
  animando: boolean,
  jugador: Jugador,
  nombre: string,
  pelota: Pelota,
): string {
  if (animando) return "";
  if (puedeTirar && pelota.atrapadaEn) {
    const golpes =
      pelota.golpesParaLiberar === 1 ? "hace falta un golpe" : `hacen falta ${pelota.golpesParaLiberar} golpes`;
    return `La pelota está atrapada en un charco: ${golpes} para sacarla, o un tiro de poder.`;
  }
  if (puedeTirar) return "Arrastra hacia atrás desde una de tus tapitas y suelta para tirar.";
  if (jugador.tipo === "servidor") return `${nombre} está pensando su tiro…`;
  return "";
}
