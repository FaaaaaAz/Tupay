import { useMemo } from "react";
import type { Equipo, IdEquipo } from "../../../compartido/catalogo.js";
import { IMAGEN_DE_ESCUDO } from "../recursos/indice";
import { Carrusel } from "./Carrusel";

interface Props {
  etiqueta: string;
  valor: IdEquipo;
  equipos: Equipo[];
  alCambiar: (equipo: IdEquipo) => void;
}

/** Carrusel de escudos en orden alfabético. Los equipos siguen llegando del servidor. */
export function SelectorDeEquipo({ etiqueta, valor, equipos, alCambiar }: Props) {
  const opciones = useMemo(
    () =>
      [...equipos]
        .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
        .map((equipo) => ({ id: equipo.id, nombre: equipo.nombre, imagen: IMAGEN_DE_ESCUDO[equipo.id] })),
    [equipos],
  );

  return (
    <Carrusel
      etiqueta={etiqueta}
      opciones={opciones}
      valor={valor}
      alCambiar={alCambiar}
      variante="escudo"
      clase="selector-equipo"
    />
  );
}
