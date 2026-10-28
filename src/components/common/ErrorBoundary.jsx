import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[Shopiz ErrorBoundary] Uncaught runtime error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "400px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 20px",
            textAlign: "center",
            background: "#fff",
            borderRadius: "8px",
            margin: "24px auto",
            maxWidth: "600px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          <AlertCircle size={44} color="#ee4d2d" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: 8, color: "#222" }}>
            Something went wrong displaying this section
          </h2>
          <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: 20, maxWidth: "440px" }}>
            {this.state.error?.message || "An unexpected error occurred while rendering this page."}
          </p>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 18px",
                background: "#ee4d2d",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              <RotateCcw size={14} /> Try again
            </button>
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "8px 18px",
                background: "#f5f5f5",
                color: "#333",
                textDecoration: "none",
                borderRadius: "4px",
                fontWeight: 500,
              }}
            >
              Back to Home
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
