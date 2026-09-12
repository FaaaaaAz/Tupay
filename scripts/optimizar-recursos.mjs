// Convierte los originales de assets/ a las versiones que usa el juego en
// client/src/recursos/. Se ejecuta a mano, muy de vez en cuando:
//
//   npm install --no-save sharp
//   node scripts/optimizar-recursos.mjs
//
// sharp no se guarda como dependencia del proyecto: solo hace falta para
// regenerar los recursos, no para compilar ni para jugar.

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ORIGEN = "assets";
const DESTINO = "client/src/recursos";

/** Proporción del lienzo que ocupa la carita, para que caiga dentro del disco de la tapita. */
const PROPORCION_EMOTE = 0.7;

const equipos = [
  "alwaysReady",
  "aurora",
  "blooming",
  "bolivar",
  "nacionalPotosi",
  "orientePetrolero",
  "realPotosi",
  "sanJose",
  "theStrongest",
  "wilstermann",
];

const estadios = {
  "felixCapriles(cbb)": "felixCapriles",
  "hernandoSiles(lp)": "hernandoSiles",
  "jesusBermudez(or)": "jesusBermudez",
  "ramonAguilera(scz)": "ramonAguilera",
  "victorAgustin(pot)": "victorAgustin",
  "villaIngenio(elAlto)": "villaIngenio",
};

const emotes = [
  "dormido",
  "enojado",
  "enojadoSerio",
  "feliz",
  "felizEuforico",
  "llorando",
  "sorprendido",
];

async function guardar(imagen, destino, calidad) {
  await fs.mkdir(path.dirname(destino), { recursive: true });
  await imagen.webp({ quality: calidad, effort: 6 }).toFile(destino);
  const { size } = await fs.stat(destino);
  console.log(`${destino.padEnd(48)} ${(size / 1024).toFixed(0)} kB`);
}

/** Fondo transparente para encajar una imagen sin recortarla. */
const TRANSPARENTE = { r: 0, g: 0, b: 0, alpha: 0 };

async function ajustar(origen, destino, ancho, alto, calidad = 90) {
  const imagen = sharp(origen).resize(ancho, alto, {
    fit: "contain",
    background: TRANSPARENTE,
  });
  await guardar(imagen, destino, calidad);
}

/**
 * Recorta la carita hasta su contenido real y la centra en un lienzo cuadrado,
 * para que los siete emotes se dibujen siempre en el mismo rectángulo que la tapita.
 */
async function normalizarEmote(origen, destino, lado) {
  const interior = Math.round(lado * PROPORCION_EMOTE);
  const cara = await sharp(origen)
    .trim({ threshold: 8 })
    .resize(interior, interior, { fit: "inside" })
    .toBuffer();

  const imagen = sharp({
    create: { width: lado, height: lado, channels: 4, background: TRANSPARENTE },
  }).composite([{ input: cara, gravity: "centre" }]);

  await guardar(imagen, destino, 92);
}

console.log("Tapitas de cada equipo");
for (const equipo of equipos) {
  await ajustar(`${ORIGEN}/players/${equipo}.png`, `${DESTINO}/equipos/${equipo}.webp`, 256, 256);
}

console.log("\nEstadios");
for (const [archivo, nombre] of Object.entries(estadios)) {
  await ajustar(`${ORIGEN}/stadium/${archivo}.png`, `${DESTINO}/estadios/${nombre}.webp`, 1672, 941, 82);
}

console.log("\nPantallas");
await ajustar(`${ORIGEN}/UI/Start.png`, `${DESTINO}/pantallas/inicio.webp`, 1672, 941, 82);
await ajustar(`${ORIGEN}/UI/menuPrincipal.png`, `${DESTINO}/pantallas/menu.webp`, 1672, 941, 82);

console.log("\nElementos de la cancha");
await ajustar(`${ORIGEN}/items/pelota.png`, `${DESTINO}/juego/pelota.webp`, 160, 160);
await ajustar(`${ORIGEN}/items/perro.png`, `${DESTINO}/juego/perro.webp`, 256, 256);
await ajustar(`${ORIGEN}/items/arco.png`, `${DESTINO}/juego/arco.webp`, 480, 1136);
await ajustar(`${ORIGEN}/items/charcoDeAgua.png`, `${DESTINO}/juego/charcoDeAgua.webp`, 512, 341);
await ajustar(`${ORIGEN}/items/charcoDeNieve.png`, `${DESTINO}/juego/charcoDeNieve.webp`, 512, 341);

console.log("\nEmotes");
for (const emote of emotes) {
  await normalizarEmote(`${ORIGEN}/emotes/${emote}.png`, `${DESTINO}/emotes/${emote}.webp`, 256);
}
