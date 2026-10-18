import React, { useState } from "react";
import { Plus, MapPin } from "lucide-react";
import AccountSidebar from "../../components/account/AccountSidebar";
import { useAccount } from "../../components/account/AccountProvider";
import AddressEditor from "./AddressEditor";
import CheckoutDialog from "../checkout/CheckoutDialog";
import d from "../checkout/CheckoutPage.module.css";
import s from "./AccountPages.module.css";
export default function AddressesPage() {
  const {
    addresses,
    saveAddress,
    removeAddress,
    setDefaultAddress,
    storageError,
  } = useAccount();
  const [editor, setEditor] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [notice, setNotice] = useState("");
  function save(address) {
    if (!saveAddress(address)) {
      setNotice(
        "You can save up to 20 addresses. Remove one before adding another.",
      );
      return;
    }
    setEditor(null);
    setNotice("Your address has been saved.");
  }
  return (
    <div className={s.page}>
      <AccountSidebar />
      <section className={s.panel}>
        <header className={s.heading}>
          <h1>My Addresses</h1>
          <button
            className={s.primary}
            disabled={addresses.length >= 20}
            onClick={() => setEditor({})}
          >
            <Plus size={16} />
            Add New Address
          </button>
        </header>
        <div className={s.addressBody}>
          <h2>Addresses</h2>
          {addresses.length >= 20 && (
            <p className={s.hint}>
              You can save up to 20 addresses. Remove one to add another.
            </p>
          )}
          {notice && (
            <p className={s.feedback} role="status">
              {notice}
            </p>
          )}
          {storageError && (
            <p className={s.error} role="status">
              Browser storage is unavailable. Changes are kept for this visit
              only.
            </p>
          )}
          {addresses.length ? (
            addresses.map((address) => (
              <article
                key={address.id}
                className={s.address}
                aria-label={`${address.label} address for ${address.name}`}
              >
                <div className={s.addressInfo}>
                  <h3>
                    {address.name}
                    <span>{address.phone}</span>
                  </h3>
                  <p>
                    {address.street}
                    <br />
                    {address.ward}, {address.district}, {address.city}
                  </p>
                  <div className={s.badges}>
                    {address.isDefault && <span>Default</span>}
                    <small>{address.label}</small>
                  </div>
                </div>
                <div className={s.addressActions}>
                  <div>
                    <button onClick={() => setEditor({ address })}>Edit</button>
                    {!address.isDefault && (
                      <button onClick={() => setDeleting(address)}>
                        Delete
                      </button>
                    )}
                  </div>
                  <button
                    className={s.secondary}
                    disabled={address.isDefault}
                    onClick={() => {
                      setDefaultAddress(address.id);
                      setNotice("Default address updated.");
                    }}
                  >
                    Set as Default
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className={s.empty}>
              <MapPin size={36} strokeWidth={1.2} />
              <h3>No addresses yet</h3>
              <p>Add a delivery address to your account.</p>
            </div>
          )}
          <p className={s.hint}>
            Addresses are saved in this browser for your demo account.
          </p>
        </div>
      </section>
      {editor && (
        <AddressEditor
          address={editor.address}
          onSave={save}
          onClose={() => setEditor(null)}
        />
      )}
      {deleting && (
        <CheckoutDialog
          title="Delete Address"
          onClose={() => setDeleting(null)}
        >
          <div className={d.dialogBody}>
            <p>Remove this address from your address book?</p>
            <p className={s.hint}>
              {deleting.street}, {deleting.city}
            </p>
          </div>
          <footer className={d.dialogFooter}>
            <button className={d.secondary} onClick={() => setDeleting(null)}>
              Cancel
            </button>
            <button
              className={d.primary}
              onClick={() => {
                removeAddress(deleting.id);
                setDeleting(null);
                setNotice("Address deleted.");
              }}
            >
              Delete Address
            </button>
          </footer>
        </CheckoutDialog>
      )}
    </div>
  );
}
