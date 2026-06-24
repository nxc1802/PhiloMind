import React from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";

// Bố cục dùng chung cho trang Đăng nhập / Đăng ký
export default function AuthLayout({ icon, title, subtitle, children, footer }) {
  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary-850 via-primary-750 to-primary-900 flex items-center justify-center px-4 py-12 relative overflow-hidden transition-colors duration-300">
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -left-24 -bottom-24 w-96 h-96 bg-white/5 rounded-full" />

        <div className="relative w-full max-w-md bg-white dark:bg-[#002b37] rounded-3xl shadow-2xl p-8 border border-slate-100 dark:border-primary-850">
          <div className="text-center mb-6">
            <div className="inline-flex h-14 w-14 rounded-3xl bg-primary-50 dark:bg-primary-900/35 text-primary-650 dark:text-primary-300 items-center justify-center mb-3">
              <span className="material-symbols-outlined text-3xl">{icon}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-primary-100" style={{ fontFamily: '"Libre Caslon Text", serif' }}>{title}</h1>
            <p className="text-slate-550 dark:text-primary-300 text-sm mt-1">{subtitle}</p>
          </div>

          {children}

          <div className="mt-6 text-center text-sm text-slate-500 dark:text-primary-350">{footer}</div>

          <div className="mt-4 text-center">
            <Link to="/home" className="text-xs text-slate-400 hover:text-primary-600 dark:hover:text-primary-300">
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
    <label className="block mb-4 text-left">
      <span className="block text-sm font-semibold text-slate-700 dark:text-primary-250 mb-1.5">
        {label}
      </span>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-primary-350 text-xl">
          {icon}
        </span>
        <input
          {...inputProps}
          className="w-full border-2 border-slate-200 dark:border-primary-800 bg-white dark:bg-primary-900/10 rounded-3xl pl-11 pr-4 py-2.5 focus:border-primary-600 dark:focus:border-primary-400 outline-none text-slate-800 dark:text-slate-100 transition-colors"
        />
      </div>
    </label>
  );
}
