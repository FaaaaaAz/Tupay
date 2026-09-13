import { useEffect, useState } from "react";
import type { RespuestaSalud } from "../../../compartido/salud.js";
import { obtenerSalud } from "../api/salud";

export function useSalud() {
  const [salud, setSalud] = useState<RespuestaSalud | null>(null);
  const [sinConexion, setSinConexion] = useState(false);

  useEffect(() => {
    obtenerSalud()
      .then(setSalud)
      .catch(() => setSinConexion(true));
  }, []);

  return { salud, sinConexion };
}
