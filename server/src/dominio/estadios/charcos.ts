import type { IdEstadio } from "../../../../compartido/catalogo.js";
import type { Charco, Evento, TipoCharco } from "../../../../compartido/partida.js";
import { ESTADIOS } from "../catalogo.js";
import { contiene, type EventoDeCharco, type ZonaDeCharco } from "../fisica/charcos.js";
import { CANCHA } from "../fisica/configuracionFisica.js";
import type { RegistroPartida } from "../reglas/partida.js";
import { APARICION_DE_CHARCOS, CHARCO_DE_CADA_EFECTO, CHARCOS } from "./configuracionEstadios.js";

export function tipoDeCharco(estadio: IdEstadio): TipoCharco | null {
  return CHARCO_DE_CADA_EFECTO[ESTADIOS[estadio].efecto];
}

/** Los charcos con los que arranca el partido. En un estadio sin efecto no hay ninguno. */
export function crearCharcosIniciales(registro: RegistroPartida): void {
  for (let i = 0; i < APARICION_DE_CHARCOS.alEmpezar; i++) intentarCrearCharco(registro);
}

/**
 * Después de cada tiro: los charcos gastan un turno, los que se secan sueltan la pelota
 * y, con algo de suerte, aparece uno nuevo en otro sector de la cancha.
 */
export function avanzarCharcos(registro: RegistroPartida): Evento[] {
  const eventos: Evento[] = [];
  for (const charco of registro.charcos) charco.turnosRestantes -= 1;

  const atrapada = registro.pelotaAtrapada;
  const seSecoConLaPelota = registro.charcos.some(
    (charco) => charco.turnosRestantes <= 0 && charco.id === atrapada?.charco,
  );
  registro.charcos = registro.charcos.filter((charco) => charco.turnosRestantes > 0);
  if (seSecoConLaPelota) {
    registro.pelotaAtrapada = null;
    eventos.push({ tipo: "pelotaLiberada" });
  }

  // Solo se sortea en estadios con charcos: así los demás partidos gastan el azar igual que antes.
  if (tipoDeCharco(registro.estadio) && registro.azar() < APARICION_DE_CHARCOS.probabilidadPorTiro) {
    intentarCrearCharco(registro);
  }
  return eventos;
}

/** Lo que la física necesita saber de cada charco de la partida. */
export function zonasDeCharco(charcos: Charco[]): ZonaDeCharco[] {
  return charcos.map(({ id, posicion, ancho, alto, tipo }) => ({
    id,
    posicion,
    ancho,
    alto,
    golpesParaLiberar: CHARCOS[tipo].golpesParaLiberar,
    impulsoAlLiberar: CHARCOS[tipo].impulsoAlLiberar,
  }));
}

/** Traduce lo que informó la física a los eventos del contrato, que dicen de qué tipo era el charco. */
export function eventosDeCharco(charcos: Charco[], eventos: EventoDeCharco[]): Evento[] {
  return eventos.map((evento): Evento => {
    if (evento.tipo === "pelotaLiberada") return { tipo: "pelotaLiberada" };
    const tipoCharco = charcos.find((charco) => charco.id === evento.charco)?.tipo ?? "agua";
    return { tipo: "pelotaAtrapada", charco: evento.charco, tipoCharco };
  });
}

/**
 * Busca un lugar al azar que no esté debajo de la pelota ni encima de otro charco. El centro
 * puede quedar cerca de la línea de gol, así que un charco también puede tapar la boca del arco.
 */
function intentarCrearCharco(registro: RegistroPartida): void {
  const tipo = tipoDeCharco(registro.estadio);
  if (!tipo || registro.charcos.length >= APARICION_DE_CHARCOS.maximoEnCancha) return;

  const { ancho, alto, duracionTurnos } = CHARCOS[tipo];
  const separacion = APARICION_DE_CHARCOS.separacionDeLaPelota;
  const alrededorDeLaPelota = { ancho: ancho + 2 * separacion, alto: alto + 2 * separacion };

  for (let intento = 0; intento < APARICION_DE_CHARCOS.intentosParaUbicarlo; intento++) {
    const posicion = {
      x: ancho / 4 + registro.azar() * (CANCHA.ancho - ancho / 2),
      y: alto / 2 + registro.azar() * (CANCHA.alto - alto),
    };
    const tapaLaPelota = contiene({ posicion, ...alrededorDeLaPelota }, registro.pelota);
    const pisaOtroCharco = registro.charcos.some(
      (otro) => Math.abs(otro.posicion.x - posicion.x) < ancho && Math.abs(otro.posicion.y - posicion.y) < alto,
    );
    if (tapaLaPelota || pisaOtroCharco) continue;

    registro.charcosCreados += 1;
    registro.charcos.push({
      id: `${tipo}-${registro.charcosCreados}`,
      tipo,
      posicion,
      ancho,
      alto,
      turnosRestantes: duracionTurnos,
    });
    return;
  }
}
