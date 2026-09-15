import { MotorAudio } from "./MotorAudio";
import { SONIDOS } from "./catalogo";

// Crear el controlador no crea AudioContext ni inicia solicitudes de audio.
export const audio = new MotorAudio(SONIDOS);

/** Para elegir una opción: el mismo gesto desbloquea el audio si hacía falta y después suena el efecto. */
export function sonarAlElegir(id: string) {
  void audio.desbloquear().then((listo) => {
    if (listo) void audio.efecto(id);
  });
}
