import type { Page } from "@playwright/test";

declare global {
  interface Window {
    audioPrueba: { iniciados: number; bucles: number; activos: number; contextos: number; decodificados: number; bytesPcm: number;
      eventos: { url: string; bucle: boolean; offset: number; instante: number }[] };
  }
}

/** Observa fuentes reales de Web Audio, sin cambiar ni simular su reproducción. */
export async function observarAudio(page: Page) {
  await page.addInitScript(() => {
    window.audioPrueba = { iniciados: 0, bucles: 0, activos: 0, contextos: 0, eventos: [], decodificados: 0, bytesPcm: 0 };
    const urls = new WeakMap<ArrayBuffer, string>();
    const buffers = new WeakMap<AudioBuffer, string>();
    const leer = Response.prototype.arrayBuffer;
    Response.prototype.arrayBuffer = async function () {
      const datos = await leer.call(this); urls.set(datos, this.url); return datos;
    };
    const Original = window.AudioContext;
    window.AudioContext = class extends Original {
      constructor() { super(); window.audioPrueba.contextos++; }
      override async decodeAudioData(datos: ArrayBuffer) {
        const url = urls.get(datos) ?? "";
        const buffer = await super.decodeAudioData(datos);
        window.audioPrueba.decodificados++;
        window.audioPrueba.bytesPcm += buffer.length * buffer.numberOfChannels * 4;
        buffers.set(buffer, url); return buffer;
      }
      override createBufferSource() {
        const fuente = super.createBufferSource();
        const iniciar = fuente.start.bind(fuente);
        fuente.start = (cuando = 0, offset = 0) => {
          window.audioPrueba.iniciados++;
          window.audioPrueba.activos++;
          if (fuente.loop) window.audioPrueba.bucles++;
          window.audioPrueba.eventos.push({ url: fuente.buffer ? buffers.get(fuente.buffer) ?? "" : "",
            bucle: fuente.loop, offset, instante: performance.now() });
          fuente.addEventListener("ended", () => window.audioPrueba.activos--, { once: true });
          iniciar(cuando, offset);
        };
        return fuente;
      }
    };
  });
}

export async function vecesSonido(page: Page, nombre: string) {
  return page.evaluate((nombre) => window.audioPrueba.eventos.filter((evento) => evento.url.includes(`/${nombre}-`)).length, nombre);
}
