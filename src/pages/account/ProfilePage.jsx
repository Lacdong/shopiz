import React, { useEffect, useRef, useState } from "react";
import { UserRound } from "lucide-react";
import AccountSidebar from "../../components/account/AccountSidebar";
import {
  useAccount,
  validBirthday,
} from "../../components/account/AccountProvider";
import mediaService from "../../services/mediaService";
import CheckoutDialog from "../checkout/CheckoutDialog";
import d from "../checkout/CheckoutPage.module.css";
import s from "./AccountPages.module.css";
const maskEmail = (email) => {
  const [name, domain] = email.split("@");
  return `${name.slice(0, 2)}${"*".repeat(Math.max(3, name.length - 2))}@${domain}`;
};
export default function ProfilePage() {
  const { profile, username, saveProfile, storageError } = useAccount();
  const [draft, setDraft] = useState(profile);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState(null);
  const [contactValue, setContactValue] = useState("");
  const [contactError, setContactError] = useState("");
  const fileRef = useRef(null);
  const version = useRef(0);
  useEffect(() => {
    setDraft(profile);
  }, [profile]);
  useEffect(
    () => () => {
      version.current++;
    },
    [],
  );
  function change(key, value) {
    setDraft((current) => ({ ...current, [key]: value }));
    setMessage("");
  }
  function save(event) {
    event.preventDefault();
    const next = {};
    if (draft.name.trim().length < 2)
      next.name = "Enter a name with at least 2 characters.";
    if (!validBirthday(draft))
      next.birthday = "Choose a valid date of birth that is not in the future.";
    setErrors(next);
    if (Object.keys(next).length) return;
    saveProfile({ ...draft, name: draft.name.trim() });
    setMessage("Your profile has been saved.");
  }
  function editContact(key) {
    setContact(key);
    setContactValue(draft[key]);
    setContactError("");
  }
  function updateContact(event) {
    event.preventDefault();
    const value = contactValue.trim();
    if (
      contact === "email"
        ? !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        : !/^\+?\d{9,15}$/.test(value.replace(/[\s().-]/g, ""))
    ) {
      setContactError(
        contact === "email"
          ? "Enter a valid email address."
          : "Enter a valid phone number (9–15 digits).",
      );
      return;
    }
    change(contact, value);
    setContact(null);
    setMessage("Contact updated. Save your profile to keep this change.");
  }
  function selectImage(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    const operation = ++version.current;
    if (!file) return;
    setErrors((current) => ({ ...current, avatar: "" }));
    if (
      !["image/png", "image/jpeg"].includes(file.type) ||
      file.size > 1048576
    ) {
      setErrors((current) => ({
        ...current,
        avatar: "Choose a JPEG or PNG image up to 1 MB.",
      }));
      return;
    }
    const reader = new FileReader();
    const fail = () => {
      if (operation === version.current)
        setErrors((current) => ({
          ...current,
          avatar: "This image could not be opened. Choose another file.",
        }));
    };
    reader.onerror = fail;
    reader.onload = () => {
      const picture = new Image();
      picture.onerror = fail;
      picture.onload = () => {
        if (operation === version.current) {
          change("avatar", reader.result);
          setErrors((current) => ({ ...current, avatar: "" }));
          // Upload to cloud storage in background
          mediaService.uploadMedia(file).then((uploaded) => {
            if (uploaded?.url && operation === version.current) {
              change("avatar", uploaded.url);
            }
          }).catch(() => {});
        }
      };
      picture.src = reader.result;
    };
    reader.readAsDataURL(file);
  }
  const year = new Date().getFullYear();
  return (
    <div className={s.page}>
      <AccountSidebar />
      <section className={s.panel}>
        <header className={s.heading}>
          <div>
            <h1>My Profile</h1>
            <p>
              Manage your profile information to keep your account up to date.
            </p>
          </div>
        </header>
        <form className={s.profileBody} noValidate onSubmit={save}>
          <div className={s.fields}>
            <div className={s.row}>
              <span className={s.fieldLabel}>Username</span>
              <span>{username}</span>
            </div>
            <div className={s.row}>
              <label className={s.fieldLabel} htmlFor="profile-name">
                Name
              </label>
              <div>
                <input
                  id="profile-name"
                  value={draft.name}
                  maxLength={80}
                  autoComplete="name"
                  onChange={(e) => change("name", e.target.value)}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={
                    errors.name ? "profile-name-error" : undefined
                  }
                />
                {errors.name && (
                  <p className={s.error} id="profile-name-error">
                    {errors.name}
                  </p>
                )}
              </div>
            </div>
            <div className={s.row}>
              <span className={s.fieldLabel}>Email</span>
              <div className={s.contact}>
                <span>{maskEmail(draft.email)}</span>
                <button
                  type="button"
                  aria-label="Change email"
                  onClick={() => editContact("email")}
                >
                  Change
                </button>
              </div>
            </div>
            <div className={s.row}>
              <span className={s.fieldLabel}>Phone Number</span>
              <div className={s.contact}>
                <span>********{draft.phone.slice(-2)}</span>
                <button
                  type="button"
                  aria-label="Change phone number"
                  onClick={() => editContact("phone")}
                >
                  Change
                </button>
              </div>
            </div>
            <div className={s.row}>
              <span className={s.fieldLabel} id="gender-label">
                Gender
              </span>
              <div
                className={s.radios}
                role="group"
                aria-labelledby="gender-label"
              >
                {[
                  ["male", "Male"],
                  ["female", "Female"],
                  ["other", "Other"],
                ].map(([value, label]) => (
                  <label key={value}>
                    <input
                      type="radio"
                      name="gender"
                      checked={draft.gender === value}
                      onChange={() => change("gender", value)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <div className={s.row}>
              <span className={s.fieldLabel} id="birthday-label">
                Date of Birth
              </span>
              <div>
                <div
                  className={s.birthday}
                  role="group"
                  aria-labelledby="birthday-label"
                >
                  <select
                    aria-label="Birth day"
                    value={draft.day}
                    onChange={(e) => change("day", e.target.value)}
                  >
                    <option value="">Day</option>
                    {Array.from({ length: 31 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="Birth month"
                    value={draft.month}
                    onChange={(e) => change("month", e.target.value)}
                  >
                    <option value="">Month</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(2000, i).toLocaleString("en", {
                          month: "short",
                        })}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="Birth year"
                    value={draft.year}
                    onChange={(e) => change("year", e.target.value)}
                  >
                    <option value="">Year</option>
                    {Array.from({ length: year - 1899 }, (_, i) => (
                      <option key={year - i} value={year - i}>
                        {year - i}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.birthday && (
                  <p className={s.error} role="alert">
                    {errors.birthday}
                  </p>
                )}
              </div>
            </div>
            <div className={s.row}>
              <span />
              <div>
                <button className={s.primary} type="submit">
                  Save
                </button>
                {message && (
                  <p className={s.feedback} role="status">
                    {message}
                  </p>
                )}
                {storageError && (
                  <p className={s.error} role="status">
                    Browser storage is unavailable. Changes are kept for this
                    visit only.
                  </p>
                )}
                <p className={s.hint}>
                  Profile changes are saved in this browser. Demo sign-in
                  credentials stay the same.
                </p>
              </div>
            </div>
          </div>
          <aside className={s.photo} aria-label="Profile picture">
            <div className={s.largeAvatar}>
              {draft.avatar ? (
                <img src={draft.avatar} alt="Profile preview" />
              ) : (
                <UserRound size={63} strokeWidth={1} />
              )}
            </div>
            <button
              className={s.secondary}
              type="button"
              onClick={() => fileRef.current.click()}
            >
              Select Image
            </button>
            <input
              className={s.srOnly}
              ref={fileRef}
              type="file"
              aria-label="Upload profile image"
              accept="image/jpeg,image/png"
              onChange={selectImage}
            />
            <p>
              File size: maximum 1 MB
              <br />
              File formats: JPEG, PNG
            </p>
            {draft.avatar && (
              <button
                className={s.textButton}
                type="button"
                onClick={() => {
                  version.current++;
                  change("avatar", "");
                }}
              >
                Remove Image
              </button>
            )}
            {errors.avatar && (
              <p className={s.error} role="alert">
                {errors.avatar}
              </p>
            )}
          </aside>
        </form>
      </section>
      {contact && (
        <CheckoutDialog
          title={contact === "email" ? "Change Email" : "Change Phone Number"}
          onClose={() => setContact(null)}
        >
          <form noValidate onSubmit={updateContact}>
            <div className={d.dialogBody}>
              <label className={s.modalLabel} htmlFor="contact-value">
                {contact === "email" ? "Email address" : "Phone number"}
              </label>
              <input
                className={s.modalInput}
                id="contact-value"
                type={contact === "email" ? "email" : "tel"}
                maxLength={120}
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                aria-invalid={Boolean(contactError)}
                aria-describedby={contactError ? "contact-error" : undefined}
              />
              {contactError && (
                <p className={s.error} id="contact-error" role="alert">
                  {contactError}
                </p>
              )}
              <p className={s.hint}>
                This updates your demo profile contact information only.
              </p>
            </div>
            <footer className={d.dialogFooter}>
              <button
                className={d.secondary}
                type="button"
                onClick={() => setContact(null)}
              >
                Cancel
              </button>
              <button className={d.primary} type="submit">
                Update
              </button>
            </footer>
          </form>
        </CheckoutDialog>
      )}
    </div>
  );
}
