import React from "react";
import Navbar from "./Navbar";
import StudyModulesSidebar from "./StudyModulesSidebar";
import FeedbackWidget from "./FeedbackWidget";
import { Link } from "react-router-dom";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";

// Nut Settings dung cho footer cua sidebar
export const SettingsButton = (
  <div className="flex flex-col gap-2 w-full">
    <a
      href="https://forms.gle/9AXVDRqzcAnTbdU39"
      target="_blank"
      rel="noopener noreferrer"
      className="w-full border border-primary-200 dark:border-primary-800/40 text-primary-700 dark:text-primary-300 hover:bg-primary-600 dark:hover:bg-primary-800 hover:text-white font-semibold py-3 rounded-3xl shadow-sm transition-all flex items-center justify-center gap-2 bg-primary-50 dark:bg-primary-900/10"
    >
      <span className="material-symbols-outlined text-lg">rate_review</span>
      Thực hiện khảo sát
    </a>
    <Link
      to="/settings"
      className="w-full border border-primary-200 dark:border-primary-800/40 text-primary-700 dark:text-primary-300 hover:bg-primary-600 dark:hover:bg-primary-800 hover:text-white font-semibold py-3 rounded-3xl shadow-sm transition-all flex items-center justify-center gap-2 bg-primary-50 dark:bg-primary-900/10"
    >
      <span className="material-symbols-outlined text-lg">settings</span>
      Cài đặt tài khoản
    </Link>
  </div>
);

// Inner layout — reads sidebar state from context
function PageShellInner({ activeKey, footer, children }) {
  const { collapsed } = useSidebar();
  return (
    <>
      <Navbar />
      <div className="flex">
        <StudyModulesSidebar activeKey={activeKey} footer={footer} />
        <main
          className={`flex-1 min-h-[calc(100vh-64px)] bg-white dark:bg-[#0D1117] transition-all duration-300 ${
            collapsed ? "lg:ml-12" : "lg:ml-72"
          }`}
        >
          {children}
        </main>
      </div>
      {/* Bong bóng góp ý nổi — xuất hiện trên mọi trang */}
      <FeedbackWidget />
    </>
  );
}

// Layout chuan dung cho moi trang trong he thong
export default function PageShell({
  activeKey,
  footer = SettingsButton,
  children,
}) {
  return (
    <SidebarProvider>
      <PageShellInner activeKey={activeKey} footer={footer}>
        {children}
      </PageShellInner>
    </SidebarProvider>
  );
}

// PageHero — Giao diện gradient tối cao cấp thống nhất như PhilosoFUN tab
export function PageHero({ eyebrow, icon, title, subtitle, children }) {
  return (
    <section className="bg-gradient-to-br from-primary-850 via-primary-750 to-primary-900 py-12 px-12 text-white text-left relative overflow-hidden rounded-b-[2.5rem] shadow-lg transition-all duration-300">
      {/* Subtle light reflection glow in top right */}
      <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-bl from-white/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {(eyebrow || icon) && (
          <div className="flex items-center gap-3 mb-3 text-white">
            {icon && (
              <span className="material-symbols-outlined text-3xl text-white/90">
                {icon}
              </span>
            )}
            {eyebrow && (
              <span className="text-sm uppercase tracking-wider text-white/80 font-bold">
                {eyebrow}
              </span>
            )}
          </div>
        )}
        <h1 className="font-bold text-4xl md:text-5xl mb-4 text-white leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-white/80 max-w-2xl mb-6 font-light leading-relaxed">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
