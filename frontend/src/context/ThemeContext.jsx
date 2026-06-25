import React, { createContext, useContext, useEffect, useLayoutEffect, useState } from "react";

const ThemeContext = createContext(null);
const THEME_STORAGE_KEY = "philomind_theme";
const VALID_THEMES = ["light", "dark", "system"];

function getSystemThemeQuery() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return null;
  }
  return window.matchMedia("(prefers-color-scheme: dark)");
}

function getStoredTheme() {
  if (typeof window === "undefined") {
    return "system";
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return VALID_THEMES.includes(savedTheme) ? savedTheme : "system";
}

function resolveTheme(theme) {
  if (theme === "system") {
    return getSystemThemeQuery()?.matches ? "dark" : "light";
  }
  return theme === "dark" ? "dark" : "light";
}

function applyThemeToDocument(theme) {
  if (typeof document === "undefined") {
    return resolveTheme(theme);
  }

  const resolvedTheme = resolveTheme(theme);
  const root = document.documentElement;
  root.classList.toggle("dark", resolvedTheme === "dark");
  root.dataset.theme = resolvedTheme;
  root.style.colorScheme = resolvedTheme;
  return resolvedTheme;
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getStoredTheme);
  const [resolvedTheme, setResolvedTheme] = useState(() => resolveTheme(getStoredTheme()));

  const setTheme = (newTheme) => {
    if (VALID_THEMES.includes(newTheme)) {
      window.localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      setResolvedTheme(applyThemeToDocument(newTheme));
      setThemeState(newTheme);
    }
  };

  useLayoutEffect(() => {
    const applyTheme = () => setResolvedTheme(applyThemeToDocument(theme));

    applyTheme();
    if (theme === "system") {
      const mediaQuery = getSystemThemeQuery();
      const listener = () => applyTheme();

      if (!mediaQuery) {
        return undefined;
      }
      
      if (typeof mediaQuery.addEventListener === "function") {
        mediaQuery.addEventListener("change", listener);
      } else if (typeof mediaQuery.addListener === "function") {
        mediaQuery.addListener(listener);
      }

      return () => {
        if (typeof mediaQuery.removeEventListener === "function") {
          mediaQuery.removeEventListener("change", listener);
        } else if (typeof mediaQuery.removeListener === "function") {
          mediaQuery.removeListener(listener);
        }
      };
    }
  }, [theme]);

  useEffect(() => {
    const syncStoredTheme = (event) => {
      if (event.key !== THEME_STORAGE_KEY) {
        return;
      }

      const nextTheme = VALID_THEMES.includes(event.newValue) ? event.newValue : "system";
      setThemeState(nextTheme);
      setResolvedTheme(applyThemeToDocument(nextTheme));
    };

    window.addEventListener("storage", syncStoredTheme);
    return () => window.removeEventListener("storage", syncStoredTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
