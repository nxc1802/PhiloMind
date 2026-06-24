import React from "react";
import { Link } from "react-router-dom";
import { SIDEBAR_NAV_ITEMS } from "../constants";

// Sidebar dùng chung cho các trang dùng layout Tailwind (HomePages, Mindmap...)
export default function StudyModulesSidebar({ activeKey, footer = null }) {
  return (
    <aside className="fixed left-0 top-16 bottom-0 w-72 py-2 z-40 bg-white dark:bg-[#002b37] dark:bg-[#001F28] border-r border-slate-200 dark:border-primary-850 overflow-y-auto hidden lg:flex flex-col transition-colors duration-300">
      <div className="px-6 py-4 mb-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-primary-600 dark:text-primary-300">school</span>
          <h2 className="font-bold text-lg text-slate-900 dark:text-primary-100">Chương trình học</h2>
        </div>
        <p className="text-xs text-slate-400 dark:text-primary-400 uppercase tracking-wider font-semibold">
          Triết học Mác - Lênin
        </p>
      </div>

      <nav className="flex-1 space-y-1">
        {SIDEBAR_NAV_ITEMS.map((item) => {
          const isActive = item.key === activeKey;
          const className = isActive
            ? "flex items-center gap-3 bg-primary-50 dark:bg-primary-900/35 text-primary-850 dark:text-primary-200 font-semibold rounded-3xl px-4 py-3 mx-2 my-1 shadow-sm transition-all"
            : "flex items-center gap-3 text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-primary-900/10 rounded-3xl px-4 py-3 mx-2 my-1 transition-colors";
          return (
            <Link key={item.key} to={item.to} className={className}>
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {footer && <div className="mt-auto px-4 pb-8">{footer}</div>}
    </aside>
  );
}
