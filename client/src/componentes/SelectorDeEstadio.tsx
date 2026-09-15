import { useMemo } from "react";
import type { Estadio, IdEstadio } from "../../../compartido/catalogo.js";
import { IMAGEN_DE_ESTADIO } from "../recursos/indice";
import { Carrusel } from "./Carrusel";
import { DESCRIPCION_DE_EFECTO } from "./opcionesDeJuego";

interface Props {
  valor: IdEstadio;
  estadios: Estadio[];
  /** Se marca cuando el estadio elegido es el del equipo local. */
  estadioDelLocal: IdEstadio;
  alCambiar: (estadio: IdEstadio) => void;
}

/** Carrusel de estadios en orden alfabético, con la imagen grande y el efecto de cada cancha. */
export function SelectorDeEstadio({ valor, estadios, estadioDelLocal, alCambiar }: Props) {
  const opciones = useMemo(
    () =>
      [...estadios]
        .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
        .map((estadio) => ({
          id: estadio.id,
          nombre: estadio.nombre,
          imagen: IMAGEN_DE_ESTADIO[estadio.id],
          detalle: `${estadio.ciudad} · ${DESCRIPCION_DE_EFECTO[estadio.efecto]}`,
        })),
    [estadios],
  );

  return (
    <Carrusel
      etiqueta="Estadio"
      opciones={opciones}
      valor={valor}
      alCambiar={alCambiar}
      variante="estadio"
      distintivo={valor === estadioDelLocal ? "Estadio del local" : null}
    />
  );
}
