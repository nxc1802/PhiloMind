import React from "react";
import Navbar from "./Navbar";
import StudyModulesSidebar from "./StudyModulesSidebar";
import FeedbackWidget from "./FeedbackWidget";
import { Link } from "react-router-dom";

// Nut Settings dung cho footer cua sidebar
export const SettingsButton = (
  <Link
    to="/settings"
    className="w-full border border-red-800/30 text-red-850 hover:bg-red-800 hover:text-white font-semibold py-3 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 bg-red-50/50"
  >
    <span className="material-symbols-outlined text-lg">settings</span>
    Cài đặt tài khoản
  </Link>
);

// Layout chuan dung cho moi trang trong he thong
// activeKey: muc dang chon trong sidebar
// footer: optional component hien o day sidebar (mac dinh la SettingsButton)
export default function PageShell({ activeKey, footer = SettingsButton, children }) {
  return (
    <>
      <Navbar />
      <div className="flex">
        <StudyModulesSidebar activeKey={activeKey} footer={footer} />
        <main className="flex-1 lg:ml-72 min-h-screen bg-gray-50">
          {children}
        </main>
      </div>
      {/* Bong bóng góp ý nổi — xuất hiện trên mọi trang */}
      <FeedbackWidget />
    </>
  );
}

// Hero do thong nhat — bg do, padding lon, text trang
// eyebrow: nhan nho phia tren tieu de (vd "Bai hoc")
// icon: ten material-symbols-outlined hien ben canh eyebrow
// title: H1 chinh
// subtitle: mo ta phu duoi tieu de
// children: noi dung phu (vd thanh tim kiem)
export function PageHero({ eyebrow, icon, title, subtitle, children }) {
  return (
    <section className="bg-red-800 py-12 px-12 text-white relative overflow-hidden">
      <div className="max-w-5xl mx-auto relative z-10">
        {(eyebrow || icon) && (
          <div className="flex items-center gap-3 mb-3">
            {icon && (
              <span className="material-symbols-outlined text-3xl">{icon}</span>
            )}
            {eyebrow && (
              <span className="text-sm uppercase tracking-wider opacity-80">
                {eyebrow}
              </span>
            )}
          </div>
        )}
        <h1 className="font-bold text-4xl md:text-5xl mb-4">{title}</h1>
        {subtitle && <p className="text-white/80 max-w-2xl mb-6">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
