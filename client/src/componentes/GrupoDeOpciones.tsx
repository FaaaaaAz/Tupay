import { sonarAlElegir } from "../audio/audio";

export interface Opcion<T extends string | number> {
  valor: T;
  texto: string;
}

interface Props<T extends string | number> {
  titulo: string;
  nombre: string;
  opciones: readonly Opcion<T>[];
  valor: T;
  alCambiar: (valor: T) => void;
}

/** Radios centrados bajo su título. Elegir suena con el mismo clic que las flechas de los carruseles. */
export function GrupoDeOpciones<T extends string | number>({ titulo, nombre, opciones, valor, alCambiar }: Props<T>) {
  return (
    <fieldset className="grupo">
      <legend>{titulo}</legend>
      {opciones.map((opcion) => (
        <label key={opcion.valor} className="opcion">
          <input
            type="radio"
            name={nombre}
            checked={valor === opcion.valor}
            onChange={() => {
              alCambiar(opcion.valor);
              sonarAlElegir("clic");
            }}
          />
          {opcion.texto}
        </label>
      ))}
    </fieldset>
  );
}
