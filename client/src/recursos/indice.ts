import type { IdEmote, IdEquipo, IdEstadio } from "../../../compartido/catalogo.js";
import type { TipoCharco } from "../../../compartido/partida.js";
import dormido from "./emotes/dormido.webp";
import enojado from "./emotes/enojado.webp";
import enojadoSerio from "./emotes/enojadoSerio.webp";
import feliz from "./emotes/feliz.webp";
import felizEuforico from "./emotes/felizEuforico.webp";
import llorando from "./emotes/llorando.webp";
import sorprendido from "./emotes/sorprendido.webp";
import alwaysReady from "./equipos/alwaysReady.webp";
import aurora from "./equipos/aurora.webp";
import blooming from "./equipos/blooming.webp";
import bolivar from "./equipos/bolivar.webp";
import nacionalPotosi from "./equipos/nacionalPotosi.webp";
import orientePetrolero from "./equipos/orientePetrolero.webp";
import realPotosi from "./equipos/realPotosi.webp";
import sanJose from "./equipos/sanJose.webp";
import theStrongest from "./equipos/theStrongest.webp";
import wilstermann from "./equipos/wilstermann.webp";
import felixCapriles from "./estadios/felixCapriles.webp";
import hernandoSiles from "./estadios/hernandoSiles.webp";
import jesusBermudez from "./estadios/jesusBermudez.webp";
import ramonAguilera from "./estadios/ramonAguilera.webp";
import victorAgustin from "./estadios/victorAgustin.webp";
import villaIngenio from "./estadios/villaIngenio.webp";
import arco from "./juego/arco.webp";
import charcoDeAgua from "./juego/charcoDeAgua.webp";
import charcoDeNieve from "./juego/charcoDeNieve.webp";
import pelota from "./juego/pelota.webp";
import perro from "./juego/perro.webp";
import inicio from "./pantallas/inicio.webp";
import menu from "./pantallas/menu.webp";

// Vite les agrega un hash a las imágenes importadas, así el navegador puede guardarlas en caché.
// Si falta la imagen de un equipo, estadio, emote o charco del contrato, TypeScript no compila.

export const IMAGEN_DE_EQUIPO: Record<IdEquipo, string> = {
  alwaysReady,
  aurora,
  blooming,
  bolivar,
  nacionalPotosi,
  orientePetrolero,
  realPotosi,
  sanJose,
  theStrongest,
  wilstermann,
};

export const IMAGEN_DE_ESTADIO: Record<IdEstadio, string> = {
  felixCapriles,
  hernandoSiles,
  jesusBermudez,
  ramonAguilera,
  victorAgustin,
  villaIngenio,
};

export const IMAGEN_DE_EMOTE: Record<IdEmote, string> = {
  dormido,
  enojado,
  enojadoSerio,
  feliz,
  felizEuforico,
  llorando,
  sorprendido,
};

export const IMAGEN_DE_CHARCO: Record<TipoCharco, string> = {
  agua: charcoDeAgua,
  nieve: charcoDeNieve,
};

export const IMAGENES = { arco, pelota, perro, inicio, menu };
