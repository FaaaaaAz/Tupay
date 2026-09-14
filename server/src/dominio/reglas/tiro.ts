import type { Cuadro, Evento, PeticionTiro } from "../../../../compartido/partida.js";
import { longitud, redondear } from "../../utilidades/vector.js";
import { avanzarCharcos, eventosDeCharco } from "../estadios/charcos.js";
import { ErrorDeJuego } from "../errores.js";
import { intentarAparicion } from "../eventos/perro.js";
import { CUADROS_POR_SEGUNDO } from "../fisica/configuracionFisica.js";
import { MENSAJES } from "../mensajes.js";
import { decidirTiroDelRival } from "../rival/rivalPorMuestreo.js";
import { REGLAS } from "./configuracionReglas.js";
import { CENTRO_DE_LA_CANCHA, formacionInicial } from "./formacion.js";
import { ladoDelArcoMasCercano, ladoQueAnota, rival } from "./lados.js";
import { finalizar, type RegistroPartida } from "./partida.js";
import { simularEnLaPartida } from "./simulacionEnLaPartida.js";
import { actualizarTiempo } from "./tiempo.js";
import { exigirSinPausa } from "./pausa.js";

export interface ResultadoDelTiro {
  recorrido: Cuadro[];
  eventos: Evento[];
}

/** Valida el tiro, lo simula y aplica sus consecuencias: charcos, gol, perro, turno y final. */
export function ejecutarTiro(
  registro: RegistroPartida,
  peticion: PeticionTiro,
  ahora: number,
): ResultadoDelTiro {
  const indice = validarTiro(registro, peticion, ahora);
  if (peticion.tiroDePoder) registro.jugadores[peticion.lado].tirosDePoder -= 1;

  const simulacion = simularEnLaPartida(registro, indice, peticion);

  let recorrido = simulacion.cuadros;
  const eventos = eventosDeCharco(registro.charcos, simulacion.eventosDeCharco);
  registro.tapitas = registro.tapitas.map((tapita, i) => ({
    ...tapita,
    posicion: simulacion.tapitas[i],
  }));
  registro.pelota = simulacion.pelota;
  registro.pelotaAtrapada = simulacion.pelotaAtrapada;
  registro.turnoVencido = null;
  registro.turno = rival(peticion.lado);

  if (simulacion.arcoConGol) {
    const anota = ladoQueAnota(simulacion.arcoConGol);
    registro.marcador[anota] += 1;
    eventos.push({ tipo: "gol", lado: anota });

    registro.tapitas = formacionInicial();
    registro.pelota = CENTRO_DE_LA_CANCHA;
    registro.pelotaAtrapada = null;
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
      // Si la pelota estaba en un charco, el perro también la saca de ahí.
      registro.pelotaAtrapada = null;
      registro.perro.apariciones += 1;
      registro.turno = ladoDelArcoMasCercano(aparicion.pelota) ?? registro.turno;
      eventos.push({
        tipo: "perro",
        posicionPelota: redondear(aparicion.pelota),
        turnoPara: registro.turno,
      });
    }
  }

  if (registro.estado === "enJuego") eventos.push(...avanzarCharcos(registro));

  // El reloj del turno siguiente arranca cuando termina la animación, no cuando responde el servidor.
  registro.inicioTurno = ahora + (recorrido.length / CUADROS_POR_SEGUNDO) * 1000;
  return { recorrido, eventos };
}

/** Aplica en orden las acciones inválidas de `docs/reglas.md`. Devuelve el índice de la tapita. */
function validarTiro(registro: RegistroPartida, peticion: PeticionTiro, ahora: number): number {
  exigirSinPausa(registro);
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

/** Un tiro que llega desde el navegador: nunca puede mover al equipo que controla el servidor. */
export function tirarComoHumano(
  registro: RegistroPartida,
  peticion: PeticionTiro,
  ahora: number,
): ResultadoDelTiro {
  if (registro.jugadores[peticion.lado].tipo === "servidor") {
    throw new ErrorDeJuego(MENSAJES.noEsTuTurno);
  }
  return ejecutarTiro(registro, peticion, ahora);
}

/** El servidor decide el tiro del equipo que controla y lo ejecuta con las mismas reglas que una persona. */
export function jugarTurnoDelRival(registro: RegistroPartida, ahora: number): ResultadoDelTiro {
  exigirSinPausa(registro);
  actualizarTiempo(registro, ahora);
  if (registro.estado === "finalizada") {
    throw new ErrorDeJuego(MENSAJES.partidaTerminada, 409);
  }
  if (registro.jugadores[registro.turno].tipo !== "servidor") {
    throw new ErrorDeJuego(MENSAJES.noEsTurnoDelRival);
  }
  return ejecutarTiro(registro, decidirTiroDelRival(registro), ahora);
}
