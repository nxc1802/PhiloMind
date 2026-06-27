import React from 'react';

export default function NodeQuizTab({
  nodeQuizzes,
  openCreateQuiz,
  openEditQuiz,
  handleQuizDelete,
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-base font-semibold text-emerald-500 flex items-center gap-2">
          <span className="material-symbols-outlined">quiz</span> Đề kiểm tra & Quiz bài tập ({nodeQuizzes.length})
        </h4>
        <button
          type="button"
          onClick={openCreateQuiz}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-xs">add</span> Tạo bộ Quiz
        </button>
      </div>

      {/* Quizzes List */}
      <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1 bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
        {nodeQuizzes.length === 0 ? (
          <p className="text-xs text-slate-500 italic text-center py-4">Chưa có bài tập hay game ghép cặp nào cho bài học này.</p>
        ) : (
          nodeQuizzes.map(q => (
            <div key={q.id} className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-850 hover:border-slate-800 transition-all text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-500 text-sm">
                    {q.type === 'matching' ? 'grid_view' : 'quiz'}
                  </span>
                  <span className="font-bold text-slate-205">{q.title}</span>
                </div>
                <p className="text-slate-400 mt-1 line-clamp-1 italic">{q.description || 'Không có mô tả'}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-slate-900 px-2 py-0.5 border border-slate-800 rounded font-mono text-slate-400 text-[10px]">
                  {Array.isArray(q.questions) ? `${q.questions.length} câu` : '0 câu'}
                </span>
                <button onClick={() => openEditQuiz(q)} className="p-1 hover:bg-slate-800 text-blue-400 rounded">
                  <span className="material-symbols-outlined text-base">edit</span>
                </button>
                <button onClick={() => handleQuizDelete(q.id)} className="p-1 hover:bg-slate-800 text-red-400 rounded">
                  <span className="material-symbols-outlined text-base">delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
