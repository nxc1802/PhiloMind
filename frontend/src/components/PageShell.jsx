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

// Layout chuan dung cho moi trang trong he thong
export default function PageShell({ activeKey, footer = SettingsButton, children }) {
  return (
    <>
      <Navbar />
      <div className="flex">
        <StudyModulesSidebar activeKey={activeKey} footer={footer} />
        <main className="flex-1 lg:ml-72 min-h-screen bg-white dark:bg-[#0D1117] transition-colors duration-300">
          {children}
        </main>
      </div>
      {/* Bong bóng góp ý nổi — xuất hiện trên mọi trang */}
      <FeedbackWidget />
    </>
  );
}

// PageHero — nền sáng, accent xanh tập trung ở icon/eyebrow/border
// Không còn gradient xanh đậm chiếm toàn màn hình
export function PageHero({ eyebrow, icon, title, subtitle, children }) {
  return (
    <section className="bg-white dark:bg-[#0D1117] border-b border-slate-100 dark:border-primary-900/30 py-10 px-12 relative overflow-hidden transition-colors duration-300">
      {/* Subtle blue decorative gradient — chỉ góc phải, rất nhạt */}
      <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-bl from-primary-50 via-transparent to-transparent dark:from-primary-950/30 dark:via-transparent pointer-events-none" />
      {/* Subtle left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-400 to-primary-700 rounded-r-full opacity-80" />

      <div className="max-w-5xl mx-auto relative z-10 pl-4">
        {(eyebrow || icon) && (
          <div className="flex items-center gap-3 mb-4">
            {icon && (
              <div className="h-10 w-10 rounded-2xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-xl text-primary-700 dark:text-primary-300">{icon}</span>
              </div>
            )}
            {eyebrow && (
              <span className="text-xs font-bold uppercase tracking-widest text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-full border border-primary-100 dark:border-primary-800/30">
                {eyebrow}
              </span>
            )}
          </div>
        )}
        <h1 className="font-bold text-3xl md:text-4xl mb-3 text-slate-900 dark:text-white" style={{ fontFamily: '"Libre Caslon Text", serif' }}>{title}</h1>
        {subtitle && <p className="text-slate-500 dark:text-slate-400 max-w-2xl font-light leading-relaxed">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
