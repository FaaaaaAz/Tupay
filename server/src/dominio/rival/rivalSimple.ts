import type { Vector } from "../../../../compartido/geometria.js";
import type { PeticionTiro, Tapita } from "../../../../compartido/partida.js";
import { escalar, longitud, normalizar, productoPunto, restar } from "../../utilidades/vector.js";
import { CANCHA, FISICA } from "../fisica/configuracionFisica.js";
import { REGLAS, RIVAL } from "../reglas/configuracionReglas.js";
import type { RegistroPartida } from "../reglas/partida.js";

interface Candidata {
  tapita: Tapita;
  tiro: Vector;
  distancia: number;
  empujaHaciaElArco: boolean;
}

/**
 * Rival sencillo, pensado como en el billar: golpear la pelota en el punto opuesto al arco
 * que ataca, para mandarla hacia allá. Elige la tapita propia más cercana que esté detrás
 * de la pelota, calcula la fuerza para llegar con impulso y agrega un error de puntería.
 */
export function decidirTiroDelRival(registro: RegistroPartida): PeticionTiro {
  const lado = registro.turno;
  const arcoQueAtaca: Vector = { x: lado === "local" ? CANCHA.ancho : 0, y: CANCHA.alto / 2 };
  const haciaElArco = normalizar(restar(arcoQueAtaca, registro.pelota));
  const puntoDeGolpe = restar(
    registro.pelota,
    escalar(haciaElArco, CANCHA.radioTapita + CANCHA.radioPelota),
  );

  const candidatas: Candidata[] = registro.tapitas
    .filter((tapita) => tapita.lado === lado)
    .map((tapita) => {
      const tiro = restar(puntoDeGolpe, tapita.posicion);
      return {
        tapita,
        tiro,
        distancia: longitud(tiro),
        empujaHaciaElArco: productoPunto(normalizar(tiro), haciaElArco) > 0,
      };
    });
  const bienUbicadas = candidatas.filter((candidata) => candidata.empujaHaciaElArco);
  const elegida = masCercana(bienUbicadas.length > 0 ? bienUbicadas : candidatas);

  const dificultad = registro.jugadores[lado].dificultad ?? REGLAS.dificultadPorDefecto;
  const error = (registro.azar() * 2 - 1) * RIVAL.errorDePunteria[dificultad];
  const angulo = Math.atan2(elegida.tiro.y, elegida.tiro.x) + error;

  // Con fricción exponencial, la velocidad cae en proporción a la distancia recorrida.
  const frenadoPorUnidad = -Math.log(FISICA.retencionTapita);
  const velocidadNecesaria = RIVAL.velocidadAlLlegar + frenadoPorUnidad * elegida.distancia;
  const variacion = (registro.azar() * 2 - 1) * RIVAL.variacionDeFuerza;
  const fuerza = Math.min(
    1,
    Math.max(0.2, velocidadNecesaria / FISICA.velocidadMaximaTiro + variacion),
  );

  return {
    lado,
    tapita: elegida.tapita.id,
    direccion: { x: Math.cos(angulo), y: Math.sin(angulo) },
    fuerza,
  };
}

function masCercana(opciones: Candidata[]): Candidata {
  return opciones.reduce((mejor, opcion) => (opcion.distancia < mejor.distancia ? opcion : mejor));
}
