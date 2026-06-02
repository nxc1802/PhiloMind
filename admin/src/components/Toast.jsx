import React, { createContext, useCallback, useContext, useState } from "react";

// Hệ thống toast notification toàn ứng dụng Admin
const ToastContext = createContext(null);

const ICON_BY_VARIANT = {
  success: "check_circle",
  error: "error",
  info: "info",
  warning: "warning",
};

const STYLE_BY_VARIANT = {
  success: "bg-green-50 border-green-200 text-green-900",
  error: "bg-red-50 border-red-200 text-red-900",
  info: "bg-blue-50 border-blue-200 text-blue-900",
  warning: "bg-amber-50 border-amber-200 text-amber-900",
};

const ICON_COLOR_BY_VARIANT = {
  success: "text-green-600",
  error: "text-red-600",
  info: "text-blue-600",
  warning: "text-amber-600",
};

const DEFAULT_DURATION_MS = 3500;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, variant = "info", duration = DEFAULT_DURATION_MS) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => removeToast(id), duration);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast stack — góc phải dưới màn hình */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border-2 shadow-lg ${
              STYLE_BY_VARIANT[toast.variant]
            }`}
          >
            <span
              className={`material-symbols-outlined shrink-0 ${
                ICON_COLOR_BY_VARIANT[toast.variant]
              }`}
            >
              {ICON_BY_VARIANT[toast.variant]}
            </span>
            <p className="flex-1 text-sm font-medium leading-snug">
              {toast.message}
            </p>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Đóng thông báo"
              className="text-current opacity-50 hover:opacity-100"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return { showToast: () => {} };
  }
  return ctx;
}
