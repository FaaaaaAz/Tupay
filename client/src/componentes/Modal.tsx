import { useEffect, useId, useRef, type ReactNode } from "react";

interface Props {
  titulo: string;
  detalle: string;
  children: ReactNode;
  alCancelar: () => void;
  ocupado?: boolean;
}

/** El diálogo nativo aísla el fondo y mantiene el foco de teclado dentro del modal. */
export function Modal({ titulo, detalle, children, alCancelar, ocupado = false }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const elemento = dialogo.current;
    const anterior = document.activeElement;
    elemento?.showModal();
    return () => {
      elemento?.close();
      if (anterior instanceof HTMLElement && anterior.isConnected) anterior.focus();
    };
  }, []);
  useEffect(() => {
    if (!ocupado) dialogo.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
  }, [ocupado, titulo]);

  return (
    <dialog ref={dialogo} className="modal" aria-labelledby={`${id}-titulo`}
      aria-describedby={`${id}-detalle`} aria-busy={ocupado}
      onKeyDown={(evento) => {
        if (evento.key !== "Tab") return;
        const botones = Array.from(evento.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));
        const primero = botones[0];
        const ultimo = botones.at(-1);
        if (!primero) { evento.preventDefault(); return; }
        if (evento.shiftKey && document.activeElement === primero) { evento.preventDefault(); ultimo?.focus(); }
        else if (!evento.shiftKey && document.activeElement === ultimo) { evento.preventDefault(); primero.focus(); }
      }}
      onCancel={(evento) => { evento.preventDefault(); if (!ocupado) alCancelar(); }}>
      <div className="modal__insignia" aria-hidden="true">Ⅱ</div>
      <p className="modal__etiqueta">Tupay · Tiempo fuera</p>
      <h2 id={`${id}-titulo`}>{titulo}</h2>
      <p id={`${id}-detalle`} className="modal__detalle">{detalle}</p>
      <div className="modal__acciones">{children}</div>
      <p className="modal__ayuda">{ocupado ? "Un momento…" : "Esc para volver"}</p>
    </dialog>
  );
}
