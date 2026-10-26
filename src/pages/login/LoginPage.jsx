import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [authError, setAuthError] = useState("");
  const [identity, setIdentity] = useState(location.state?.identity || "");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit(e) {
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
      const loggedUser = await login(identity, password, remember);
      if (!loggedUser) {
        setAuthError("Incorrect phone number, email, username or password.");
        return;
      }
      setPassword("");

      const returnTo = location.state?.returnTo;

      // Role-based navigation:
      if (loggedUser.role === "seller") {
        const dest = returnTo && returnTo.startsWith("/seller") ? returnTo : "/seller";
        navigate(dest, { replace: true });
        return;
      }

      // If buyer attempted to access Seller Center, redirect to marketplace homepage
      if (returnTo === "/seller" || (returnTo && returnTo.startsWith("/seller"))) {
        navigate("/", { replace: true });
        return;
      }

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
        <Link className={f.submit} to={location.state?.returnTo || "/"}>
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
      {location.state?.notice === "seller_required" && (
        <div style={{
          background: "#fff5f0",
          border: "1px solid #ffd8cc",
          borderRadius: 8,
          padding: "10px 14px",
          marginBottom: 16,
          fontSize: 13,
          color: "#d03e20",
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          <span>Vui lòng đăng nhập với tài khoản Người bán để truy cập Kênh Người Bán (Seller Center).</span>
        </div>
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
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px dashed #eee", fontSize: 12, color: "#666" }}>
          <p style={{ fontWeight: 600, marginBottom: 8, color: "#444" }}>Tài khoản demo:</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button
              type="button"
              onClick={() => { setIdentity("demo"); setPassword("Shopiz@123"); }}
              style={{ padding: "5px 10px", background: "#f5f5f5", border: "1px solid #ddd", borderRadius: 4, cursor: "pointer", fontSize: 12 }}
            >
              👤 Người mua: <strong>demo</strong> / Shopiz@123
            </button>
            <button
              type="button"
              onClick={() => { setIdentity("seller"); setPassword("Shopiz@123"); }}
              style={{ padding: "5px 10px", background: "#fef0ed", border: "1px solid #f9ccbf", color: "#ee4d2d", borderRadius: 4, cursor: "pointer", fontSize: 12 }}
            >
              🏪 Người bán: <strong>seller</strong> / Shopiz@123
            </button>
          </div>
        </div>
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
