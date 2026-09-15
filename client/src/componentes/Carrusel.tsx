import { useState, type KeyboardEvent } from "react";
import { sonarAlElegir } from "../audio/audio";

export interface OpcionDeCarrusel<T extends string> {
  id: T;
  nombre: string;
  imagen: string;
  detalle?: string;
}

interface Props<T extends string> {
  etiqueta: string;
  opciones: readonly OpcionDeCarrusel<T>[];
  valor: T;
  alCambiar: (id: T) => void;
  /** Escudos chicos con sus vecinos a los costados, o un estadio grande con su descripción. */
  variante: "escudo" | "estadio";
  /** Marca corta sobre la opción actual, por ejemplo «Estadio del local». */
  distintivo?: string | null;
  clase?: string;
}

/**
 * Elige una opción recorriendo la lista con dos flechas, en círculo: después de la última vuelve
 * a la primera. También responde a las flechas del teclado cuando tiene el foco.
 */
export function Carrusel<T extends string>({ etiqueta, opciones, valor, alCambiar, variante, distintivo, clase }: Props<T>) {
  const [direccion, setDireccion] = useState<"anterior" | "siguiente" | null>(null);
  const indice = Math.max(0, opciones.findIndex((opcion) => opcion.id === valor));
  const vecina = (paso: number) => opciones[(indice + paso + opciones.length) % opciones.length];
  const actual = opciones[indice];
  const anterior = vecina(-1);
  const siguiente = vecina(1);

  function mover(paso: -1 | 1) {
    setDireccion(paso < 0 ? "anterior" : "siguiente");
    alCambiar(vecina(paso).id);
    sonarAlElegir("clic");
  }

  function tecla(evento: KeyboardEvent<HTMLDivElement>) {
    if (evento.key !== "ArrowLeft" && evento.key !== "ArrowRight") return;
    evento.preventDefault();
    mover(evento.key === "ArrowLeft" ? -1 : 1);
  }

  const clases = ["carrusel", `carrusel--${variante}`, clase].filter(Boolean).join(" ");
  const claseImagen = direccion ? `carrusel__imagen carrusel__imagen--desde-${direccion}` : "carrusel__imagen";

  return (
    <div className={clases} role="group" aria-label={etiqueta} data-valor={actual.id} onKeyDown={tecla}>
      <span className="campo__etiqueta" aria-hidden="true">
        {etiqueta}
      </span>

      <div className="carrusel__escenario">
        <button
          type="button"
          className="carrusel__flecha carrusel__flecha--anterior"
          aria-label="Anterior"
          title={anterior.nombre}
          onClick={() => mover(-1)}
        >
          <Chevron />
        </button>

        <div className="carrusel__vista">
          {variante === "escudo" && (
            <img className="carrusel__vecino carrusel__vecino--anterior" src={anterior.imagen} alt="" />
          )}
          {/* La key reinicia la animación de entrada en cada cambio. */}
          <img key={actual.id} className={claseImagen} src={actual.imagen} alt="" />
          {variante === "escudo" && (
            <img className="carrusel__vecino carrusel__vecino--siguiente" src={siguiente.imagen} alt="" />
          )}
          {distintivo && <span className="carrusel__distintivo">{distintivo}</span>}
        </div>

        <button
          type="button"
          className="carrusel__flecha carrusel__flecha--siguiente"
          aria-label="Siguiente"
          title={siguiente.nombre}
          onClick={() => mover(1)}
        >
          <Chevron />
        </button>
      </div>

      <p className="carrusel__nombre" aria-live="polite" data-testid="carrusel-valor">
        {actual.nombre}
      </p>
      {actual.detalle && <p className="carrusel__detalle">{actual.detalle}</p>}
      <p className="carrusel__puntos" aria-hidden="true">
        {opciones.map((opcion) => (
          <span
            key={opcion.id}
            className={opcion.id === actual.id ? "carrusel__punto carrusel__punto--actual" : "carrusel__punto"}
          />
        ))}
      </p>
    </div>
  );
}

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}
