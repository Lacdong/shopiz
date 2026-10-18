import React, { useState } from "react";
import { Plus, MapPin } from "lucide-react";
import CheckoutDialog from "./CheckoutDialog";
import { formatAddress, validateAddress } from "./checkoutData";
import s from "./CheckoutPage.module.css";
export default function AddressDialog({
  addresses,
  selectedId,
  onSave,
  onClose,
}) {
  const [chosen, setChosen] = useState(selectedId);
  const [draft, setDraft] = useState(null);
  const [errors, setErrors] = useState({});
  function edit(address) {
    setDraft({ ...address });
    setErrors({});
  }
  function submit(e) {
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
      title={draft ? "Delivery address" : "Select delivery address"}
      onClose={onClose}
    >
      {draft ? (
        <form noValidate onSubmit={submit}>
          <div className={s.dialogBody}>
            <p className={s.muted}>
              Address changes apply to this checkout visit only.
            </p>
            <div className={s.addressFields}>
              {[
                ["name", "Full name", "name"],
                ["phone", "Phone number", "tel"],
                ["city", "City", "address-level1"],
                ["district", "District", "address-level2"],
                ["ward", "Ward", "address-level3"],
                ["street", "Street address", "street-address"],
              ].map(([key, label, autocomplete]) => (
                <div key={key} className={key === "street" ? s.wideField : ""}>
                  <label htmlFor={`address-${key}`}>{label}</label>
                  <input
                    id={`address-${key}`}
                    autoComplete={autocomplete}
                    type={key === "phone" ? "tel" : "text"}
                    value={draft[key]}
                    maxLength={key === "street" ? 160 : 80}
                    onChange={(e) =>
                      setDraft({ ...draft, [key]: e.target.value })
                    }
                    aria-invalid={Boolean(errors[key])}
                    aria-describedby={
                      errors[key] ? `address-${key}-error` : undefined
                    }
                  />
                  {errors[key] && (
                    <p className={s.fieldError} id={`address-${key}-error`}>
                      {errors[key]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
          <footer className={s.dialogFooter}>
            <button
              type="button"
              className={s.secondary}
              onClick={() => setDraft(null)}
            >
              Back
            </button>
            <button className={s.primary} type="submit">
              Save address
            </button>
          </footer>
        </form>
      ) : (
        <>
          <div className={s.dialogBody}>
            <p className={s.muted}>
              These are fictional sample addresses. You can edit one for the
              demo.
            </p>
            {addresses.map((address) => (
              <div
                className={`${s.addressChoice} ${chosen === address.id ? s.selectedChoice : ""}`}
                key={address.id}
              >
                <label>
                  <input
                    type="radio"
                    name="delivery-address"
                    checked={chosen === address.id}
                    onChange={() => setChosen(address.id)}
                  />
                  <span>
                    <strong>
                      {address.name}
                      <small>{address.phone}</small>
                    </strong>
                    <span>{formatAddress(address)}</span>
                    {address.isDefault && <em>Default</em>}
                  </span>
                </label>
                <button onClick={() => edit(address)}>Edit</button>
              </div>
            ))}
            <button
              className={s.newAddress}
              onClick={() =>
                edit({
                  id: `address-${Date.now()}`,
                  name: "",
                  phone: "",
                  street: "",
                  ward: "",
                  district: "",
                  city: "",
                  label: "Other",
                  isDefault: false,
                })
              }
            >
              <Plus size={15} />
              <MapPin size={15} />
              Add new address
            </button>
          </div>
          <footer className={s.dialogFooter}>
            <button className={s.secondary} onClick={onClose}>
              Cancel
            </button>
            <button
              className={s.primary}
              onClick={() =>
                onSave(addresses.find((address) => address.id === chosen))
              }
            >
              Confirm
            </button>
          </footer>
        </>
      )}
    </CheckoutDialog>
  );
}
