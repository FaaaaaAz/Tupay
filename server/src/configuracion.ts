import path from "node:path";

export const PUERTO = Number(process.env.PORT ?? 3000);

/** Render expone el commit publicado; en local no existe y se informa como "local". */
export const VERSION = process.env.RENDER_GIT_COMMIT ?? "local";

/** Carpeta con el cliente ya compilado por Vite. Solo existe después de `npm run build`. */
export const DIRECTORIO_CLIENTE = path.join(import.meta.dirname, "../../cliente");
