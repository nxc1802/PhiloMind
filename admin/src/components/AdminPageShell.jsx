import React from 'react';
import { NavLink } from 'react-router-dom';

const SIDEBAR_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard', to: '/' },
  { key: 'users', label: 'Học viên', icon: 'group', to: '/users' },
  { key: 'courses', label: 'Tài liệu PDF', icon: 'picture_as_pdf', to: '/courses' },
  { key: 'nodes', label: 'Giáo trình & Bài học', icon: 'auto_stories', to: '/nodes' },
  { key: 'flashcards', label: 'Thẻ nhớ (Flashcards)', icon: 'layers', to: '/flashcards' },
  { key: 'quizzes', label: 'Bài tập & Quizzes', icon: 'quiz', to: '/quizzes' },
  { key: 'debates', label: 'Tranh luận AI', icon: 'forum', to: '/debates' },

  { key: 'philosofun', label: 'Philosofun', icon: 'smart_display', to: '/philosofun' },
];

export default function AdminPageShell({ activeKey, children }) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-800 bg-slate-950 flex justify-between items-center px-6 md:px-12 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-red-500 text-3xl">shield</span>
          <span className="text-xl font-bold tracking-wider text-slate-100">
            PhiloMind <span className="text-red-500 font-semibold text-sm bg-red-950/50 border border-red-900/50 px-2 py-0.5 rounded">ADMIN</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-400 font-medium">Kết nối Backend: Hoàn hảo</span>
          </div>
          <div className="h-9 w-9 bg-red-800 hover:bg-red-900 text-white rounded-full flex items-center justify-center font-bold shadow-md cursor-pointer transition-colors">
            AD
          </div>
        </div>
      </header>

      {/* Main container */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <aside className="w-72 bg-slate-950 border-r border-slate-800 hidden lg:flex flex-col p-4 fixed top-16 bottom-0 left-0">
          <div className="flex-1 space-y-1">
            {SIDEBAR_ITEMS.map((item) => {
              const isActive = activeKey === item.key;
              return (
                <NavLink
                  key={item.key}
                  to={item.to}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-red-900/40 text-red-400 font-semibold border-l-4 border-red-500 pl-3'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
          <div className="border-t border-slate-800 pt-4 text-center">
            <p className="text-xs text-slate-500">Dialectic Academy © 2026</p>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 lg:ml-72 bg-slate-900 p-6 md:p-12 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
