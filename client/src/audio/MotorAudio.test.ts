import { afterEach, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { MotorAudio, type RecursoAudio } from "./MotorAudio";
import { SONIDO_DE_EMOTE, sonidoDelResultado } from "./sonidosDelJuego";
import type { Partida } from "../../../compartido/partida.js";

class FuenteFalsa {
  loop = false;
  buffer = null;
  onended: (() => void) | null = null;
  parada = false;
  offset = 0;
  connect() {}
  disconnect() {}
  addEventListener() {}
  start(_cuando = 0, offset = 0) { this.offset = offset; fuentes.push(this); }
  stop() { this.parada = true; this.onended?.(); }
}
class ContextoFalso {
  state = "running";
  currentTime = 0;
  destination = {};
  constructor() { contextos.push(this); }
  async resume() {}
  createGain() { const nodo = { gain: { value: 1 }, connect() {}, disconnect() {} }; ganancias.push(nodo); return nodo; }
  createBufferSource() { return new FuenteFalsa(); }
  async decodeAudioData() { return { duration: 30 }; }
}
const recursos: Record<string, RecursoAudio> = {
  menu: { url: "/menu.ogg", canal: "musica", ganancia: 0.5, intervaloMs: 0, bucle: true },
  partido: { url: "/partido.ogg", canal: "musica", ganancia: 0.5, intervaloMs: 0 },
  clic: { url: "/clic.ogg", canal: "interfaz", ganancia: 0.4, intervaloMs: 100 },
  tiro: { url: "/tiro.ogg", canal: "efectos", ganancia: 0.6, intervaloMs: 100 },
  feliz: { url: "/feliz.ogg", canal: "reacciones", ganancia: 0.25, intervaloMs: 1000 },
};
let fuentes: FuenteFalsa[];
let contextos: ContextoFalso[];
let ganancias: { gain: { value: number } }[];
let descargas: string[];
let almacen: Map<string, string>;
const originales = Object.getOwnPropertyDescriptors(globalThis);
const esperar = () => new Promise<void>((resolve) => setImmediate(resolve));

beforeEach(() => {
  fuentes = []; contextos = []; ganancias = []; descargas = []; almacen = new Map();
  Object.defineProperty(globalThis, "AudioContext", { configurable: true, value: ContextoFalso });
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
    getItem: (clave: string) => almacen.get(clave) ?? null,
    setItem: (clave: string, valor: string) => almacen.set(clave, valor),
  } });
  globalThis.fetch = async (url) => { descargas.push(String(url)); return new Response(new ArrayBuffer(1)); };
});
afterEach(() => {
  for (const clave of ["AudioContext", "localStorage", "fetch"]) {
    const descriptor = originales[clave];
    if (descriptor) Object.defineProperty(globalThis, clave, descriptor);
    else Reflect.deleteProperty(globalThis, clave);
  }
});

test("no crea contexto ni descarga antes del gesto; cachea y evita música duplicada", async () => {
  const motor = new MotorAudio(recursos);
  motor.reproducirMusica("menu");
  assert.equal(contextos.length, 0);
  assert.equal(descargas.length, 0);
  await motor.desbloquear(); await esperar();
  motor.reproducirMusica("menu"); await motor.desbloquear(); await esperar();
  assert.equal(contextos.length, 1);
  assert.equal(fuentes.length, 1);
  assert.equal(fuentes[0]!.loop, true);
  assert.deepEqual(descargas, ["/menu.ogg"]);
  motor.reproducirMusica("partido"); await esperar();
  assert.equal(fuentes[0]!.parada, true);
  assert.equal(fuentes.filter((fuente) => !fuente.parada).length, 1);
});

test("pausa y silencio conservan la posición y cancelan efectos", async () => {
  const motor = new MotorAudio(recursos);
  await motor.desbloquear(); motor.reproducirMusica("menu"); await esperar();
  contextos[0]!.currentTime = 4;
  motor.pausar(true);
  assert.equal(await motor.efecto("tiro"), false);
  assert.equal(await motor.efecto("clic"), true); // Los ajustes siguen utilizables en pausa.
  motor.pausar(false); await esperar();
  assert.equal(fuentes.at(-1)!.offset, 4);
  motor.configurar({ silenciado: true });
  assert.equal(fuentes.every((fuente) => fuente.parada), true);
  assert.equal(await motor.efecto("feliz"), false);
  motor.configurar({ silenciado: false }); await esperar();
  assert.equal(fuentes.filter((fuente) => !fuente.parada).length, 1);
});

test("limita repeticiones y las reacciones ceden ante tiros", async () => {
  const motor = new MotorAudio(recursos);
  await motor.desbloquear();
  assert.equal(await motor.efecto("feliz"), true);
  assert.equal(await motor.efecto("feliz"), false);
  assert.equal(await motor.efecto("tiro"), true);
  assert.equal(fuentes[0]!.parada, true);
  assert.equal(await motor.efecto("clic"), true);
  assert.equal(await motor.efecto("clic"), false);
});

test("no reproduce descargas que terminan después de salir o silenciar", async () => {
  let liberar!: (respuesta: Response) => void;
  globalThis.fetch = () => new Promise((resolve) => { liberar = resolve; });
  const motor = new MotorAudio(recursos);
  await motor.desbloquear(); motor.reproducirMusica("menu");
  motor.detenerTodo();
  liberar(new Response(new ArrayBuffer(1))); await esperar();
  assert.equal(fuentes.length, 0);
  const efecto = motor.efecto("tiro");
  motor.configurar({ silenciado: true });
  liberar(new Response(new ArrayBuffer(1)));
  assert.equal(await efecto, false);
});

test("persistencia validada y volúmenes independientes", async () => {
  almacen.set("tupay.audio.v1", '{"silenciado":"no","musica":-20,"efectos":99}');
  const motor = new MotorAudio(recursos);
  assert.deepEqual(motor.obtenerEstado().preferencias, { silenciado: false, musica: 0, efectos: 1 });
  await motor.desbloquear(); motor.configurar({ musica: 0.3, efectos: 0.7 });
  assert.equal(ganancias[0]!.gain.value, 0.3);
  assert.equal(ganancias[1]!.gain.value, 0.7);
  assert.deepEqual(new MotorAudio(recursos).obtenerEstado().preferencias, motor.obtenerEstado().preferencias);
});

test("fallos de descarga o almacenamiento no impiden continuar y se puede reintentar", async () => {
  almacen.set("tupay.audio.v1", "invalido");
  const motor = new MotorAudio(recursos);
  await motor.desbloquear();
  globalThis.fetch = async () => { throw new Error("Sin red"); };
  assert.equal(await motor.efecto("tiro"), false);
  assert.ok(motor.obtenerEstado().aviso);
  Object.defineProperty(globalThis, "localStorage", { configurable: true, get() { throw new Error("Bloqueado"); } });
  assert.doesNotThrow(() => motor.configurar({ silenciado: true }));
  assert.doesNotThrow(() => new MotorAudio(recursos));
});

test("cancelar una carga de apuntado no detiene música ni deja sonar el efecto tarde", async () => {
  const motor = new MotorAudio(recursos);
  await motor.desbloquear(); motor.reproducirMusica("menu"); await esperar();
  let liberar!: (respuesta: Response) => void;
  globalThis.fetch = () => new Promise((resolve) => { liberar = resolve; });
  const efecto = motor.efecto("tiro"); motor.detenerEfecto("tiro");
  liberar(new Response(new ArrayBuffer(1)));
  assert.equal(await efecto, false);
  assert.equal(fuentes.length, 1);
  assert.equal(fuentes[0]!.parada, false);
});

test("ocultar la pestaña conserva música pero no una cola de efectos", async () => {
  const motor = new MotorAudio(recursos);
  await motor.desbloquear(); motor.reproducirMusica("menu"); await esperar();
  contextos[0]!.currentTime = 7;
  motor.ocultar(true);
  assert.equal(await motor.efecto("clic"), false);
  motor.ocultar(false); await esperar();
  assert.equal(fuentes.at(-1)!.offset, 7);
  assert.equal(fuentes.filter((fuente) => !fuente.parada).length, 1);
});

test("reutilizar un tono como reacción respeta su canal, prioridad y pausa", async () => {
  const motor = new MotorAudio(recursos);
  await motor.desbloquear();
  motor.pausar(true);
  assert.equal(await motor.efecto("clic", "reacciones"), false);
  motor.pausar(false);
  assert.equal(await motor.efecto("tiro"), true);
  assert.equal(await motor.efecto("clic", "reacciones"), false);
});

test("el resultado distingue derrota contra servidor, victoria compartida y empate", () => {
  const partida = { local: { tipo: "humano" }, visitante: { tipo: "servidor" }, resultado: { ganador: "visitante" } } as Partida;
  assert.equal(sonidoDelResultado(partida), "derrota");
  partida.visitante.tipo = "humano";
  assert.equal(sonidoDelResultado(partida), "victoria");
  partida.resultado!.ganador = null;
  assert.equal(sonidoDelResultado(partida), "empate");
  partida.resultado = null;
  assert.equal(sonidoDelResultado(partida), null);
  assert.equal(SONIDO_DE_EMOTE.dormido, null);
  assert.equal(SONIDO_DE_EMOTE.enojadoSerio, "confirmacion");
});
