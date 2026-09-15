import { sonarAlElegir } from "../audio/audio";
import { IMAGENES } from "../recursos/indice";

interface Props {
  activo: boolean;
  alCambiar: (activo: boolean) => void;
}

/** Activar al perro suena a ladrido; desactivarlo, a la transición de volver. */
export function CasillaDelPerro({ activo, alCambiar }: Props) {
  return (
    <label className="opcion opcion--perro">
      <input
        type="checkbox"
        checked={activo}
        onChange={(evento) => {
          alCambiar(evento.target.checked);
          sonarAlElegir(evento.target.checked ? "perro" : "transicion");
        }}
      />
      <img src={IMAGENES.perro} alt="" />
      El perro puede meterse a la cancha
    </label>
  );
}
