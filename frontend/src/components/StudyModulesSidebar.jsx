import React from "react";
import { Link } from "react-router-dom";
import { SIDEBAR_NAV_ITEMS } from "../constants";
import { useSidebar } from "../context/SidebarContext";

// Sidebar dùng chung cho các trang dùng layout Tailwind
// Hỗ trợ thu gọn thành icon-only mode (collapse)
export default function StudyModulesSidebar({ activeKey, footer = null }) {
  const { collapsed, toggle } = useSidebar();

  return (
    <aside
      className={`fixed left-0 top-16 bottom-0 z-40 bg-white dark:bg-[#161B22] border-r border-slate-100 dark:border-primary-900/20 overflow-y-auto hidden lg:flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-72"
      }`}
    >
      {/* Header — ẩn khi collapsed */}
      {!collapsed && (
        <div className="px-6 py-4 mb-2">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary-600 dark:text-primary-300">
              school
            </span>
            <h2 className="font-bold text-lg text-slate-900 dark:text-primary-100">
              Chương trình học
            </h2>
          </div>
          <p className="text-xs text-slate-400 dark:text-primary-400 uppercase tracking-wider font-semibold">
            Triết học Mác - Lênin
          </p>
        </div>
      )}

      {/* Spacer khi collapsed */}
      {collapsed && <div className="h-4" />}

      {/* Nav items */}
      <nav className="flex-1 space-y-1 px-2">
        {SIDEBAR_NAV_ITEMS.map((item) => {
          const isActive = item.key === activeKey;
          if (collapsed) {
            // Icon-only mode
            return (
              <Link
                key={item.key}
                to={item.to}
                title={item.label}
                className={`flex items-center justify-center h-10 w-10 mx-auto rounded-2xl transition-all ${
                  isActive
                    ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-sm border border-primary-100 dark:border-primary-800/30"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-primary-900/10 hover:text-primary-600 dark:hover:text-primary-300"
                }`}
              >
                <span className="material-symbols-outlined text-xl">
                  {item.icon}
                </span>
              </Link>
            );
          }
          // Full mode
          return (
            <Link
              key={item.key}
              to={item.to}
              className={`flex items-center gap-3 rounded-3xl px-4 py-3 mx-0 my-0.5 transition-all ${
                isActive
                  ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-semibold shadow-sm border border-primary-100 dark:border-primary-800/30"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-primary-900/10 hover:text-primary-700 dark:hover:text-primary-300"
              }`}
            >
              <span className="material-symbols-outlined shrink-0">
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && footer && (
        <div className="mt-auto px-4 pb-8">{footer}</div>
      )}

      {/* Collapse toggle button — luôn hiển thị ở cuối */}
      <div className={`py-3 border-t border-slate-100 dark:border-primary-900/20 ${collapsed ? "flex justify-center" : "px-4"}`}>
        <button
          type="button"
          onClick={toggle}
          title={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-slate-400 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-300 transition-all ${
            collapsed ? "justify-center w-10 h-10 mx-auto" : "w-full text-sm font-medium"
          }`}
        >
          <span className="material-symbols-outlined text-xl">
            {collapsed ? "chevron_right" : "chevron_left"}
          </span>
          {!collapsed && <span>Thu gọn</span>}
        </button>
      </div>
    </aside>
  );
}
