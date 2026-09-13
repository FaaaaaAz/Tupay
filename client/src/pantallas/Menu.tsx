import type { Modo } from "../../../compartido/partida.js";
import { IMAGENES } from "../recursos/indice";

interface Props {
  alElegirModo: (modo: Modo) => void;
  alVerInstrucciones: () => void;
  alVolver: () => void;
}

export function Menu({ alElegirModo, alVerInstrucciones, alVolver }: Props) {
  return (
    <main className="menu" style={{ backgroundImage: `url(${IMAGENES.menu})` }}>
      <h1 className="menu__titulo">Tupay</h1>

      <div className="menu__tarjetas">
        <button type="button" className="tarjeta-menu" onClick={() => alElegirModo("eliminatoria")}>
          <span className="tarjeta-menu__nombre">Eliminatoria</span>
          <span className="tarjeta-menu__detalle">
            Un partido a una meta de 1 a 5 goles. No hay empate: gana el primero en llegar.
          </span>
        </button>

        <button type="button" className="tarjeta-menu" onClick={() => alElegirModo("liga")}>
          <span className="tarjeta-menu__nombre">Liga</span>
          <span className="tarjeta-menu__detalle">
            90 minutos a reloj acelerado. Gana quien tenga más goles, y puede terminar empatado.
          </span>
        </button>

        <button type="button" className="tarjeta-menu" onClick={alVerInstrucciones}>
          <span className="tarjeta-menu__nombre">Cómo se juega</span>
          <span className="tarjeta-menu__detalle">Cómo tirar, los turnos, los modos y el perro.</span>
        </button>
      </div>

      <button type="button" className="boton boton--enlace" onClick={alVolver}>
        ← Volver a la portada
      </button>
    </main>
  );
}
