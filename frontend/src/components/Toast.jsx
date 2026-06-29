import React, { createContext, useCallback, useContext } from "react";

// He thong toast notification toan ung dung
// Cach dung:
//   const { showToast } = useToast();
//   showToast("Da nop bai!", "success");
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const showToast = useCallback(() => {}, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
    </ToastContext.Provider>
  );
}

// Hook public — sai trong cac component
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback no-op khi chua co provider (vd test environment)
    return { showToast: () => {} };
  }
  return ctx;
}
