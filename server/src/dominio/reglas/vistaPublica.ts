import type { Jugador, Lado, Partida } from "../../../../compartido/partida.js";
import { redondear } from "../../utilidades/vector.js";
import { CANCHA } from "../fisica/configuracionFisica.js";
import { emoteActivo, segundosDeEsperaDelEmote } from "./emotes.js";
import type { RegistroPartida } from "./partida.js";
import { relojPublico, segundosRestantesDelTurno } from "./tiempo.js";

/** Convierte lo que guarda el servidor en el JSON del contrato `Partida`. */
export function aPartidaPublica(registro: RegistroPartida, ahora: number): Partida {
  ahora = registro.pausadaDesde ?? ahora;
  const enJuego = registro.estado === "enJuego";

  return {
    id: registro.id,
    pausada: registro.pausadaDesde !== null,
    modo: registro.modo,
    estado: registro.estado,
    estadio: registro.estadio,
    cancha: CANCHA,
    local: jugadorPublico(registro, "local", ahora),
    visitante: jugadorPublico(registro, "visitante", ahora),
    tapitas: registro.tapitas.map((tapita) => ({ ...tapita, posicion: redondear(tapita.posicion) })),
    pelota: {
      posicion: redondear(registro.pelota),
      atrapadaEn: registro.pelotaAtrapada?.charco ?? null,
      golpesParaLiberar: registro.pelotaAtrapada?.golpesParaLiberar ?? 0,
    },
    charcos: registro.charcos.map((charco) => ({ ...charco, posicion: redondear(charco.posicion) })),
    turno: {
      lado: registro.turno,
      segundosRestantes: enJuego ? segundosRestantesDelTurno(registro, ahora) : 0,
    },
    marcador: { ...registro.marcador },
    perro: { activo: registro.perro.activo, apariciones: registro.perro.apariciones },
    golesParaGanar: registro.golesParaGanar,
    reloj: registro.reloj && relojPublico(registro.reloj, ahora),
    resultado: registro.resultado,
  };
}

function jugadorPublico(registro: RegistroPartida, lado: Lado, ahora: number): Jugador {
  const { equipo, tipo, dificultad, tirosDePoder } = registro.jugadores[lado];
  return {
    lado,
    equipo,
    tipo,
    dificultad,
    tirosDePoder,
    emote: emoteActivo(registro, lado, ahora),
    esperaEmote: segundosDeEsperaDelEmote(registro, lado, ahora),
  };
}
