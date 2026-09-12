export type IdEquipo =
  | "alwaysReady"
  | "aurora"
  | "blooming"
  | "bolivar"
  | "nacionalPotosi"
  | "orientePetrolero"
  | "realPotosi"
  | "sanJose"
  | "theStrongest"
  | "wilstermann";

export type IdEstadio =
  | "felixCapriles"
  | "hernandoSiles"
  | "jesusBermudez"
  | "ramonAguilera"
  | "victorAgustin"
  | "villaIngenio";

/** Qué le hace el estadio a la pelota. Ver `docs/reglas.md`. */
export type EfectoEstadio = "ninguno" | "charcosDeAgua" | "charcosDeNieve";

export interface Equipo {
  id: IdEquipo;
  nombre: string;
  departamento: string;
  /** Estadio donde juega de local. */
  estadio: IdEstadio;
  colorPrincipal: string;
  colorSecundario: string;
}

export interface Estadio {
  id: IdEstadio;
  nombre: string;
  ciudad: string;
  efecto: EfectoEstadio;
}

export type IdEmote =
  | "dormido"
  | "enojado"
  | "enojadoSerio"
  | "feliz"
  | "felizEuforico"
  | "llorando"
  | "sorprendido";
