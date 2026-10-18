import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import s from "./CheckoutPage.module.css";
export default function CheckoutDialog({ title, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previous;
    };
  }, []);
  function close() {
    ref.current.close();
    onClose();
  }
  return (
    <dialog
      ref={ref}
      className={s.dialog}
      aria-labelledby="checkout-dialog-title"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <header>
        <h2 id="checkout-dialog-title">{title}</h2>
        <button aria-label="Close checkout dialog" onClick={close}>
          <X size={19} />
        </button>
      </header>
      {children}
    </dialog>
  );
}
