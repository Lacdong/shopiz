import React, { createContext, useContext, useState } from "react";
import {
  authenticateMockUser,
  mockUsers,
  toPublicUser,
} from "../../data/mockData";

const AuthContext = createContext(null);
const storageKey = "shopiz-demo-user";
function readUser() {
  try {
    const id =
      localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey);
    const user = mockUsers.find((user) => user.id === id);
    return user ? toPublicUser(user) : null;
  } catch {
    return null;
  }
}
export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);
  function login(identity, password, remember) {
    const account = authenticateMockUser(identity, password);
    if (!account) return null;
    try {
      localStorage.removeItem(storageKey);
      sessionStorage.removeItem(storageKey);
      (remember ? localStorage : sessionStorage).setItem(
        storageKey,
        account.id,
      );
    } catch {
      /* Storage can be disabled; the demo session still works in memory. */
    }
    setUser(account);
    return account;
  }
  function logout() {
    try {
      localStorage.removeItem(storageKey);
      sessionStorage.removeItem(storageKey);
    } catch {
      /* No persistent storage available. */
    }
    setUser(null);
  }
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  return useContext(AuthContext);
}
