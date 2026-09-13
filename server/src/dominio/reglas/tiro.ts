import type { Cuadro, Evento, PeticionTiro } from "../../../../compartido/partida.js";
import { longitud, redondear } from "../../utilidades/vector.js";
import { ErrorDeJuego } from "../errores.js";
import { intentarAparicion } from "../eventos/perro.js";
import { CUADROS_POR_SEGUNDO } from "../fisica/configuracionFisica.js";
import { simularTiro } from "../fisica/simulacion.js";
import { MENSAJES } from "../mensajes.js";
import { REGLAS } from "./configuracionReglas.js";
import { CENTRO_DE_LA_CANCHA, formacionInicial } from "./formacion.js";
import { ladoDelArcoMasCercano, ladoQueAnota, rival } from "./lados.js";
import { finalizar, type RegistroPartida } from "./partida.js";
import { actualizarTiempo } from "./tiempo.js";

export interface ResultadoDelTiro {
  recorrido: Cuadro[];
  eventos: Evento[];
}

/** Valida el tiro, lo simula y aplica sus consecuencias: gol, perro, turno y final. */
export function ejecutarTiro(
  registro: RegistroPartida,
  peticion: PeticionTiro,
  ahora: number,
): ResultadoDelTiro {
  const indice = validarTiro(registro, peticion, ahora);

  let fuerza = peticion.fuerza;
  if (peticion.tiroDePoder) {
    registro.jugadores[peticion.lado].tirosDePoder -= 1;
    fuerza *= REGLAS.multiplicadorTiroDePoder;
  }

  const simulacion = simularTiro({
    tapitas: registro.tapitas.map((tapita) => tapita.posicion),
    pelota: registro.pelota,
    tiro: { tapita: indice, direccion: peticion.direccion, fuerza },
  });

  let recorrido = simulacion.cuadros;
  const eventos: Evento[] = [];
  registro.tapitas = registro.tapitas.map((tapita, i) => ({
    ...tapita,
    posicion: simulacion.tapitas[i],
  }));
  registro.pelota = simulacion.pelota;
  registro.turnoVencido = null;
  registro.turno = rival(peticion.lado);

  if (simulacion.arcoConGol) {
    const anota = ladoQueAnota(simulacion.arcoConGol);
    registro.marcador[anota] += 1;
    eventos.push({ tipo: "gol", lado: anota });

    registro.tapitas = formacionInicial();
    registro.pelota = CENTRO_DE_LA_CANCHA;
    registro.turno = rival(anota);

    const alcanzoLaMeta =
      registro.golesParaGanar !== null && registro.marcador[anota] >= registro.golesParaGanar;
    if (alcanzoLaMeta) {
      eventos.push({ tipo: "finDelPartido", resultado: finalizar(registro) });
    }
  } else if (
    registro.perro.activo &&
    registro.perro.apariciones < REGLAS.aparicionesMaximasDelPerro
  ) {
    const aparicion = intentarAparicion(
      simulacion.tapitas,
      simulacion.pelota,
      registro.perro.probabilidad,
      registro.azar,
    );
    if (aparicion) {
      recorrido = [...recorrido, ...aparicion.cuadros];
      registro.pelota = aparicion.pelota;
      registro.perro.apariciones += 1;
      registro.turno = ladoDelArcoMasCercano(aparicion.pelota) ?? registro.turno;
      eventos.push({
        tipo: "perro",
        posicionPelota: redondear(aparicion.pelota),
        turnoPara: registro.turno,
      });
    }
  }

  // El reloj del turno siguiente arranca cuando termina la animación, no cuando responde el servidor.
  registro.inicioTurno = ahora + (recorrido.length / CUADROS_POR_SEGUNDO) * 1000;
  return { recorrido, eventos };
}

/** Aplica en orden las acciones inválidas de `docs/reglas.md`. Devuelve el índice de la tapita. */
function validarTiro(registro: RegistroPartida, peticion: PeticionTiro, ahora: number): number {
  actualizarTiempo(registro, ahora);
  if (registro.estado === "finalizada") {
    throw new ErrorDeJuego(MENSAJES.partidaTerminada, 409);
  }

  if (peticion.lado !== registro.turno) {
    const perdioSuTurno = registro.turnoVencido === peticion.lado;
    throw new ErrorDeJuego(perdioSuTurno ? MENSAJES.tiempoAgotado : MENSAJES.noEsTuTurno);
  }

  const indice = registro.tapitas.findIndex((tapita) => tapita.id === peticion.tapita);
  if (indice === -1) throw new ErrorDeJuego(MENSAJES.tiroInvalido);
  if (registro.tapitas[indice].lado !== peticion.lado) {
    throw new ErrorDeJuego(MENSAJES.tapitaRival);
  }

  const fuerzaEnRango = peticion.fuerza > 0 && peticion.fuerza <= 1;
  if (!fuerzaEnRango || longitud(peticion.direccion) === 0) {
    throw new ErrorDeJuego(MENSAJES.tiroInvalido);
  }

  if (peticion.tiroDePoder && registro.jugadores[peticion.lado].tirosDePoder === 0) {
    throw new ErrorDeJuego(MENSAJES.sinTirosDePoder);
  }

  return indice;
}
