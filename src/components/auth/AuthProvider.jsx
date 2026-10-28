import React, { createContext, useContext, useEffect, useState } from "react";
import {
  authenticateMockUser,
  mockUsers,
  toPublicUser,
} from "../../data/mockData";
import authService, { getNumericBuyerId } from "../../services/authService";

const AuthContext = createContext(null);
const storageKey = "shopiz-demo-user";
const profileKey = "shopiz-user-profile";

function readUser() {
  try {
    const stored =
      localStorage.getItem(profileKey) || sessionStorage.getItem(profileKey);
    if (stored) return JSON.parse(stored);
    const id =
      localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey);
    if (!id) return null;
    const user = mockUsers.find((u) => u.id === id || String(u.id) === String(id));
    if (user) return toPublicUser(user);
    if (id === "1001" || id === "user-001") return toPublicUser(mockUsers[0]);
    if (id === "1002" || id === "user-002") return toPublicUser(mockUsers[1]);
    return null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);

  // Sync profile from backend on mount if user is logged in
  useEffect(() => {
    if (!user) return;
    const buyerId = getNumericBuyerId(user.id);
    authService
      .getProfile(buyerId)
      .then((profile) => {
        if (profile && profile.name) {
          setUser((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              name: profile.name,
              email: profile.email || prev.email,
              phone: profile.phone || prev.phone,
              avatar: profile.avatar_url || prev.avatar,
              role: profile.role || prev.role || "buyer",
              shopId: profile.shop_id || prev.shopId || null,
              shopName: profile.shop_name || prev.shopName || null,
            };
          });
        }
      })
      .catch(() => {
        // Backend offline or mock session
      });
  }, []);

  async function login(identity, password, remember) {
    // 1. Attempt live simulator backend login
    try {
      const data = await authService.login(identity, password);
      if (data && data.user) {
        const u = data.user;
        // Use user-001 / user-002 mapping for client tests while retaining backend buyer_id 1001
        const clientId = u.username === "demo" ? "user-001" : u.username === "alex" ? "user-002" : String(u.id);
        const loggedInUser = {
          id: clientId,
          backendId: u.id,
          username: u.username,
          name: u.name,
          email: u.email,
          phone: u.phone,
          avatar: u.avatar_url || "",
          role: u.role || "buyer",
          shopId: u.shop_id || null,
          shopName: u.shop_name || null,
        };

        try {
          localStorage.removeItem(storageKey);
          sessionStorage.removeItem(storageKey);
          localStorage.removeItem(profileKey);
          sessionStorage.removeItem(profileKey);

          const storage = remember ? localStorage : sessionStorage;
          storage.setItem(storageKey, clientId);
          storage.setItem(profileKey, JSON.stringify(loggedInUser));

          if (data.token) {
            storage.setItem("shopiz-auth-token", data.token);
          }

          if (u.role === "seller" && u.shop_id) {
            localStorage.setItem("shopiz-active-seller-shop-id", String(u.shop_id));
            if (u.shop_name) {
              localStorage.setItem("shopiz-active-seller-shop-name", u.shop_name);
            }
          }
        } catch {
          // In-memory fallback
        }
        setUser(loggedInUser);
        return loggedInUser;
      }
    } catch {
      // Backend unavailable or credential rejection
    }

    // 2. Fallback to mock accounts (for hermetic offline test runs)
    const account = authenticateMockUser(identity, password);
    if (!account) return null;
    const fallbackUser = {
      ...account,
      role: "buyer",
      shopId: null,
      shopName: null,
    };
    try {
      localStorage.removeItem(storageKey);
      sessionStorage.removeItem(storageKey);
      (remember ? localStorage : sessionStorage).setItem(storageKey, account.id);
      localStorage.setItem(profileKey, JSON.stringify(fallbackUser));
    } catch {
      /* Storage can be disabled; the demo session still works in memory. */
    }
    setUser(fallbackUser);
    return fallbackUser;
  }

  function logout() {
    try {
      localStorage.removeItem(storageKey);
      sessionStorage.removeItem(storageKey);
      localStorage.removeItem(profileKey);
      sessionStorage.removeItem(profileKey);
      localStorage.removeItem("shopiz-auth-token");
      sessionStorage.removeItem("shopiz-auth-token");
    } catch {
      /* No persistent storage available. */
    }
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, buyerId: getNumericBuyerId(user?.id) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
