import { MotorAudio } from "./MotorAudio";
import { SONIDOS } from "./catalogo";

// Crear el controlador no crea AudioContext ni inicia solicitudes de audio.
export const audio = new MotorAudio(SONIDOS);
