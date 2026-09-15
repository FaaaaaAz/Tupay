import { useEffect } from "react";
import type { Modo } from "../../../compartido/partida.js";
import { IMAGENES, IMAGEN_DE_TARJETA } from "../recursos/indice";
import { precargarImagen } from "../recursos/precargar";
import { ControlesAudio } from "../componentes/ControlesAudio";

interface Props {
  alElegirModo: (modo: Modo) => void;
  alVerTemporada: () => void;
  alVerInstrucciones: () => void;
  alVolver: () => void;
}

export function Menu({ alElegirModo, alVerTemporada, alVerInstrucciones, alVolver }: Props) {
  // Todas las tarjetas llevan a un panel: su fondo ya queda descargado al abrirlo.
  useEffect(() => { void precargarImagen(IMAGENES.paneles); }, []);

  return (
    <main className="menu" style={{ backgroundImage: `url(${IMAGENES.menu})` }}>
      <ControlesAudio />
      <header className="menu__cabecera">
        <p className="menu__leyenda">Fútbol de tapitas · Bolivia</p>
        <h1 className="menu__titulo">Tupay</h1>
        <p className="menu__subtitulo">Tu equipo. Tu jugada. Tu cancha.</p>
      </header>

      <div className="menu__tarjetas">
        <button type="button" className="tarjeta-menu" onClick={() => alElegirModo("eliminatoria")}>
          <img className="tarjeta-menu__imagen" src={IMAGEN_DE_TARJETA.eliminatoria} alt="" />
          <span className="tarjeta-menu__nombre">Eliminatoria</span>
          <span className="tarjeta-menu__detalle">
            Un partido a una meta de 1 a 5 goles. No hay empate: gana el primero en llegar.
          </span>
          <span className="tarjeta-menu__accion" aria-hidden="true">A ganar <span>↗</span></span>
        </button>

        <button type="button" className="tarjeta-menu" onClick={() => alElegirModo("liga")}>
          <img className="tarjeta-menu__imagen" src={IMAGEN_DE_TARJETA.liga} alt="" />
          <span className="tarjeta-menu__nombre">Liga</span>
          <span className="tarjeta-menu__detalle">
            Un partido de 90 minutos a reloj acelerado. Gana quien tenga más goles, y puede terminar empatado.
          </span>
          <span className="tarjeta-menu__accion" aria-hidden="true">Jugar partido <span>↗</span></span>
        </button>

        <button type="button" className="tarjeta-menu" onClick={alVerTemporada}>
          <img className="tarjeta-menu__imagen" src={IMAGEN_DE_TARJETA.temporada} alt="" />
          <span className="tarjeta-menu__nombre">Temporada</span>
          <span className="tarjeta-menu__detalle">
            Los 10 equipos, todos contra todos, con tabla de posiciones y campeón.
          </span>
          <span className="tarjeta-menu__accion" aria-hidden="true">Ir por el título <span>↗</span></span>
        </button>

        <button type="button" className="tarjeta-menu" onClick={alVerInstrucciones}>
          <img className="tarjeta-menu__imagen" src={IMAGEN_DE_TARJETA.instrucciones} alt="" />
          <span className="tarjeta-menu__nombre">Cómo se juega</span>
          <span className="tarjeta-menu__detalle">Cómo tirar, los turnos, los modos y el perro.</span>
          <span className="tarjeta-menu__accion" aria-hidden="true">Aprender a jugar <span>↗</span></span>
        </button>
      </div>

      <button type="button" className="boton boton--enlace" onClick={alVolver}>
        ← Volver a la portada
      </button>
    </main>
  );
}
