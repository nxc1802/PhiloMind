import React, { createContext, useContext, useCallback, useEffect, useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { api } from "../services/api";
import { supabase } from "../utils/supabaseClient";

const AuthContext = createContext(null);
const CURRENT_USER_KEY = "mln_auth_current";

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useLocalStorage(CURRENT_USER_KEY, null);
  const [authReady, setAuthReady] = useState(false);
  const isAuthenticated = Boolean(currentUser && localStorage.getItem("token"));

  // Sync Supabase session to NestJS backend
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[Supabase Auth Event] ${event}`);
      try {
        if (session) {
          const currentToken = localStorage.getItem("token");
          const provider = localStorage.getItem("auth_provider");
          
          // If we have a Supabase session but no backend token, or if we signed in via google
          if (!currentToken || provider === "google") {
            try {
              localStorage.setItem("auth_provider", "google");
              const res = await api.auth.supabaseLogin(session.access_token);
              localStorage.setItem("token", res.token);
              setCurrentUser(res.user);
            } catch (err) {
              console.error("Failed to sync session with NestJS backend:", err);
            }
          }
        } else {
          // If Supabase signed out, and the user was logged in via Google, clear the session
          const provider = localStorage.getItem("auth_provider");
          if (provider === "google") {
            localStorage.removeItem("token");
            localStorage.removeItem("auth_provider");
            setCurrentUser(null);
          }
        }
      } finally {
        setAuthReady(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setCurrentUser]);

  // Đăng ký: trả về { ok, error }
  const register = useCallback(
    async ({ name, email, password }) => {
      try {
        const res = await api.auth.register(email, name, password);
        localStorage.setItem("token", res.token);
        localStorage.setItem("auth_provider", "local");
        setCurrentUser(res.user);
        return { ok: true };
      } catch (err) {
        return { ok: false, error: err.message || "Đăng ký thất bại." };
      }
    },
    [setCurrentUser]
  );

  // Đăng nhập: gọi API và lưu vào localstorage
  const login = useCallback(
    async ({ email, password }) => {
      try {
        const res = await api.auth.login(email, password);
        localStorage.setItem("token", res.token);
        localStorage.setItem("auth_provider", "local");
        setCurrentUser(res.user);
        return { ok: true };
      } catch (err) {
        return { ok: false, error: err.message || "Đăng nhập thất bại." };
      }
    },
    [setCurrentUser]
  );

  // Đăng nhập bằng Google (kích hoạt OAuth của Supabase)
  const loginWithGoogle = useCallback(async () => {
    try {
      localStorage.setItem("auth_provider", "google");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message || "Đăng nhập bằng Google thất bại." };
    }
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("auth_provider");
    setCurrentUser(null);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Supabase signOut error:", err);
    }
  }, [setCurrentUser]);

  return (
    <AuthContext.Provider value={{ user: currentUser, authReady, isAuthenticated, register, login, logout, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return { 
      user: null, 
      authReady: true,
      isAuthenticated: false,
      register: async () => {}, 
      login: async () => {}, 
      logout: () => {}, 
      loginWithGoogle: async () => {} 
    };
  }
  return ctx;
}
