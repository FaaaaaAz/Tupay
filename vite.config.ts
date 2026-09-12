import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  root: "client",
  plugins: [react()],
  build: {
    outDir: "../dist/cliente",
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    // En desarrollo el cliente y el servidor corren aparte; este proxy hace que
    // el navegador vea /api en el mismo origen, igual que en producción.
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
