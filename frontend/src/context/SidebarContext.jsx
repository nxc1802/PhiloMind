import React, { createContext, useContext, useState, useCallback } from "react";

const STORAGE_KEY = "philomind_sidebar_collapsed";

const SidebarContext = createContext({
  collapsed: false,
  toggle: () => {},
  setCollapsed: (_val) => {},
});

export function SidebarProvider({ children }) {
  const [collapsed, setCollapsedState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const setCollapsed = useCallback((val) => {
    setCollapsedState(val);
    try {
      localStorage.setItem(STORAGE_KEY, String(val));
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggle = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed, setCollapsed]);

  return (
    <SidebarContext.Provider value={{ collapsed, toggle, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
