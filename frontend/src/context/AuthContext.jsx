import React, { createContext, useContext, useCallback } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { api } from "../services/api";

const AuthContext = createContext(null);
const CURRENT_USER_KEY = "mln_auth_current";

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useLocalStorage(CURRENT_USER_KEY, null);

  // Đăng ký: trả về { ok, error }
  const register = useCallback(
    async ({ name, email }) => {
      try {
        const user = await api.auth.register(email, name);
        setCurrentUser(user);
        return { ok: true };
      } catch (err) {
        return { ok: false, error: err.message || "Đăng ký thất bại." };
      }
    },
    [setCurrentUser]
  );

  // Đăng nhập: gọi API và lưu vào localstorage
  const login = useCallback(
    async ({ email }) => {
      try {
        const user = await api.auth.login(email);
        setCurrentUser(user);
        return { ok: true };
      } catch (err) {
        return { ok: false, error: err.message || "Đăng nhập thất bại." };
      }
    },
    [setCurrentUser]
  );

  // Đăng nhập bằng Google ID Token
  const loginWithGoogle = useCallback(
    async (idToken) => {
      try {
        const user = await api.auth.googleLogin(idToken);
        setCurrentUser(user);
        return { ok: true };
      } catch (err) {
        return { ok: false, error: err.message || "Đăng nhập bằng Google thất bại." };
      }
    },
    [setCurrentUser]
  );

  const logout = useCallback(() => setCurrentUser(null), [setCurrentUser]);

  return (
    <AuthContext.Provider value={{ user: currentUser, register, login, logout, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return { user: null, register: async () => {}, login: async () => {}, logout: () => {}, loginWithGoogle: async () => {} };
  }
  return ctx;
}
