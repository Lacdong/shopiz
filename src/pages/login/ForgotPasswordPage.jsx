import React, { useState } from "react";
import { Link } from "react-router-dom";
import f from "../../components/auth/AuthFields.module.css";
import s from "./LoginPage.module.css";
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <>
      <h1 className={f.heading}>Reset Password</h1>
      <p className={f.intro}>Enter your email to preview password recovery.</p>
      {sent ? (
        <p className={f.message} role="status">
          Recovery preview complete. No email was sent because account services
          are not connected.
        </p>
      ) : (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
              setError("Enter a valid email address.");
              return;
            }
            setError("");
            setSent(true);
          }}
        >
          <div className={f.field}>
            <label htmlFor="recovery-email">Email address</label>
            <input
              id="recovery-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "recovery-error" : undefined}
            />
            {error && (
              <p className={f.error} id="recovery-error">
                {error}
              </p>
            )}
          </div>
          <button className={f.submit} type="submit">
            CONTINUE
          </button>
        </form>
      )}
      <Link className={s.back} to="/login">
        Back to Log In
      </Link>
    </>
  );
}
