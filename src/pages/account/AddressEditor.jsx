import React, { useState } from "react";
import CheckoutDialog from "../checkout/CheckoutDialog";
import { validateAddress } from "../../data/addresses";
import s from "./AccountPages.module.css";
import d from "../checkout/CheckoutPage.module.css";
export default function AddressEditor({ address, onSave, onClose }) {
  const [draft, setDraft] = useState(
    address || {
      id: crypto.randomUUID(),
      name: "",
      phone: "",
      street: "",
      ward: "",
      district: "",
      city: "",
      label: "Home",
      isDefault: false,
    },
  );
  const [errors, setErrors] = useState({});
  function save(e) {
    e.preventDefault();
    const next = validateAddress(draft);
    setErrors(next);
    if (Object.keys(next).length) return;
    onSave(
      Object.fromEntries(
        Object.entries(draft).map(([key, value]) => [
          key,
          typeof value === "string" ? value.trim() : value,
        ]),
      ),
    );
  }
  return (
    <CheckoutDialog
      title={address ? "Edit Address" : "New Address"}
      onClose={onClose}
    >
      <form noValidate onSubmit={save}>
        <div className={d.dialogBody}>
          <div className={d.addressFields}>
            {[
              ["name", "Full name", "name"],
              ["phone", "Phone number", "tel"],
              ["city", "City", "address-level1"],
              ["district", "District", "address-level2"],
              ["ward", "Ward", "address-level3"],
              ["street", "Street address", "street-address"],
            ].map(([key, label, autocomplete]) => (
              <div key={key} className={key === "street" ? d.wideField : ""}>
                <label htmlFor={`book-${key}`}>{label}</label>
                <input
                  id={`book-${key}`}
                  autoComplete={autocomplete}
                  value={draft[key]}
                  type={key === "phone" ? "tel" : "text"}
                  maxLength={key === "street" ? 160 : 80}
                  onChange={(e) =>
                    setDraft({ ...draft, [key]: e.target.value })
                  }
                  aria-invalid={Boolean(errors[key])}
                  aria-describedby={
                    errors[key] ? `book-${key}-error` : undefined
                  }
                />
                {errors[key] && (
                  <p className={s.error} id={`book-${key}-error`}>
                    {errors[key]}
                  </p>
                )}
              </div>
            ))}
          </div>
          <fieldset className={s.addressType}>
            <legend>Address Type</legend>
            {["Home", "Office", "Other"].map((label) => (
              <label key={label}>
                <input
                  type="radio"
                  name="address-type"
                  checked={draft.label === label}
                  onChange={() => setDraft({ ...draft, label })}
                />
                {label}
              </label>
            ))}
          </fieldset>
          <label className={s.defaultCheck}>
            <input
              type="checkbox"
              checked={draft.isDefault}
              onChange={(e) =>
                setDraft({ ...draft, isDefault: e.target.checked })
              }
            />
            Set as default address
          </label>
        </div>
        <footer className={d.dialogFooter}>
          <button className={d.secondary} type="button" onClick={onClose}>
            Cancel
          </button>
          <button className={d.primary} type="submit">
            Save Address
          </button>
        </footer>
      </form>
    </CheckoutDialog>
  );
}
