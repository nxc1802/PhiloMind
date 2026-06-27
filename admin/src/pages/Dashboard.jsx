import React, { useState, useEffect } from 'react';
import AdminPageShell from '../components/AdminPageShell';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

export default function Dashboard() {
  const { showToast } = useToast();
  const [stats, setStats] = useState({
    chapters: 0,
    nodes: 0,
    flashcards: 0,
    users: 0,
    podcasts: 0,
    debates: 0,
    documents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [chList, nList, fList, uList, pList, dList, docList] = await Promise.all([
          api.chapters.list().catch(() => []),
          api.nodes.list().catch(() => []),
          api.flashcards.list().catch(() => []),
          api.users.list().catch(() => []),
          api.podcasts.list().catch(() => []),
          api.debates.list().catch(() => []),
          api.documents.list().catch(() => []),
        ]);

        setStats({
          chapters: chList.length,
          nodes: nList.length,
          flashcards: fList.length,
          users: uList.length,
          podcasts: pList.length,
          debates: dList.length,
          documents: docList.length,
        });
      } catch (err) {
        showToast('Không thể tải số liệu thống kê: ' + err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [showToast]);

  const cards = [
    { label: 'Chương lớn (Chương)', value: stats.chapters, icon: 'account_tree', color: 'from-purple-500 to-pink-600' },
    { label: 'Bài học cụ thể (Nodes)', value: stats.nodes, icon: 'auto_stories', color: 'from-amber-500 to-orange-600' },
    { label: 'Tài liệu giáo trình PDF', value: stats.documents, icon: 'picture_as_pdf', color: 'from-blue-500 to-indigo-600' },
    { label: 'Thẻ ôn tập (Flashcards)', value: stats.flashcards, icon: 'layers', color: 'from-emerald-500 to-teal-600' },
    { label: 'Học viên đăng ký', value: stats.users, icon: 'group', color: 'from-cyan-500 to-blue-600' },
    { label: 'Podcasts âm thanh', value: stats.podcasts, icon: 'podcasts', color: 'from-red-500 to-rose-600' },
    { label: 'Chủ đề tranh biện AI', value: stats.debates, icon: 'forum', color: 'from-violet-500 to-fuchsia-600' },
  ];

  return (
    <AdminPageShell activeKey="dashboard">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-red-500 text-3xl">shield</span>
            Tổng quan hệ thống
          </h1>
          <p className="text-slate-400 mt-1">Giám sát các chỉ số học tập triết học Mác - Lênin và quản lý học liệu thời gian thực.</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-red-500 text-5xl animate-spin">sync</span>
            <p className="text-slate-400 mt-4">Đang tải số liệu thống kê...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {cards.map((card, idx) => (
                <div key={idx} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex items-center justify-between shadow-xl hover:-translate-y-1 transition-all">
                  <div className="space-y-1 text-left">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{card.label}</p>
                    <p className="text-3xl font-black text-slate-100">{card.value}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg`}>
                    <span className="material-symbols-outlined">{card.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Course Information & AI status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Single Course Banner */}
              <div className="lg:col-span-2 bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6 text-left">
                <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-500">menu_book</span>
                  Hệ thống Triết học Mác – Lênin
                </h3>
                <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl space-y-4">
                  <p className="text-sm text-slate-350 leading-relaxed">
                    Hệ thống đang vận hành giáo trình chuẩn **"Triết học Mác – Lênin"** được chia nhỏ thành các Chương lớn, các Sub-chapters cấp 1, cấp 2 (Mục 1, 2, 3... và Mục a, b, c...) và kết thúc ở các bài học cụ thể (Nodes).
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-400 pt-2 border-t border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-purple-500 text-sm">bookmark</span>
                      <span>1 Giáo trình duy nhất</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-amber-500 text-sm">account_tree</span>
                      <span>Phân cấp Chương &rarr; Sub-chương &rarr; Bài học</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload parsing queue info */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6 text-left">
                <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-500">hourglass_empty</span>
                  Xử lý tài liệu AI
                </h3>
                <p className="text-sm text-slate-400">
                  Hệ thống phân tích sơ đồ bài học tự động dưới dạng luồng xử lý bất đồng bộ (Background worker). Học viên có thể tải lên tệp văn bản/PDF để tạo lập sơ đồ học tức thì.
                </p>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800/80 space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                    <span>DỊCH VỤ PHÂN TÍCH AI</span>
                    <span className="text-emerald-500">ONLINE</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 w-full animate-pulse"></div>
                  </div>
                  <p className="text-xs text-slate-500 text-center">OpenRouter LLM DeepSeek V4 sẵn sàng xử lý</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminPageShell>
  );
}
