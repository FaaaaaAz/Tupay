import type { IdEquipo, IdEstadio } from "../../../compartido/catalogo.js";
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
import pelota from "./juego/pelota.webp";
import perro from "./juego/perro.webp";
import inicio from "./pantallas/inicio.webp";
import menu from "./pantallas/menu.webp";

// Vite les agrega un hash a las imágenes importadas, así el navegador puede guardarlas en caché.
// Si falta la imagen de un equipo o estadio del catálogo, TypeScript no compila.

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

export const IMAGENES = { arco, pelota, perro, inicio, menu };
