import recursos from "../../../assets/audio/catalogo.json";
import type { RecursoAudio } from "./MotorAudio";

// Vite resuelve las URLs con hash; importar una URL no descarga ni decodifica el audio.
const archivos = import.meta.glob<string>("../recursos/audio/**/*.ogg", {
  eager: true, query: "?url", import: "default",
});

export const SONIDOS: Record<string, RecursoAudio> = Object.fromEntries(recursos.map((recurso) => {
  const url = archivos[`../recursos/audio/${recurso.archivo}`];
  if (!url) throw new Error(`Falta el recurso de audio: ${recurso.archivo}`);
  return [recurso.id, { ...recurso, url, canal: recurso.canal as RecursoAudio["canal"] }];
}));
