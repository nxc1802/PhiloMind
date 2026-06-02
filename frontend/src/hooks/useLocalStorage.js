import { useState, useEffect, useCallback } from "react";

// Hook luu state vao localStorage (key, default value)
// Tu dong dong bo giua cac tab thong qua su kien `storage`
export default function useLocalStorage(key, defaultValue) {
  const readValue = useCallback(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  }, [key, defaultValue]);

  const [value, setValue] = useState(readValue);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Bo qua loi (vd: QuotaExceeded khi storage day)
    }
  }, [key, value]);

  // Lang nghe thay doi tu tab khac
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === key) setValue(readValue());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [key, readValue]);

  return [value, setValue];
}
