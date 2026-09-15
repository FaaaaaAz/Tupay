import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./estilos/global.css";
import "./estilos/partida.css";
import "./estilos/audio.css";

const raiz = document.getElementById("raiz");
if (!raiz) {
  throw new Error("No se encontró el elemento raíz de la aplicación");
}

createRoot(raiz).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
