import React from "react";
import { Link } from "react-router-dom";
import { SIDEBAR_NAV_ITEMS } from "../constants";
import { useSidebar } from "../context/SidebarContext";

// Sidebar dùng chung cho các trang dùng layout Tailwind
// Hỗ trợ thu gọn thành icon-only mode (collapse)
export default function StudyModulesSidebar({ activeKey, footer = null }) {
  const { collapsed, toggle } = useSidebar();
  const footerLinks = [
    {
      href: "https://forms.gle/9AXVDRqzcAnTbdU39",
      icon: "rate_review",
      label: "Thực hiện khảo sát",
      external: true,
    },
    {
      to: "/settings",
      icon: "settings",
      label: "Cài đặt tài khoản",
    },
  ];

  return (
    <aside
      className={`fixed left-0 top-16 bottom-0 z-40 bg-white dark:bg-[#161B22] border-r border-slate-100 dark:border-primary-900/20 overflow-y-auto hidden lg:flex flex-col transition-all duration-300 ${
        collapsed ? "w-12" : "w-72"
      }`}
    >
      <div className={`mb-2 px-3 py-3 ${collapsed ? "flex justify-center" : "flex justify-end"}`}>
        {!collapsed && (
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
        )}
        {collapsed && (
          <button
            type="button"
            onClick={toggle}
            title="Mở rộng sidebar"
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-400 transition-all hover:bg-primary-50 hover:text-primary-600 dark:text-primary-400 dark:hover:bg-primary-900/20 dark:hover:text-primary-300"
          >
            <span className="material-symbols-outlined text-xl">
              chevron_right
            </span>
          </button>
        )}
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
      {collapsed && (
        <div className="mt-auto space-y-1 border-t border-slate-100 px-2 py-3 dark:border-primary-900/20">
          {footerLinks.map((item) =>
            item.external ? (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                title={item.label}
                className="flex h-11 w-full items-center justify-center rounded-3xl text-slate-500 transition-all hover:bg-primary-50 hover:text-primary-600 dark:text-slate-400 dark:hover:bg-primary-900/20 dark:hover:text-primary-300"
              >
                <span className="material-symbols-outlined text-xl">
                  {item.icon}
                </span>
              </a>
            ) : (
              <Link
                key={item.label}
                to={item.to}
                title={item.label}
                className="flex h-11 w-full items-center justify-center rounded-3xl text-slate-500 transition-all hover:bg-primary-50 hover:text-primary-600 dark:text-slate-400 dark:hover:bg-primary-900/20 dark:hover:text-primary-300"
              >
                <span className="material-symbols-outlined text-xl">
                  {item.icon}
                </span>
              </Link>
            ),
          )}
        </div>
      )}
    </aside>
  );
}
