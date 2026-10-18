import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { HelpCircle, Info, Ticket, Truck, X } from "lucide-react";
import { mockVouchers, findVoucher, voucherStatus } from "../../data/vouchers";
import { money } from "../../data/catalog";
import { useCart } from "../../components/cart/CartProvider";
import s from "./VoucherDialog.module.css";

export default function VoucherDialog({ onClose }) {
  const { subtotal, selectedCount, appliedVoucher, applyVoucher } = useCart();
  const dialog = useRef(null);
  const input = useRef(null);
  const [code, setCode] = useState("");
  const [draft, setDraft] = useState(appliedVoucher?.code || "");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const status = draft
    ? voucherStatus(findVoucher(draft), { subtotal, selectedCount })
    : null;
  useEffect(() => {
    const node = dialog.current;
    const previous = document.body.style.overflow;
    node.showModal();
    input.current.focus();
    document.body.style.overflow = "hidden";
    return () => {
      node.close();
      document.body.style.overflow = previous;
    };
  }, []);
  function close() {
    dialog.current.close();
    onClose();
  }
  function enterCode(e) {
    e.preventDefault();
    const voucher = findVoucher(code);
    const check = voucherStatus(voucher, { subtotal, selectedCount });
    setMessage("");
    if (!check.eligible) {
      setError(check.reason);
      return;
    }
    setDraft(voucher.code);
    setError("");
    setMessage(`${voucher.code} selected. Confirm to apply it to your cart.`);
  }
  function confirm() {
    const result = applyVoucher(draft);
    if (result.success) close();
    else setError(result.error);
  }
  return (
    <dialog
      className={s.dialog}
      ref={dialog}
      aria-labelledby="voucher-heading"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <header className={s.header}>
        <h2 id="voucher-heading">Select Shopiz Voucher</h2>
        <Link to="/help">
          Help
          <HelpCircle size={14} />
        </Link>
        <button aria-label="Close voucher popup" onClick={close}>
          <X size={19} />
        </button>
      </header>
      <div className={s.body}>
        <form className={s.codeForm} onSubmit={enterCode}>
          <label htmlFor="voucher-code">Voucher code</label>
          <input
            id="voucher-code"
            ref={input}
            autoComplete="off"
            spellCheck={false}
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError("");
              setMessage("");
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "voucher-error" : undefined}
          />
          <button type="submit" disabled={!code.trim()}>
            Apply
          </button>
        </form>
        {error && (
          <p id="voucher-error" className={s.error} role="alert">
            <Info size={15} />
            {error}
          </p>
        )}
        {message && (
          <p className={s.notice} role="status">
            {message}
          </p>
        )}
        <div
          className={s.voucherList}
          role="group"
          aria-label="Available vouchers"
        >
          {["shipping", "shopping"].map((group) => (
            <section key={group}>
              <h3>
                {group === "shipping"
                  ? "Free shipping vouchers"
                  : "Shopping vouchers"}
              </h3>
              {mockVouchers
                .filter((v) =>
                  group === "shipping"
                    ? v.type === "shipping"
                    : v.type !== "shipping",
                )
                .map((v) => {
                  const eligibility = voucherStatus(v, {
                    subtotal,
                    selectedCount,
                  });
                  return (
                    <div
                      key={v.code}
                      className={`${s.offer} ${!eligibility.eligible ? s.unavailable : ""}`}
                    >
                      <label
                        className={`${s.card} ${draft === v.code ? s.selected : ""}`}
                      >
                        <span className={s.ticketArt}>
                          {v.type === "shipping" ? (
                            <Truck size={27} strokeWidth={1.3} />
                          ) : (
                            <Ticket size={27} strokeWidth={1.3} />
                          )}
                          <strong>
                            {v.type === "shipping"
                              ? "FREE SHIP"
                              : v.type === "percent"
                                ? `${v.percent}% OFF`
                                : money(v.amount) + " OFF"}
                          </strong>
                          <small>SHOPIZ</small>
                        </span>
                        <span className={s.details}>
                          <strong>{v.title}</strong>
                          <span>
                            Min. spend {money(v.minimum)}
                            {v.maxDiscount && v.type !== "shipping"
                              ? ` · Up to ${money(v.maxDiscount)}`
                              : ""}
                          </span>
                          <span className={s.code}>{v.code}</span>
                          <small>Valid until Dec 31, 2026</small>
                        </span>
                        <input
                          type="radio"
                          name="voucher-choice"
                          value={v.code}
                          aria-label={v.code}
                          checked={draft === v.code}
                          disabled={!eligibility.eligible}
                          onChange={() => {
                            setDraft(v.code);
                            setError("");
                            setMessage("");
                          }}
                        />
                      </label>
                      <details className={s.conditions}>
                        <summary>Terms & conditions</summary>
                        <p>
                          {v.description} Minimum selected-item spend:{" "}
                          {money(v.minimum)}. One voucher per cart. Applies only
                          to selected products. Valid through {v.expiresAt}.
                          Demo offer only.
                        </p>
                      </details>
                      {eligibility.reason && (
                        <p className={s.eligibility}>
                          <Info size={14} />
                          {eligibility.reason}
                        </p>
                      )}
                    </div>
                  );
                })}
            </section>
          ))}
        </div>
      </div>
      <footer className={s.footer}>
        <button
          className={s.clear}
          disabled={!draft}
          onClick={() => {
            setDraft("");
            setError("");
            setMessage(
              "No voucher selected. Confirm to remove the current voucher.",
            );
          }}
        >
          Clear selection
        </button>
        <button className={s.back} onClick={close}>
          Back
        </button>
        <button
          className={s.confirm}
          disabled={Boolean(draft && !status?.eligible)}
          onClick={confirm}
        >
          Confirm
        </button>
      </footer>
    </dialog>
  );
}
