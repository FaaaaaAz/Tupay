import type { Modo } from "../../../compartido/partida.js";
import { IMAGENES } from "../recursos/indice";

interface Props {
  alElegirModo: (modo: Modo) => void;
  alVerTemporada: () => void;
  alVerInstrucciones: () => void;
  alVolver: () => void;
}

export function Menu({ alElegirModo, alVerTemporada, alVerInstrucciones, alVolver }: Props) {
  return (
    <main className="menu" style={{ backgroundImage: `url(${IMAGENES.menu})` }}>
      <header className="menu__cabecera">
        <p className="menu__leyenda">Fútbol de tapitas · Bolivia</p>
        <h1 className="menu__titulo">Tupay</h1>
        <p className="menu__subtitulo">Tu equipo. Tu jugada. Tu cancha.</p>
      </header>

      <div className="menu__tarjetas">
        <button type="button" className="tarjeta-menu" onClick={() => alElegirModo("eliminatoria")}>
          <IconoDeModo tipo="copa" />
          <span className="tarjeta-menu__nombre">Eliminatoria</span>
          <span className="tarjeta-menu__detalle">
            Un partido a una meta de 1 a 5 goles. No hay empate: gana el primero en llegar.
          </span>
          <span className="tarjeta-menu__accion" aria-hidden="true">A ganar <span>↗</span></span>
        </button>

        <button type="button" className="tarjeta-menu" onClick={() => alElegirModo("liga")}>
          <IconoDeModo tipo="reloj" />
          <span className="tarjeta-menu__nombre">Liga</span>
          <span className="tarjeta-menu__detalle">
            Un partido de 90 minutos a reloj acelerado. Gana quien tenga más goles, y puede terminar empatado.
          </span>
          <span className="tarjeta-menu__accion" aria-hidden="true">Jugar partido <span>↗</span></span>
        </button>

        <button type="button" className="tarjeta-menu" onClick={alVerTemporada}>
          <IconoDeModo tipo="tabla" />
          <span className="tarjeta-menu__nombre">Temporada</span>
          <span className="tarjeta-menu__detalle">
            Los 10 equipos, todos contra todos, con tabla de posiciones y campeón.
          </span>
          <span className="tarjeta-menu__accion" aria-hidden="true">Ir por el título <span>↗</span></span>
        </button>

        <button type="button" className="tarjeta-menu" onClick={alVerInstrucciones}>
          <IconoDeModo tipo="cancha" />
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

function IconoDeModo({ tipo }: { tipo: "copa" | "reloj" | "tabla" | "cancha" }) {
  return (
    <svg className="tarjeta-menu__icono" viewBox="0 0 48 48" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {tipo === "copa" && <><path d="M15 9h18v12a9 9 0 0 1-18 0ZM24 30v9M16 39h16M15 13H9v6a8 8 0 0 0 7 8M33 13h6v6a8 8 0 0 1-7 8" /><path d="m24 14 1.5 3 3.5.5-2.5 2.5.5 3.5-3-1.5-3 1.5.5-3.5-2.5-2.5 3.5-.5Z" /></>}
      {tipo === "reloj" && <><circle cx="24" cy="26" r="15" /><path d="M24 18v9l7 4M19 6h10M24 6v5M36 13l3-3" /></>}
      {tipo === "tabla" && <><rect x="9" y="8" width="30" height="32" rx="4" /><path d="M9 18h30M19 18v22M13 24h2M24 24h10M13 33h2M24 33h10" /></>}
      {tipo === "cancha" && <><rect x="6" y="10" width="36" height="28" rx="3" /><path d="M24 10v28M6 18h6v12H6M42 18h-6v12h6" /><circle cx="24" cy="24" r="6" /></>}
    </svg>
  );
}
