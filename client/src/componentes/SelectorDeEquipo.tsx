import type { Equipo, IdEquipo } from "../../../compartido/catalogo.js";
import { IMAGEN_DE_ESCUDO } from "../recursos/indice";

interface Props {
  etiqueta: string;
  valor: IdEquipo;
  equipos: Equipo[];
  alCambiar: (equipo: IdEquipo) => void;
}

export function SelectorDeEquipo({ etiqueta, valor, equipos, alCambiar }: Props) {
  return (
    <label className="selector-equipo">
      <span className="campo__etiqueta">{etiqueta}</span>
      <img className="selector-equipo__escudo" src={IMAGEN_DE_ESCUDO[valor]} alt="" />
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
