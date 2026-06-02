import React from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";

// Bố cục dùng chung cho trang Đăng nhập / Đăng ký
// Giữ Navbar phía trên để thống nhất; phần thân là 1 thẻ trắng đặt giữa nền đỏ
export default function AuthLayout({ icon, title, subtitle, children, footer }) {
  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-red-800 via-red-900 to-red-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -left-24 -bottom-24 w-96 h-96 bg-white/5 rounded-full" />

        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <div className="inline-flex h-14 w-14 rounded-2xl bg-red-50 text-red-800 items-center justify-center mb-3">
              <span className="material-symbols-outlined text-3xl">{icon}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
          </div>

          {children}

          <div className="mt-6 text-center text-sm text-gray-500">{footer}</div>

          <div className="mt-4 text-center">
            <Link to="/home" className="text-xs text-gray-400 hover:text-red-800">
              ← Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

// Ô nhập dùng chung cho form xác thực
export function AuthField({ label, icon, ...inputProps }) {
  return (
    <label className="block mb-4">
      <span className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
      </span>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
          {icon}
        </span>
        <input
          {...inputProps}
          className="w-full border-2 border-gray-200 rounded-lg pl-11 pr-4 py-2.5 focus:border-red-800 outline-none transition-colors"
        />
      </div>
    </label>
  );
}
