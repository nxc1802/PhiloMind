import React from "react";
import { Link } from "react-router-dom";
import { SIDEBAR_NAV_ITEMS } from "../constants";

// Sidebar dùng chung cho các trang dùng layout Tailwind (HomePages, Mindmap...)
// activeKey: key trong SIDEBAR_NAV_ITEMS để highlight mục đang ở
// footer: nội dung tuỳ chọn hiển thị ở đáy sidebar
export default function StudyModulesSidebar({ activeKey, footer = null }) {
  return (
    <aside className="fixed left-0 top-16 bottom-0 w-72 py-2 z-40 bg-white border-r border-gray-200 overflow-y-auto hidden lg:flex flex-col">
      <div className="px-6 py-4 mb-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-red-800">school</span>
          <h2 className="font-bold text-lg text-gray-900">Study Modules</h2>
        </div>
        <p className="text-xs text-gray-500 uppercase tracking-wider">
          Marxist-Leninist Philosophy
        </p>
      </div>

      <nav className="flex-1 space-y-1">
        {SIDEBAR_NAV_ITEMS.map((item) => {
          const isActive = item.key === activeKey;
          const className = isActive
            ? "flex items-center gap-3 bg-red-50 text-red-800 font-semibold rounded-lg px-4 py-3 mx-2 my-1"
            : "flex items-center gap-3 text-gray-700 hover:bg-gray-100 rounded-lg px-4 py-3 mx-2 my-1 transition-colors";
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
