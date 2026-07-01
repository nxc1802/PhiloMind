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
      <div
        className={`mb-2 min-h-[104px] px-3 py-4 ${
          collapsed ? "flex items-start justify-center" : "px-5"
        }`}
      >
        <div className="flex w-full items-start gap-3">
          {!collapsed && (
            <span className="material-symbols-outlined mt-0.5 shrink-0 text-primary-600 dark:text-primary-300">
              school
            </span>
          )}
          <div className="min-w-0 flex-1">
            {!collapsed && (
              <>
                <div className="flex min-w-0 items-start justify-between gap-2">
                  <h2 className="min-w-0 text-lg font-bold leading-tight text-slate-900 dark:text-primary-100">
                    Chương trình học
                  </h2>
                  <button
                    type="button"
                    onClick={toggle}
                    title="Thu gọn sidebar"
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-slate-400 transition-all hover:bg-primary-50 hover:text-primary-600 dark:text-primary-400 dark:hover:bg-primary-900/20 dark:hover:text-primary-300"
                  >
                    <span className="material-symbols-outlined text-xl">
                      chevron_left
                    </span>
                  </button>
                </div>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-primary-400">
                  Triết học Mác - Lênin
                </p>
              </>
            )}
            {collapsed && (
              <button
                type="button"
                onClick={toggle}
                title="Mở rộng sidebar"
                className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-400 transition-all hover:bg-primary-50 hover:text-primary-600 dark:text-primary-400 dark:hover:bg-primary-900/20 dark:hover:text-primary-300"
              >
                <span className="material-symbols-outlined text-xl">
                  chevron_right
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-1 px-2">
        {SIDEBAR_NAV_ITEMS.map((item) => {
          const isActive = item.key === activeKey;
          return (
            <Link
              key={item.key}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-3xl px-4 py-3 mx-0 my-0.5 transition-all ${
                isActive
                  ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-semibold shadow-sm border border-primary-100 dark:border-primary-800/30"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-primary-900/10 hover:text-primary-700 dark:hover:text-primary-300"
              } ${collapsed ? "justify-center px-0" : ""}`}
            >
              <span className="material-symbols-outlined shrink-0">
                {item.icon}
              </span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && footer && (
        <div className="mt-auto px-4 pb-8">{footer}</div>
      )}
    </aside>
  );
}
