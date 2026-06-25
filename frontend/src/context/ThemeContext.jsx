import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);
const THEME_STORAGE_KEY = "philomind_theme";

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem(THEME_STORAGE_KEY) || "system";
  });

  const setTheme = (newTheme) => {
    if (newTheme === "light" || newTheme === "dark" || newTheme === "system") {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      setThemeState(newTheme);
    }
  };

  useEffect(() => {
    const root = window.document.documentElement;
    const getSystemThemeQuery = () => {
      if (typeof window.matchMedia !== "function") {
        return null;
      }
      return window.matchMedia("(prefers-color-scheme: dark)");
    };
    
    const applyTheme = () => {
      let isDark = false;
      if (theme === "system") {
        isDark = Boolean(getSystemThemeQuery()?.matches);
      } else {
        isDark = theme === "dark";
      }

      if (isDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    applyTheme();

    // Listen for system theme changes if set to system
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

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
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
