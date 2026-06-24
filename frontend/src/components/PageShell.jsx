import React from "react";
import Navbar from "./Navbar";
import StudyModulesSidebar from "./StudyModulesSidebar";
import FeedbackWidget from "./FeedbackWidget";
import { Link } from "react-router-dom";

// Nut Settings dung cho footer cua sidebar
export const SettingsButton = (
  <div className="flex flex-col gap-2 w-full">
    <a
      href="https://forms.gle/9AXVDRqzcAnTbdU39"
      target="_blank"
      rel="noopener noreferrer"
      className="w-full border border-primary-800/30 dark:border-primary-750/30 text-primary-800 dark:text-primary-300 hover:bg-primary-600 dark:hover:bg-primary-750 hover:text-white font-semibold py-3 rounded-3xl shadow-sm transition-all flex items-center justify-center gap-2 bg-primary-50/50 dark:bg-primary-900/10"
    >
      <span className="material-symbols-outlined text-lg">rate_review</span>
      Thực hiện khảo sát
    </a>
    <Link
      to="/settings"
      className="w-full border border-primary-800/30 dark:border-primary-750/30 text-primary-800 dark:text-primary-300 hover:bg-primary-600 dark:hover:bg-primary-750 hover:text-white font-semibold py-3 rounded-3xl shadow-sm transition-all flex items-center justify-center gap-2 bg-primary-50/50 dark:bg-primary-900/10"
    >
      <span className="material-symbols-outlined text-lg">settings</span>
      Cài đặt tài khoản
    </Link>
  </div>
);

// Layout chuan dung cho moi trang trong he thong
export default function PageShell({ activeKey, footer = SettingsButton, children }) {
  return (
    <>
      <Navbar />
      <div className="flex">
        <StudyModulesSidebar activeKey={activeKey} footer={footer} />
        <main className="flex-1 lg:ml-72 min-h-screen bg-slate-50 dark:bg-[#001F28] transition-colors duration-300">
          {children}
        </main>
      </div>
      {/* Bong bóng góp ý nổi — xuất hiện trên mọi trang */}
      <FeedbackWidget />
    </>
  );
}

// Hero do thong nhat
export function PageHero({ eyebrow, icon, title, subtitle, children }) {
  return (
    <section className="bg-gradient-to-br from-primary-850 via-primary-750 to-primary-900 py-12 px-12 text-white relative overflow-hidden rounded-b-[2.5rem] shadow-lg transition-colors duration-300">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(76,214,255,0.1),transparent)] pointer-events-none" />
      <div className="max-w-5xl mx-auto relative z-10">
        {(eyebrow || icon) && (
          <div className="flex items-center gap-3 mb-3">
            {icon && (
              <span className="material-symbols-outlined text-3xl text-primary-200">{icon}</span>
            )}
            {eyebrow && (
              <span className="text-sm uppercase tracking-wider opacity-85 text-primary-100">
                {eyebrow}
              </span>
            )}
          </div>
        )}
        <h1 className="font-bold text-4xl md:text-5xl mb-4" style={{ fontFamily: '"Libre Caslon Text", serif' }}>{title}</h1>
        {subtitle && <p className="text-primary-100/90 max-w-2xl mb-6 font-light">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
