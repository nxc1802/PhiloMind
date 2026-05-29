import React from "react";
import Navbar from "./Navbar";
import StudyModulesSidebar from "./StudyModulesSidebar";
import DiscussionWidget from "./DiscussionWidget";

// Layout chuan dung cho moi trang trong he thong
// Lay HomePages lam mau: Navbar + Sidebar trai + Main bg-gray-50
// activeKey: muc dang chon trong sidebar
// footer: optional component hien o day sidebar
export default function PageShell({ activeKey, footer = null, children }) {
  return (
    <>
      <Navbar />
      <div className="flex">
        <StudyModulesSidebar activeKey={activeKey} footer={footer} />
        <main className="flex-1 lg:ml-72 min-h-screen bg-gray-50">
          {children}
        </main>
      </div>
      {/* Khu thảo luận nổi — xuất hiện trên mọi trang */}
      <DiscussionWidget />
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

// Nut Start Daily Lesson dung cho footer cua sidebar
export const StartDailyLessonButton = (
  <button
    type="button"
    className="w-full bg-red-800 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-red-900 transition-all flex items-center justify-center gap-2"
  >
    <span className="material-symbols-outlined">play_circle</span>
    Start Daily Lesson
  </button>
);
