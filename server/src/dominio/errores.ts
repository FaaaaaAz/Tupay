/** Error previsto por las reglas: su mensaje se muestra tal cual al jugador. */
export class ErrorDeJuego extends Error {
  /** Código HTTP con el que se responde. */
  readonly estado: number;

  constructor(mensaje: string, estado = 400) {
    super(mensaje);
    this.name = "ErrorDeJuego";
    this.estado = estado;
  }
}
