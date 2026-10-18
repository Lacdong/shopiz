import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Facebook } from "lucide-react";
import s from "./AuthFields.module.css";
export function PasswordField({
  id,
  label = "Password",
  value,
  onChange,
  error,
  autoComplete = "current-password",
  ...props
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className={s.field}>
      <label htmlFor={id}>{label}</label>
      <div className={`${s.password} ${error ? s.invalid : ""}`}>
        <input
          {...props}
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <button
          type="button"
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          aria-pressed={visible}
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} className={s.error}>
          {error}
        </p>
      )}
    </div>
  );
}
export function SocialButtons({ onSelect }) {
  return (
    <>
      <div className={s.divider}>
        <span>OR</span>
      </div>
      <div className={s.social}>
        <button type="button" onClick={() => onSelect("Facebook")}>
          <Facebook size={18} />
          Facebook
        </button>
        <button type="button" onClick={() => onSelect("Google")}>
          <span className={s.google} aria-hidden="true">
            G
          </span>
          Google
        </button>
      </div>
    </>
  );
}
export function Terms() {
  return (
    <p className={s.terms}>
      By continuing, you agree to Shopiz’s{" "}
      <Link to="/info/terms-of-service">Terms of Service</Link> and{" "}
      <Link to="/info/privacy-policy">Privacy Policy</Link>.
    </p>
  );
}
