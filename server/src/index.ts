import { crearApp } from "./app.js";
import { PUERTO } from "./configuracion.js";

crearApp().listen(PUERTO, () => {
  console.log(`Tupay escuchando en http://localhost:${PUERTO}`);
});
