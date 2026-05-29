import React, { createContext, useContext, useCallback } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

// Quản lý đăng nhập/đăng ký phía FE (mock) — chưa có Backend
// LƯU Ý: đây chỉ là bản giả lập để dựng giao diện. Khi có BE thật,
// toàn bộ phần xác thực và lưu mật khẩu sẽ chuyển sang máy chủ (không lưu ở localStorage).
const AuthContext = createContext(null);

const USERS_KEY = "mln_auth_users";
const CURRENT_USER_KEY = "mln_auth_current";

export function AuthProvider({ children }) {
  const [users, setUsers] = useLocalStorage(USERS_KEY, []);
  const [currentUser, setCurrentUser] = useLocalStorage(CURRENT_USER_KEY, null);

  // Đăng ký: trả về { ok, error }. Không cho trùng email.
  const register = useCallback(
    ({ name, email, password }) => {
      const normalizedEmail = email.trim().toLowerCase();
      const exists = users.some((u) => u.email === normalizedEmail);
      if (exists) {
        return { ok: false, error: "Email này đã được đăng ký." };
      }
      const newUser = { name: name.trim(), email: normalizedEmail, password };
      setUsers([...users, newUser]);
      setCurrentUser({ name: newUser.name, email: newUser.email });
      return { ok: true };
    },
    [users, setUsers, setCurrentUser]
  );

  // Đăng nhập: kiểm tra email + mật khẩu trong danh sách đã đăng ký
  const login = useCallback(
    ({ email, password }) => {
      const normalizedEmail = email.trim().toLowerCase();
      const matched = users.find(
        (u) => u.email === normalizedEmail && u.password === password
      );
      if (!matched) {
        return { ok: false, error: "Email hoặc mật khẩu không đúng." };
      }
      setCurrentUser({ name: matched.name, email: matched.email });
      return { ok: true };
    },
    [users, setCurrentUser]
  );

  const logout = useCallback(() => setCurrentUser(null), [setCurrentUser]);

  return (
    <AuthContext.Provider value={{ user: currentUser, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Fallback an toàn nếu quên bọc AuthProvider
    return { user: null, register: () => {}, login: () => {}, logout: () => {} };
  }
  return ctx;
}
