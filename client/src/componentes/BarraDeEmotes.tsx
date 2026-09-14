import type { IdEmote } from "../../../compartido/catalogo.js";
import { IMAGEN_DE_EMOTE } from "../recursos/indice";
import { EMOTES } from "./opcionesDeJuego";

interface Props {
  nombreDelEquipo: string;
  /** Segundos que faltan para poder lanzar otro. `0` si ya se puede. */
  espera: number;
  deshabilitada: boolean;
  alElegir: (emote: IdEmote) => void;
}

/** Las siete caritas de un jugador. Mientras dura la espera, se deshabilitan y muestran cuánto falta. */
export function BarraDeEmotes({ nombreDelEquipo, espera, deshabilitada, alElegir }: Props) {
  const esperando = espera > 0;

  return (
    <div className="emotes" role="group" aria-label={`Emotes de ${nombreDelEquipo}`}>
      {EMOTES.map(({ valor, texto }) => (
        <button
          key={valor}
          type="button"
          className="emotes__boton"
          title={texto}
          aria-label={texto}
          disabled={deshabilitada || esperando}
          onClick={() => alElegir(valor)}
        >
          <img src={IMAGEN_DE_EMOTE[valor]} alt="" />
        </button>
      ))}
      {esperando && (
        <span className="emotes__espera" data-testid="espera-emote">
          {espera} s
        </span>
      )}
    </div>
  );
}
