import type { PeticionTiro } from "../../../../compartido/partida.js";
import { zonasDeCharco } from "../estadios/charcos.js";
import { simularTiro, type ResultadoSimulacion } from "../fisica/simulacion.js";
import { REGLAS } from "./configuracionReglas.js";
import type { RegistroPartida } from "./partida.js";

/**
 * Simula un tiro sobre el estado actual de la partida, con sus charcos, sin cambiar nada.
 * La usan el tiro de verdad y el rival, que prueba varios tiros antes de elegir uno.
 */
export function simularEnLaPartida(
  registro: RegistroPartida,
  indiceTapita: number,
  { direccion, fuerza, tiroDePoder }: Pick<PeticionTiro, "direccion" | "fuerza" | "tiroDePoder">,
): ResultadoSimulacion {
  return simularTiro({
    tapitas: registro.tapitas.map((tapita) => tapita.posicion),
    pelota: registro.pelota,
    tiro: {
      tapita: indiceTapita,
      direccion,
      fuerza: tiroDePoder ? fuerza * REGLAS.multiplicadorTiroDePoder : fuerza,
      // El tiro de poder saca la pelota de cualquier charco de un solo golpe.
      liberaDeUnGolpe: tiroDePoder === true,
    },
    charcos: zonasDeCharco(registro.charcos),
    pelotaAtrapada: registro.pelotaAtrapada,
  });
}
