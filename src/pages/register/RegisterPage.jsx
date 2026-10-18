import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import {
  PasswordField,
  SocialButtons,
  Terms,
} from "../../components/auth/AuthFields";
import f from "../../components/auth/AuthFields.module.css";
import s from "./RegisterPage.module.css";
export default function RegisterPage() {
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  function submit(e) {
    e.preventDefault();
    const next = {};
    if (step === 1) {
      if (!/^\+?\d{9,15}$/.test(phone.replace(/[\s().-]/g, "")))
        next.phone = "Enter a valid phone number (9–15 digits).";
      setErrors(next);
      if (!Object.keys(next).length) {
        setStep(2);
        setMessage("");
      }
      return;
    }
    if (!name.trim()) next.name = "Enter your name.";
    if (password.length < 8) next.password = "Use at least 8 characters.";
    if (confirm !== password || !confirm)
      next.confirm = "Passwords must match.";
    if (!agree)
      next.agree = "Please agree to the Terms of Service and Privacy Policy.";
    setErrors(next);
    if (!Object.keys(next).length) {
      setPassword("");
      setConfirm("");
      setStep(3);
    }
  }
  if (step === 3)
    return (
      <>
        <span className={f.successIcon}>
          <Check size={25} />
        </span>
        <h1 className={f.heading}>A good place to start.</h1>
        <p className={f.successText} role="status">
          Your registration preview is complete. No account was created and no
          verification SMS was sent.
        </p>
        <Link className={f.submit} to="/login" state={{ identity: phone }}>
          Continue to Log In
        </Link>
        <p className={f.switch}>
          <Link to="/">Explore Shopiz</Link>
        </p>
      </>
    );
  return (
    <>
      <div className={s.title}>
        <h1 className={f.heading}>Sign Up</h1>
        <span>Step {step} of 2</span>
      </div>
      {step === 2 && (
        <p className={s.phone}>
          {phone}
          <button
            type="button"
            onClick={() => {
              setStep(1);
              setErrors({});
            }}
          >
            Change
          </button>
        </p>
      )}
      {message && (
        <p className={f.message} role="status">
          {message}
        </p>
      )}
      <form noValidate onSubmit={submit}>
        {step === 1 ? (
          <div className={f.field}>
            <label htmlFor="phone">Phone number</label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "phone-error" : undefined}
            />
            {errors.phone && (
              <p className={f.error} id="phone-error">
                {errors.phone}
              </p>
            )}
          </div>
        ) : (
          <>
            <div className={f.field}>
              <label htmlFor="name">Your name</label>
              <input
                id="name"
                autoComplete="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && (
                <p className={f.error} id="name-error">
                  {errors.name}
                </p>
              )}
            </div>
            <PasswordField
              id="new-password"
              label="Password"
              placeholder="At least 8 characters"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />
            <PasswordField
              id="confirm-password"
              label="Confirm password"
              placeholder="Re-enter your password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              error={errors.confirm}
            />
            <label className={f.checkbox}>
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                aria-invalid={Boolean(errors.agree)}
                aria-describedby={errors.agree ? "agreement-error" : undefined}
              />
              I agree to Shopiz’s Terms of Service and Privacy Policy.
            </label>
            {errors.agree && (
              <p className={f.error} id="agreement-error">
                {errors.agree}
              </p>
            )}
          </>
        )}
        <button className={f.submit} type="submit">
          {step === 1 ? "NEXT" : "CREATE DEMO ACCOUNT"}
        </button>
        <p className={f.hint}>
          Preview only. Your details are never saved or sent.
        </p>
      </form>
      {step === 1 && (
        <SocialButtons
          onSelect={(provider) =>
            setMessage(
              `${provider} sign-up is not connected in this simulator.`,
            )
          }
        />
      )}
      <Terms />
      <p className={f.switch}>
        Already have an account?<Link to="/login">Log In</Link>
      </p>
    </>
  );
}
