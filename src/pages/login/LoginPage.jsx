import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { QrCode, Check } from "lucide-react";
import {
  PasswordField,
  SocialButtons,
  Terms,
} from "../../components/auth/AuthFields";
import f from "../../components/auth/AuthFields.module.css";
import s from "./LoginPage.module.css";
import { useAuth } from "../../components/auth/AuthProvider";
export default function LoginPage() {
  const location = useLocation();
  const { user, login } = useAuth();
  const [authError, setAuthError] = useState("");
  const [identity, setIdentity] = useState(location.state?.identity || "");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  function submit(e) {
    e.preventDefault();
    const next = {};
    if (!identity.trim())
      next.identity = "Enter your phone number, email or username.";
    else if (
      identity.includes("@") &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identity.trim())
    )
      next.identity = "Enter a valid email address.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    setMessage("");
    setAuthError("");
    if (!Object.keys(next).length) {
      if (!login(identity, password, remember)) {
        setAuthError("Incorrect phone number, email, username or password.");
        return;
      }
      setPassword("");
      setSuccess(true);
    }
  }
  if (success)
    return (
      <div>
        <span className={f.successIcon}>
          <Check size={25} />
        </span>
        <h1 className={f.heading}>You’re ready to explore.</h1>
        <p className={f.successText} role="status">
          Welcome, {user?.name}. You’re logged in with a demo account.
        </p>
        <Link className={f.submit} to="/">
          Continue shopping
        </Link>
        <button className={s.startOver} onClick={() => setSuccess(false)}>
          Back to Log In
        </button>
      </div>
    );
  return (
    <>
      <div className={s.title}>
        <h1 className={f.heading}>Log In</h1>
        <button
          type="button"
          aria-label="Log in with QR code"
          onClick={() =>
            setMessage(
              "QR code login is not connected in this simulator. Use the form to preview the login flow.",
            )
          }
        >
          <span>Log in with QR</span>
          <QrCode size={28} />
        </button>
      </div>
      {message && (
        <p className={f.message} role="status">
          {message}
        </p>
      )}
      <form noValidate onSubmit={submit}>
        {authError && (
          <p className={f.error} role="alert">
            {authError}
          </p>
        )}
        <div className={f.field}>
          <label htmlFor="identity">Phone number / Email / Username</label>
          <input
            id="identity"
            name="username"
            autoComplete="username"
            placeholder="Phone number / Email / Username"
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
            aria-invalid={Boolean(errors.identity)}
            aria-describedby={errors.identity ? "identity-error" : undefined}
          />
          {errors.identity && (
            <p className={f.error} id="identity-error">
              {errors.identity}
            </p>
          )}
        </div>
        <PasswordField
          id="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <div className={s.options}>
          <label className={f.checkbox}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Keep me logged in
          </label>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
        <button className={f.submit} type="submit">
          LOG IN
        </button>
        <p className={f.hint}>
          Demo login only. Your password is never saved or sent.
        </p>
      </form>
      <SocialButtons
        onSelect={(provider) =>
          setMessage(`${provider} login is not connected in this simulator.`)
        }
      />
      <Terms />
      <p className={f.switch}>
        New to Shopiz?<Link to="/register">Sign Up</Link>
      </p>
    </>
  );
}
