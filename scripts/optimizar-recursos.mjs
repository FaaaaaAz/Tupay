// Convierte los originales de assets/ a las versiones que usa el juego en
// client/src/recursos/. Se ejecuta a mano, muy de vez en cuando:
//
//   npm install --no-save sharp
//   node scripts/optimizar-recursos.mjs            (todos los grupos)
//   node scripts/optimizar-recursos.mjs escudos    (solo los grupos nombrados)
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

/**
 * Recorta el margen transparente del escudo y lo encaja en un cuadrado: así los diez ocupan
 * todo el espacio que les da la pantalla, sin que uno se vea más chico que otro.
 */
async function normalizarEscudo(origen, destino, lado) {
  const escudo = await sharp(origen).trim({ threshold: 8 }).toBuffer();
  const imagen = sharp(escudo).resize(lado, lado, { fit: "contain", background: TRANSPARENTE });
  await guardar(imagen, destino, 90);
}

/**
 * Recorta el margen transparente de una ilustración de la interfaz y la reduce sin rellenarla:
 * el CSS la centra en su hueco, así que ocupa todo el espacio que le toca.
 */
async function recortarIlustracion(origen, destino, ancho, alto) {
  const dibujo = await sharp(origen).trim({ threshold: 8 }).toBuffer();
  const imagen = sharp(dibujo).resize(ancho, alto, { fit: "inside", withoutEnlargement: true });
  await guardar(imagen, destino, 88);
}

const tarjetas = {
  eliminatoriaCard: "eliminatoria",
  ligaCard: "liga",
  temporadaCard: "temporada",
  comoJugarCard: "instrucciones",
};

const GRUPOS = {
  async tapitas() {
    for (const equipo of equipos) {
      await ajustar(`${ORIGEN}/players/${equipo}.png`, `${DESTINO}/equipos/${equipo}.webp`, 256, 256);
    }
  },
  async escudos() {
    for (const equipo of equipos) {
      await normalizarEscudo(`${ORIGEN}/teams/${equipo}.png`, `${DESTINO}/escudos/${equipo}.webp`, 256);
    }
  },
  async estadios() {
    for (const [archivo, nombre] of Object.entries(estadios)) {
      await ajustar(`${ORIGEN}/stadium/${archivo}.png`, `${DESTINO}/estadios/${nombre}.webp`, 1672, 941, 82);
    }
  },
  async pantallas() {
    await ajustar(`${ORIGEN}/UI/Start.png`, `${DESTINO}/pantallas/inicio.webp`, 1672, 941, 82);
    await ajustar(`${ORIGEN}/UI/menuPrincipal.png`, `${DESTINO}/pantallas/menu.webp`, 1672, 941, 82);
  },
  async paneles() {
    await ajustar(`${ORIGEN}/UI/fondoCards.png`, `${DESTINO}/pantallas/paneles.webp`, 1811, 868, 80);
  },
  async tarjetas() {
    for (const [archivo, nombre] of Object.entries(tarjetas)) {
      await recortarIlustracion(`${ORIGEN}/UI/${archivo}.png`, `${DESTINO}/tarjetas/${nombre}.webp`, 560, 420);
    }
  },
  /** El título del menú y el fondo del marcador de la partida, recortados a su dibujo. */
  async interfaz() {
    await recortarIlustracion(`${ORIGEN}/UI/titulo.png`, `${DESTINO}/pantallas/titulo.webp`, 1200, 420);
    await recortarIlustracion(`${ORIGEN}/UI/marcador.png`, `${DESTINO}/juego/marcador.webp`, 1920, 200);
  },
  /** Los árbitros que encabezan los modales de la partida: uno para la pausa y otro para salir. */
  async modales() {
    await recortarIlustracion(`${ORIGEN}/UI/pausa.png`, `${DESTINO}/pantallas/pausa.webp`, 360, 300);
    await recortarIlustracion(`${ORIGEN}/UI/salir.png`, `${DESTINO}/pantallas/salir.webp`, 360, 300);
  },
  async juego() {
    await ajustar(`${ORIGEN}/items/pelota.png`, `${DESTINO}/juego/pelota.webp`, 160, 160);
    await ajustar(`${ORIGEN}/items/perro.png`, `${DESTINO}/juego/perro.webp`, 256, 256);
    await ajustar(`${ORIGEN}/items/arco.png`, `${DESTINO}/juego/arco.webp`, 480, 1136);
    await ajustar(`${ORIGEN}/items/charcoDeAgua.png`, `${DESTINO}/juego/charcoDeAgua.webp`, 512, 341);
    await ajustar(`${ORIGEN}/items/charcoDeNieve.png`, `${DESTINO}/juego/charcoDeNieve.webp`, 512, 341);
  },
  async emotes() {
    for (const emote of emotes) {
      await normalizarEmote(`${ORIGEN}/emotes/${emote}.png`, `${DESTINO}/emotes/${emote}.webp`, 256);
    }
  },
};

const pedidos = process.argv.slice(2);
const desconocidos = pedidos.filter((nombre) => !Object.hasOwn(GRUPOS, nombre));
if (desconocidos.length > 0) {
  console.error(`Grupos desconocidos: ${desconocidos.join(", ")}. Existen: ${Object.keys(GRUPOS).join(", ")}.`);
  process.exit(1);
}

for (const nombre of pedidos.length > 0 ? pedidos : Object.keys(GRUPOS)) {
  console.log(`\n${nombre}`);
  await GRUPOS[nombre]();
}
