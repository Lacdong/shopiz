import axios from "axios";

export const api = axios.create({
  baseURL: "/api/v2",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach auth token if available in storage
api.interceptors.request.use((config) => {
  try {
    const token =
      localStorage.getItem("shopiz-auth-token") ||
      sessionStorage.getItem("shopiz-auth-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Storage access may be restricted
  }
  return config;
});

// Unwrap standard Shopee Open API v2 envelopes
api.interceptors.response.use(
  (response) => {
    const data = response.data;
    if (data && typeof data === "object") {
      // Shopee error envelope convention: error != "" indicates business error
      if (data.error && data.error !== "") {
        const err = new Error(data.message || data.error);
        err.code = data.error;
        err.response = response;
        return Promise.reject(err);
      }
      // Return response payload if standard envelope
      if ("response" in data) {
        return data.response;
      }
    }
    return data;
  },
  (error) => {
    if (error.response && error.response.data) {
      const { error: errCode, message } = error.response.data;
      if (errCode || message) {
        error.message = message || errCode;
        error.code = errCode;
      }
    }
    return Promise.reject(error);
  },
);

export default api;
