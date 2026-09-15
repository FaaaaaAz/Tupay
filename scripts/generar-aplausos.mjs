// Genera por síntesis el aplauso neutro que suena cuando un partido termina empatado.
// No usa grabaciones ni dependencias: cada palmada es ruido filtrado con una envolvente corta,
// y el azar tiene semilla, así que el archivo sale siempre igual. Se ejecuta a mano:
//
//   node scripts/generar-aplausos.mjs

import fs from "node:fs";
import path from "node:path";

const DESTINOS = [
  "assets/audio/music/results/aplausos.wav",
  "client/src/recursos/audio/music/results/aplausos.wav",
];
const FRECUENCIA = 22050;
const DURACION_SEGUNDOS = 3;
const SEMILLA = 2026;
/** Palmadas por segundo cuando el aplauso está en su punto más fuerte. */
const DENSIDAD_MAXIMA = 70;

function crearAzar(semilla) {
  let estado = semilla >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const azar = crearAzar(SEMILLA);
const total = FRECUENCIA * DURACION_SEGUNDOS;
const muestras = new Float32Array(total);

/** El público arranca de golpe, sostiene el aplauso y se va apagando. Nunca empieza en cero. */
function densidad(segundo) {
  if (segundo < 0.25) return DENSIDAD_MAXIMA * Math.max(0.2, segundo / 0.25);
  if (segundo < 1.6) return DENSIDAD_MAXIMA;
  return Math.max(0, DENSIDAD_MAXIMA * (1 - (segundo - 1.6) / 1.3));
}

/** Una palmada: ruido blanco por un filtro pasabanda, con ataque instantáneo y caída rápida. */
function palmada(inicio) {
  const centro = 900 + azar() * 1800;
  const q = 0.9 + azar() * 0.8;
  const w0 = (2 * Math.PI * centro) / FRECUENCIA;
  const alfa = Math.sin(w0) / (2 * q);
  const [b0, b2, a0, a1, a2] = [alfa, -alfa, 1 + alfa, -2 * Math.cos(w0), 1 - alfa];
  const caida = 0.004 + azar() * 0.006;
  const volumen = 0.25 + azar() * 0.75;
  const largo = Math.floor(FRECUENCIA * 0.05);
  let [x1, x2, y1, y2] = [0, 0, 0, 0];

  for (let i = 0; i < largo && inicio + i < total; i++) {
    const segundo = i / FRECUENCIA;
    const envolvente = Math.min(1, segundo / 0.0008) * Math.exp(-segundo / caida);
    const x = (azar() * 2 - 1) * envolvente;
    const y = (b0 * x + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    [x2, x1, y2, y1] = [x1, x, y1, y];
    muestras[inicio + i] += y * volumen;
  }
}

// Las palmadas llegan al azar, como un proceso de Poisson que sigue la densidad de cada momento.
for (let segundo = 0; segundo < DURACION_SEGUNDOS; ) {
  const ahora = densidad(segundo);
  if (ahora <= 0) break;
  segundo += -Math.log(1 - azar()) / ahora;
  if (segundo < DURACION_SEGUNDOS) palmada(Math.floor(segundo * FRECUENCIA));
}

let pico = 0;
for (const muestra of muestras) pico = Math.max(pico, Math.abs(muestra));
// Un aplauso sin palmadas escribiría un archivo mudo: mejor fallar y avisar.
if (!(pico > 0)) throw new Error("El aplauso generado no tiene señal");
const escala = 0.8 / pico;

// WAV PCM de 16 bits, mono.
const datos = Buffer.alloc(44 + total * 2);
datos.write("RIFF", 0);
datos.writeUInt32LE(36 + total * 2, 4);
datos.write("WAVE", 8);
datos.write("fmt ", 12);
datos.writeUInt32LE(16, 16);
datos.writeUInt16LE(1, 20);
datos.writeUInt16LE(1, 22);
datos.writeUInt32LE(FRECUENCIA, 24);
datos.writeUInt32LE(FRECUENCIA * 2, 28);
datos.writeUInt16LE(2, 32);
datos.writeUInt16LE(16, 34);
datos.write("data", 36);
datos.writeUInt32LE(total * 2, 40);
for (let i = 0; i < total; i++) {
  datos.writeInt16LE(Math.round(Math.max(-1, Math.min(1, muestras[i] * escala)) * 32767), 44 + i * 2);
}

for (const destino of DESTINOS) {
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, datos);
  console.log(`${destino} ${(datos.length / 1024).toFixed(0)} kB`);
}
