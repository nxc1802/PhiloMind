import React from 'react';

export default function NodeWarmupTab({
  warmups,
  handleDeleteWarmup,
  handleAddWarmup,
  warmupForm,
  setWarmupForm,
}) {
  return (
    <div className="space-y-6">
      <h4 className="text-base font-semibold text-amber-500 flex items-center gap-2">
        <span className="material-symbols-outlined">explore</span> Khởi động ngẫu nhiên (Warmups)
      </h4>

      <div className="space-y-3 max-h-[20vh] overflow-y-auto pr-1 bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
        {warmups.length === 0 ? (
          <p className="text-xs text-slate-500 italic">Chưa có phần khởi động nào được cấu hình cho bài này.</p>
        ) : (
          <div className="space-y-2">
            {warmups.map((w, idx) => (
              <div key={w.id} className="flex justify-between items-start bg-slate-950 p-2.5 rounded-lg border border-slate-800/60 hover:border-amber-900/40 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-300">#{idx + 1}: {w.title}</span>
                    <span className="text-[10px] text-amber-400 bg-amber-950/60 border border-amber-900/40 px-1 rounded">
                      {w.type}
                    </span>
                  </div>
                  <p className="text-slate-400 line-clamp-1 italic">"{w.type === 'image-guess' ? `Đáp án: ${w.answer}` : w.question}"</p>
                </div>
                <button onClick={() => handleDeleteWarmup(w.id)} className="text-red-500 hover:text-red-400 p-1 rounded" title="Xóa Warmup">
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Warmup Form */}
      <form onSubmit={handleAddWarmup} className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-3">
        <h5 className="text-xs font-bold text-amber-550 uppercase tracking-wider flex items-center gap-1">
          <span className="material-symbols-outlined text-xs">add_circle</span> Thêm Warmup mới
        </h5>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Loại Khởi động</label>
            <select
              value={warmupForm.type}
              onChange={(e) => setWarmupForm({ ...warmupForm, type: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="image-guess">Nhìn hình đoán chữ (image-guess)</option>
              <option value="story">Đọc truyện chọn đáp án (story)</option>
              <option value="video">Video ngắn & câu hỏi (video)</option>
              <option value="game">Trò chơi tương tác (game)</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Tiêu đề</label>
            <input
              type="text"
              placeholder="Tùy chọn"
              value={warmupForm.title}
              onChange={(e) => setWarmupForm({ ...warmupForm, title: e.target.value })}
              className="w-full bg-slate-955 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
            />
          </div>
        </div>

        {warmupForm.type === 'image-guess' && (
          <div className="space-y-2 p-3 bg-indigo-950/20 border border-indigo-900/30 rounded-lg">
            <input
              type="url"
              required
              placeholder="Ảnh minh họa URL"
              value={warmupForm.image}
              onChange={(e) => setWarmupForm({ ...warmupForm, image: e.target.value })}
              className="w-full bg-slate-955 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Từ khóa (V _ T _ C H _ T)"
                value={warmupForm.blanks}
                onChange={(e) => setWarmupForm({ ...warmupForm, blanks: e.target.value })}
                className="bg-slate-955 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
              />
              <input
                type="text"
                required
                placeholder="Đáp án đúng"
                value={warmupForm.answer}
                onChange={(e) => setWarmupForm({ ...warmupForm, answer: e.target.value })}
                className="bg-slate-955 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
              />
            </div>
          </div>
        )}

        {(warmupForm.type === 'story' || warmupForm.type === 'video') && (
          <div className="space-y-2 p-3 bg-orange-950/10 border border-orange-900/30 rounded-lg text-xs space-y-2">
            {warmupForm.type === 'story' ? (
              <textarea
                rows="2"
                required
                placeholder="Viết câu chuyện ẩn dụ triết học..."
                value={warmupForm.story}
                onChange={(e) => setWarmupForm({ ...warmupForm, story: e.target.value })}
                className="w-full bg-slate-955 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 resize-none focus:outline-none"
              />
            ) : (
              <input
                type="text"
                required
                placeholder="YouTube Video URL khởi động"
                value={warmupForm.image || ''}
                onChange={(e) => setWarmupForm({ ...warmupForm, image: e.target.value })}
                className="w-full bg-slate-955 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
              />
            )}
            <input
              type="text"
              required
              placeholder="Câu hỏi chiêm nghiệm..."
              value={warmupForm.question || ''}
              onChange={(e) => setWarmupForm({ ...warmupForm, question: e.target.value })}
              className="w-full bg-slate-955 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                required
                placeholder="Lựa chọn (phân cách bằng dấu phẩy)"
                value={warmupForm.optionsString || ''}
                onChange={(e) => setWarmupForm({ ...warmupForm, optionsString: e.target.value })}
                className="col-span-2 bg-slate-955 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
              />
              <input
                type="number"
                min="0"
                max="3"
                required
                value={warmupForm.correctIndex || 0}
                onChange={(e) => setWarmupForm({ ...warmupForm, correctIndex: e.target.value })}
                className="bg-slate-955 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
                placeholder="ID Đáp án đúng"
              />
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Kiến giải khoa học (Reveal)</label>
          <textarea
            rows="2"
            required
            placeholder="Lời giải thích sâu sắc hiển thị khi click mở đáp án..."
            value={warmupForm.reveal}
            onChange={(e) => setWarmupForm({ ...warmupForm, reveal: e.target.value })}
            className="w-full bg-slate-955 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 placeholder:text-slate-700 resize-none focus:outline-none"
          />
        </div>

        <button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1">
          <span className="material-symbols-outlined text-sm">done</span> Thêm Warmup
        </button>
      </form>
    </div>
  );
}
