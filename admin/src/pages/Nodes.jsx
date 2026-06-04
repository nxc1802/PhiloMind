import React, { useState, useEffect, useMemo, useCallback } from 'react';
import AdminPageShell from '../components/AdminPageShell';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

export default function Nodes() {
  const { showToast } = useToast();
  const [nodes, setNodes] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, type: 'create', node: null });
  const [warmups, setWarmups] = useState([]);
  const [activeRightTab, setActiveRightTab] = useState('warmups'); // 'warmups' | 'advanced'
  
  const [form, setForm] = useState({
    title: '',
    summary: '',
    originalText: '',
    quickTake: '',
    difficulty: 'Medium',
    timeToRead: '10 min read',
    videoUrl: '', // YouTube Video URL
    lessonType: '', // 'classic' | 'adventure'
    orderIndex: 1,
    chapterId: '',
    storyIntro: '',
    lessonContents: '',
    minigame: '',
    finalSummary: '',
  });

  const [warmupForm, setWarmupForm] = useState({
    type: 'image-guess',
    title: '',
    image: '',
    blanks: '',
    answer: '',
    story: '',
    question: '',
    optionsString: '',
    correctIndex: 0,
    reveal: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [nList, chList] = await Promise.all([
        api.nodes.list(),
        api.chapters.list(),
      ]);
      setNodes(nList);
      setChapters(chList);
    } catch (err) {
      showToast('Lỗi tải dữ liệu bài học: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreate = () => {
    setModal({ isOpen: true, type: 'create', node: null });
    setForm({
      title: '',
      summary: '',
      originalText: '',
      quickTake: '',
      difficulty: 'Medium',
      timeToRead: '10 min read',
      videoUrl: '',
      lessonType: '',
      orderIndex: nodes.length + 1,
      chapterId: chapters.length > 0 ? chapters[0].id : '',
      storyIntro: '',
      lessonContents: '',
      minigame: '',
      finalSummary: '',
    });
  };

  const openEdit = async (node) => {
    setModal({ isOpen: true, type: 'edit', node });
    setForm({
      title: node.title,
      summary: node.summary || '',
      originalText: node.originalText || '',
      quickTake: node.quickTake || '',
      difficulty: node.difficulty || 'Medium',
      timeToRead: node.timeToRead || '10 min read',
      videoUrl: node.videoUrl || '',
      lessonType: node.lessonType || '',
      orderIndex: node.orderIndex,
      chapterId: node.chapterId,
      storyIntro: node.storyIntro ? JSON.stringify(node.storyIntro, null, 2) : '',
      lessonContents: node.lessonContents ? JSON.stringify(node.lessonContents, null, 2) : '',
      minigame: node.minigame ? JSON.stringify(node.minigame, null, 2) : '',
      finalSummary: node.finalSummary ? JSON.stringify(node.finalSummary, null, 2) : '',
    });
    setWarmups([]);
    
    // Fetch warmups for this specific node
    try {
      const wList = await api.warmups.list(node.id);
      setWarmups(wList);
    } catch (err) {
      showToast('Không thể tải danh sách câu hỏi khởi động: ' + err.message, 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.lessonType) {
      showToast('Vui lòng chọn loại bài học (Lesson Type) bắt buộc!', 'error');
      return;
    }
    try {
      const parseJsonField = (fieldVal, fieldName) => {
        if (!fieldVal || !fieldVal.trim()) return null;
        try {
          return JSON.parse(fieldVal);
        } catch (err) {
          throw new Error(`Trường ${fieldName} có định dạng JSON không hợp lệ: ${err.message}`);
        }
      };

      const storyIntroJson = parseJsonField(form.storyIntro, 'Dẫn truyện (Story Intro)');
      const lessonContentsJson = parseJsonField(form.lessonContents, 'Nội dung bài học (Lesson Contents)');
      const minigameJson = parseJsonField(form.minigame, 'Trò chơi (Minigame)');
      const finalSummaryJson = parseJsonField(form.finalSummary, 'Đúc kết cuối bài (Final Summary)');

      const payload = {
        ...form,
        orderIndex: Number(form.orderIndex),
        storyIntro: storyIntroJson,
        lessonContents: lessonContentsJson,
        minigame: minigameJson,
        finalSummary: finalSummaryJson,
      };

      if (modal.type === 'create') {
        await api.nodes.create(payload);
        showToast('Tạo bài học thành công!', 'success');
      } else {
        await api.nodes.update(modal.node.id, payload);
        showToast('Cập nhật bài học thành công!', 'success');
      }
      setModal({ isOpen: false, type: 'create', node: null });
      loadData();
    } catch (err) {
      showToast('Thao tác thất bại: ' + err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài học này? Việc này sẽ xóa toàn bộ flashcards, podcasts, các phần khởi động (Warmups), tiến trình học tập và lịch sử tranh luận liên kết.')) return;
    try {
      await api.nodes.delete(id);
      showToast('Xóa bài học thành công!', 'success');
      loadData();
    } catch (err) {
      showToast('Xóa bài học thất bại: ' + err.message, 'error');
    }
  };

  const handleAddWarmup = async (e) => {
    e.preventDefault();
    if (!modal.node) return;
    try {
      const options = warmupForm.optionsString
        ? warmupForm.optionsString.split(',').map((o) => o.trim()).filter(Boolean)
        : [];
      
      const payload = {
        type: warmupForm.type,
        title: warmupForm.title || (
          warmupForm.type === 'image-guess' ? 'Nhìn hình đoán thuật ngữ' :
          warmupForm.type === 'video' ? 'Video khởi động triết học' : 'Chiêm nghiệm câu chuyện triết học'
        ),
        image: (warmupForm.type === 'image-guess' || warmupForm.type === 'video') ? warmupForm.image : undefined,
        blanks: warmupForm.type === 'image-guess' ? warmupForm.blanks : undefined,
        answer: warmupForm.type === 'image-guess' ? warmupForm.answer : undefined,
        story: warmupForm.type === 'story' ? warmupForm.story : undefined,
        question: (warmupForm.type === 'story' || warmupForm.type === 'video') ? warmupForm.question : undefined,
        options: (warmupForm.type === 'story' || warmupForm.type === 'video') ? options : undefined,
        correctIndex: (warmupForm.type === 'story' || warmupForm.type === 'video') ? Number(warmupForm.correctIndex) : undefined,
        reveal: warmupForm.reveal,
      };

      await api.warmups.create(modal.node.id, payload);
      showToast('Thêm câu hỏi khởi động thành công!', 'success');
      
      setWarmupForm({
        type: 'image-guess',
        title: '',
        image: '',
        blanks: '',
        answer: '',
        story: '',
        question: '',
        optionsString: '',
        correctIndex: 0,
        reveal: '',
      });

      // Reload warmups
      const wList = await api.warmups.list(modal.node.id);
      setWarmups(wList);
    } catch (err) {
      showToast('Thêm khởi động thất bại: ' + err.message, 'error');
    }
  };

  const handleDeleteWarmup = async (warmupId) => {
    if (!window.confirm('Bạn có chắc muốn xóa câu hỏi khởi động này?')) return;
    try {
      await api.warmups.delete(warmupId);
      showToast('Xóa khởi động thành công!', 'success');
      const wList = await api.warmups.list(modal.node.id);
      setWarmups(wList);
    } catch (err) {
      showToast('Xóa khởi động thất bại: ' + err.message, 'error');
    }
  };

  return (
    <AdminPageShell activeKey="nodes">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Quản lý Bài học (Nodes)</h1>
            <p className="text-slate-400 mt-1">Quản lý các điểm nút kiến thức, tóm tắt lý thuyết, video YouTube và phần làm nóng khởi động.</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-red-800 hover:bg-red-900 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg transition-colors">
            <span className="material-symbols-outlined text-sm">add</span> Thêm Bài học
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-red-500 text-5xl animate-spin">sync</span>
            <p className="text-slate-400 mt-4">Đang tải danh sách bài học...</p>
          </div>
        ) : (
          <HierarchyTreeView 
            chapters={chapters} 
            nodes={nodes} 
            openEdit={openEdit} 
            handleDelete={handleDelete} 
          />
        )}

        {/* Create/Edit Modal */}
        {modal.isOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className={`bg-slate-950 rounded-2xl border border-slate-800 w-full ${modal.type === 'edit' ? 'max-w-6xl' : 'max-w-lg'} shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all`}>
              <div className="flex justify-between items-center p-6 border-b border-slate-800">
                <h3 className="text-xl font-bold text-slate-100">
                  {modal.type === 'create' ? 'Tạo Bài học mới' : `Chỉnh sửa Bài học: ${modal.node?.title}`}
                </h3>
                <button onClick={() => setModal({ isOpen: false, type: 'create', node: null })} className="text-slate-500 hover:text-slate-300">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className={`grid ${modal.type === 'edit' ? 'lg:grid-cols-2 gap-8' : 'grid-cols-1'}`}>
                  
                  {/* Left Column - Node Form */}
                  <form onSubmit={handleSubmit} className="space-y-4 pr-2">
                    <h4 className="text-lg font-semibold text-red-400 flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined">menu_book</span> Thông tin lý thuyết bài học
                    </h4>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tiêu đề bài học</label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: Phạm trù vật chất"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-red-500 transition-colors"
                      />
                    </div>

                    {modal.type === 'create' && (
                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Thuộc Chương học</label>
                        <select
                          value={form.chapterId}
                          onChange={(e) => setForm({ ...form, chapterId: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-red-500 transition-colors"
                        >
                          {chapters.map((ch) => (
                            <option key={ch.id} value={ch.id}>{ch.title}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">YouTube Video URL</label>
                      <input
                        type="url"
                        placeholder="Ví dụ: https://www.youtube.com/watch?v=Mzg-AdRrjGY"
                        value={form.videoUrl}
                        onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-red-500 transition-colors"
                      />
                      <p className="text-[11px] text-slate-500">Nhập đường dẫn YouTube để người học nhúng trực tiếp trong bài luận.</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Loại bài học <span className="text-red-500">*</span></label>
                      <select
                        required
                        value={form.lessonType}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm({ ...form, lessonType: val });
                          if (val === 'classic' && activeRightTab === 'framework') {
                            setActiveRightTab('warmups');
                          }
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-red-500 transition-colors"
                      >
                        <option value="">-- Chọn chế độ bài học --</option>
                        <option value="classic">📖 Cổ điển (Video → Câu hỏi → Giáo trình)</option>
                        <option value="adventure">🗺️ Phiêu lưu (Tương tác RPG đa giai đoạn)</option>
                      </select>
                      <p className="text-[11px] text-slate-500">Lưu ý: Không được bỏ trống. Phải chọn chế độ hiển thị phù hợp.</p>
                    </div>

                    {form.lessonType !== 'adventure' && (
                      <>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tóm tắt bài học (Summary)</label>
                          <textarea
                            rows="3"
                            required={form.lessonType === 'classic'}
                            placeholder="Tóm tắt lý thuyết bài học (tối đa 5 dòng)..."
                            value={form.summary}
                            onChange={(e) => setForm({ ...form, summary: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-red-500 transition-colors resize-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ý chính nhanh (Quick Take)</label>
                          <input
                            type="text"
                            required={form.lessonType === 'classic'}
                            placeholder="Ý chính rút gọn cô đọng nhất..."
                            value={form.quickTake}
                            onChange={(e) => setForm({ ...form, quickTake: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-red-500 transition-colors"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Trích dẫn giáo trình gốc (Original Text)</label>
                          <textarea
                            rows="4"
                            required={form.lessonType === 'classic'}
                            placeholder="Trích dẫn chính văn giáo trình học thuật..."
                            value={form.originalText}
                            onChange={(e) => setForm({ ...form, originalText: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-red-500 transition-colors resize-none"
                          />
                        </div>
                      </>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Độ khó</label>
                        <select
                          value={form.difficulty}
                          onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-red-500 transition-colors"
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Thời lượng đọc</label>
                        <input
                          type="text"
                          required
                          placeholder="Ví dụ: 10 min read"
                          value={form.timeToRead}
                          onChange={(e) => setForm({ ...form, timeToRead: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-red-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Thứ tự hiển thị (Order Index)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={form.orderIndex}
                        onChange={(e) => setForm({ ...form, orderIndex: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-red-500 transition-colors"
                      />
                    </div>

                    <button type="submit" className="w-full bg-red-800 hover:bg-red-900 text-white font-bold py-3 rounded-xl transition-colors shadow-lg mt-4 flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-sm">save</span>
                      {modal.type === 'create' ? 'Tạo Bài học' : 'Lưu lý thuyết bài học'}
                    </button>
                  </form>

                  {/* Right Column - Warmups & Advanced Panel (Only when editing) */}
                  {modal.type === 'edit' && (
                    <div className="border-l border-slate-800 pl-0 lg:pl-8 space-y-6">
                      {/* Tabs Headers */}
                      <div className="flex gap-2 border-b border-slate-800 pb-3 mb-4 overflow-x-auto">
                        <button
                          type="button"
                          onClick={() => setActiveRightTab('warmups')}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                            activeRightTab === 'warmups' ? 'bg-amber-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          🔥 Làm nóng (Warmups)
                        </button>
                        {form.lessonType === 'adventure' && (
                          <button
                            type="button"
                            onClick={() => setActiveRightTab('framework')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                              activeRightTab === 'framework' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            ⚡ Khung đồng bộ (Framework)
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setActiveRightTab('advanced')}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                            activeRightTab === 'advanced' ? 'bg-red-800 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          📦 Nâng cao (PDF & Bulk Flashcard)
                        </button>
                      </div>

                      {activeRightTab === 'warmups' ? (
                        <div className="space-y-6">
                          <h4 className="text-base font-semibold text-amber-500 flex items-center gap-2">
                            <span className="material-symbols-outlined">explore</span> Quản lý Warm-up (Khởi động ngẫu nhiên)
                          </h4>

                          {/* Warmup List */}
                          <div className="space-y-3 max-h-[22vh] overflow-y-auto pr-2 bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
                            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Danh sách Warm-ups hiện có</h5>
                            {warmups.length === 0 ? (
                              <p className="text-xs text-slate-500 italic">Chưa có phần khởi động nào được cấu hình cho bài này. Khi mở bài học, hệ thống sẽ tự dùng mẫu mặc định.</p>
                            ) : (
                              <div className="space-y-2">
                                {warmups.map((w, index) => (
                                  <div key={w.id} className="flex justify-between items-start bg-slate-950 p-3 rounded-lg border border-slate-800/60 hover:border-amber-900/50 transition-all text-xs">
                                    <div className="space-y-1 pr-4">
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-300">#{index + 1}: {w.title}</span>
                                        <span className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold ${
                                           w.type === 'image-guess' ? 'bg-indigo-950/60 text-indigo-400 border border-indigo-900/40' :
                                           w.type === 'video' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/40' :
                                           w.type === 'game' ? 'bg-red-950/60 text-red-400 border border-red-900/40' :
                                           'bg-orange-950/60 text-orange-400 border border-orange-900/40'
                                         }`}>
                                           {w.type === 'image-guess' ? 'Đoán thuật ngữ' : w.type === 'video' ? 'Video khởi động' : w.type === 'game' ? 'Trò chơi' : 'Câu chuyện'}
                                         </span>
                                      </div>
                                      <p className="text-slate-400 line-clamp-2 italic">"{w.type === 'image-guess' ? `Đáp án: ${w.answer}` : w.type === 'game' ? w.reveal : w.question}"</p>
                                    </div>
                                    <button onClick={() => handleDeleteWarmup(w.id)} className="text-red-500 hover:text-red-400 p-1 hover:bg-slate-900 rounded transition-colors" title="Xóa Warmup">
                                      <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Add Warmup Form */}
                          <form onSubmit={handleAddWarmup} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
                            <h5 className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-xs">add_circle</span> Thêm câu hỏi khởi động mới
                            </h5>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Loại Khởi động</label>
                                <select
                                  value={warmupForm.type}
                                  onChange={(e) => setWarmupForm({ ...warmupForm, type: e.target.value })}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                                >
                                  <option value="image-guess">Nhìn hình đoán chữ (image-guess)</option>
                                  <option value="story">Đọc truyện chọn đáp án (story)</option>
                                  <option value="video">Video ngắn & câu hỏi (video)</option>
                                  <option value="game">Trò chơi tương tác (game)</option>
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Tiêu đề (Tùy chọn)</label>
                                <input
                                  type="text"
                                  placeholder="Mặc định loại hình"
                                  value={warmupForm.title}
                                  onChange={(e) => setWarmupForm({ ...warmupForm, title: e.target.value })}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                                />
                              </div>
                            </div>

                            {/* Image Guess Fields */}
                            {warmupForm.type === 'image-guess' && (
                              <div className="space-y-3 p-3 bg-indigo-950/20 border border-indigo-900/20 rounded-lg">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-indigo-400 uppercase">Ảnh minh họa (URL)</label>
                                  <input
                                    type="url"
                                    required
                                    placeholder="https://..."
                                    value={warmupForm.image}
                                    onChange={(e) => setWarmupForm({ ...warmupForm, image: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-indigo-400 uppercase">Từ khóa trống (Blanks)</label>
                                    <input
                                      type="text"
                                      required
                                      placeholder="Ví dụ: V _ T _ C H _ T"
                                      value={warmupForm.blanks}
                                      onChange={(e) => setWarmupForm({ ...warmupForm, blanks: e.target.value })}
                                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-indigo-400 uppercase">Đáp án đúng</label>
                                    <input
                                      type="text"
                                      required
                                      placeholder="Ví dụ: VẬT CHẤT"
                                      value={warmupForm.answer}
                                      onChange={(e) => setWarmupForm({ ...warmupForm, answer: e.target.value })}
                                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Story Fields */}
                            {warmupForm.type === 'story' && (
                              <div className="space-y-3 p-3 bg-orange-950/20 border border-orange-900/20 rounded-lg">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-orange-400 uppercase">Nội dung câu chuyện</label>
                                  <textarea
                                    rows="3"
                                    required
                                    placeholder="Viết câu chuyện ẩn dụ triết học đầy chiều sâu..."
                                    value={warmupForm.story}
                                    onChange={(e) => setWarmupForm({ ...warmupForm, story: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none resize-none"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-orange-400 uppercase">Câu hỏi chiêm nghiệm</label>
                                  <input
                                    type="text"
                                    required
                                    placeholder="Ví dụ: Quan điểm của câu chuyện này là gì?"
                                    value={warmupForm.question}
                                    onChange={(e) => setWarmupForm({ ...warmupForm, question: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                                  />
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="col-span-2 space-y-1">
                                    <label className="text-[10px] font-bold text-orange-400 uppercase">Mảng Lựa chọn (phân cách bằng dấu phẩy)</label>
                                    <input
                                      type="text"
                                      required
                                      placeholder="Ví dụ: Duy vật, Duy tâm, Nhị nguyên"
                                      value={warmupForm.optionsString}
                                      onChange={(e) => setWarmupForm({ ...warmupForm, optionsString: e.target.value })}
                                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-orange-400 uppercase">ID Đáp án (0-3)</label>
                                    <input
                                      type="number"
                                      min="0"
                                      max="3"
                                      required
                                      value={warmupForm.correctIndex}
                                      onChange={(e) => setWarmupForm({ ...warmupForm, correctIndex: e.target.value })}
                                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {warmupForm.type === 'video' && (
                              <div className="space-y-3 p-3 bg-emerald-950/20 border border-emerald-900/20 rounded-lg">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-emerald-400 uppercase">YouTube Video URL</label>
                                  <input
                                    type="text"
                                    required
                                    placeholder="Ví dụ: https://www.youtube.com/watch?v=..."
                                    value={warmupForm.image || ""}
                                    onChange={(e) => setWarmupForm({ ...warmupForm, image: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-emerald-400 uppercase">Câu hỏi chiêm nghiệm</label>
                                  <input
                                    type="text"
                                    required
                                    placeholder="Ví dụ: Hai nguồn gốc của triết học được nhắc tới trong video là gì?"
                                    value={warmupForm.question || ""}
                                    onChange={(e) => setWarmupForm({ ...warmupForm, question: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                                  />
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="col-span-2 space-y-1">
                                    <label className="text-[10px] font-bold text-emerald-400 uppercase">Mảng Lựa chọn (phân cách bằng dấu phẩy)</label>
                                    <input
                                      type="text"
                                      required
                                      placeholder="Ví dụ: Nhận thức & Xã hội, Kinh tế & Chính trị"
                                      value={warmupForm.optionsString || ""}
                                      onChange={(e) => setWarmupForm({ ...warmupForm, optionsString: e.target.value })}
                                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-emerald-400 uppercase">ID Đáp án (0-3)</label>
                                    <input
                                      type="number"
                                      min="0"
                                      max="3"
                                      required
                                      value={warmupForm.correctIndex || 0}
                                      onChange={(e) => setWarmupForm({ ...warmupForm, correctIndex: e.target.value })}
                                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Lời tiết lộ / Kiến giải khoa học (Reveal)</label>
                              <textarea
                                rows="2"
                                required
                                placeholder="Lời giải thích sâu sắc chỉ ra bản chất vấn đề khi người học click mở đáp án..."
                                value={warmupForm.reveal}
                                onChange={(e) => setWarmupForm({ ...warmupForm, reveal: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none resize-none"
                              />
                            </div>

                            <button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1">
                              <span className="material-symbols-outlined text-sm">done</span> Thêm Warmup cho bài này
                            </button>
                          </form>
                        </div>
                      ) : activeRightTab === 'framework' ? (
                        <FrameworkAdminPanel 
                          form={form} 
                          setForm={setForm} 
                        />
                      ) : (
                        <AdvancedAdminPanel 
                          nodeId={modal.node.id} 
                          courseId={form.chapterId} 
                          showToast={showToast} 
                        />
                      )}
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminPageShell>
  );
}

// ==================== NEW ADVANCED ADMIN PANEL (PDF & BULK FLASHCARDS) ====================
function AdvancedAdminPanel({ nodeId, courseId, showToast }) {
  const [jsonText, setJsonText] = useState("");
  const [importingFlashcards, setImportingFlashcards] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [uploadedDocUrl, setUploadedDocUrl] = useState("");

  const handleJsonUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setJsonText(event.target.result);
    };
    reader.readAsText(file);
  };

  const handleBulkImport = async () => {
    if (!jsonText.trim()) return;
    setImportingFlashcards(true);
    try {
      const parsed = JSON.parse(jsonText.trim());
      const cards = Array.isArray(parsed) ? parsed : (parsed.flashcards || []);
      if (cards.length === 0) {
        throw new Error("Mảng thẻ nhớ trống hoặc sai cấu trúc.");
      }
      
      await api.flashcards.bulkImport(nodeId, cards);
      showToast(`Nhập hàng loạt thành công ${cards.length} thẻ nhớ!`, "success");
      setJsonText("");
    } catch (err) {
      showToast("Lỗi nhập thẻ nhớ: " + err.message, "error");
    } finally {
      setImportingFlashcards(false);
    }
  };

  const handlePdfUpload = async (e) => {
    e.preventDefault();
    if (!pdfFile) return;
    setUploadingPdf(true);
    try {
      // 1. Upload file to Supabase bucket
      const res = await api.files.upload(pdfFile);
      
      // 2. Save reference document record to the DB
      await api.documents.create({
        courseId,
        fileName: pdfFile.name,
        fileUrl: res.url,
        status: 'completed',
      });

      setUploadedDocUrl(res.url);
      showToast(`Upload tài liệu PDF thành công: ${pdfFile.name}`, "success");
      setPdfFile(null);
    } catch (err) {
      showToast("Upload PDF thất bại: " + err.message, "error");
    } finally {
      setUploadingPdf(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* 1. Bulk Flashcard Importer */}
      <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-4">
        <h5 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm font-bold">upload_file</span>
          Nhập hàng loạt Flashcards (JSON)
        </h5>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Tải tệp tin cấu trúc JSON dạng mảng chứa câu hỏi và đáp án thẻ nhớ.
        </p>

        <div className="flex flex-col gap-3">
          <input
            type="file"
            accept=".json"
            onChange={handleJsonUpload}
            className="text-xs text-slate-400 file:bg-slate-950 file:border-slate-800 file:text-slate-300 file:rounded-lg file:px-3 file:py-1.5 file:mr-3 hover:file:bg-slate-900 focus:outline-none"
          />
          <textarea
            rows="5"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder='Ví dụ: \n[\n  { "question": "Vật chất là gì?", "answer": "Là phạm trù triết học..." }\n]'
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-red-500 font-mono resize-none"
          />
          <button
            type="button"
            onClick={handleBulkImport}
            disabled={importingFlashcards || !jsonText.trim()}
            className="w-full bg-red-800 hover:bg-red-950 text-white font-bold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {importingFlashcards ? (
              <span className="material-symbols-outlined animate-spin text-sm">sync</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">input</span>
                <span>Nhập hàng loạt thẻ nhớ</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. PDF Textbook Uploader */}
      <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-4">
        <h5 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm font-bold">picture_as_pdf</span>
          Upload tài liệu PDF học bổ trợ
        </h5>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Tải tệp sách giáo trình bổ trợ hoặc tư liệu PDF để tích hợp vào mindmap hoặc cho phép học viên tải về.
        </p>

        <form onSubmit={handlePdfUpload} className="space-y-3">
          <input
            type="file"
            accept=".pdf"
            required
            onChange={(e) => setPdfFile(e.target.files[0])}
            className="text-xs text-slate-400 file:bg-slate-950 file:border-slate-800 file:text-slate-300 file:rounded-lg file:px-3 file:py-1.5 file:mr-3 hover:file:bg-slate-900 focus:outline-none"
          />
          <button
            type="submit"
            disabled={uploadingPdf || !pdfFile}
            className="w-full bg-red-800 hover:bg-red-950 text-white font-bold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {uploadingPdf ? (
              <span className="material-symbols-outlined animate-spin text-sm">sync</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">cloud_upload</span>
                <span>Tải lên tài liệu PDF</span>
              </>
            )}
          </button>
        </form>

        {uploadedDocUrl && (
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col gap-1.5 text-xs">
            <span className="font-bold text-green-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              Đã lưu trên Bucket cục bộ
            </span>
            <span className="text-slate-400 break-all select-all font-mono bg-slate-900 px-2 py-1 rounded">
              {uploadedDocUrl}
            </span>
            <p className="text-[10px] text-slate-500">Sao chép URL trên để dán vào bài học bổ trợ hoặc tài nguyên.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== COLLAPSIBLE HIERARCHICAL TREE VIEW ====================
function HierarchyTreeView({ chapters, nodes, openEdit, handleDelete }) {
  const [expandedChaps, setExpandedChaps] = useState({});

  const toggleExpand = (id) => {
    setExpandedChaps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const topChapters = useMemo(() => {
    return chapters.filter(c => !c.parentChapterId).sort((a, b) => a.orderIndex - b.orderIndex);
  }, [chapters]);

  const getSubChapters = (parentChapterId) => {
    return chapters.filter(c => c.parentChapterId === parentChapterId).sort((a, b) => a.orderIndex - b.orderIndex);
  };

  const getChapterNodes = (chapterId) => {
    return nodes.filter(n => n.chapterId === chapterId).sort((a, b) => a.orderIndex - b.orderIndex);
  };

  return (
    <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden p-6 space-y-4 text-left">
      <h3 className="font-bold text-lg text-slate-100 border-b border-slate-800 pb-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-red-500">account_tree</span>
        Cấu trúc Cây phân cấp Bài học
      </h3>

      {topChapters.length === 0 ? (
        <div className="text-center py-10 text-slate-500">Chưa có chương học nào được tạo.</div>
      ) : (
        <div className="space-y-3">
          {topChapters.map((tc) => {
            const subs = getSubChapters(tc.id);
            const tcNodes = getChapterNodes(tc.id);
            const isExpanded = !!expandedChaps[tc.id];
            const hasChildren = subs.length > 0 || tcNodes.length > 0;

            return (
              <div key={tc.id} className="border border-slate-800 rounded-xl overflow-hidden transition-all bg-slate-900/10">
                {/* Top Chapter Header */}
                <div 
                  onClick={() => hasChildren && toggleExpand(tc.id)}
                  className={`flex justify-between items-center p-4 bg-slate-900/40 cursor-pointer hover:bg-slate-900/60 transition-colors ${
                    hasChildren ? "" : "cursor-default"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined text-xl transition-transform text-red-500 ${
                      isExpanded ? "rotate-90" : ""
                    } ${hasChildren ? "opacity-100" : "opacity-30"}`}>
                      chevron_right
                    </span>
                    <span className="material-symbols-outlined text-red-500">folder_open</span>
                    <span className="font-bold text-slate-200 text-base">{tc.title}</span>
                  </div>
                  <span className="bg-red-950 text-red-400 border border-red-900 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                    {subs.length} sub-chapters • {tcNodes.length} lessons
                  </span>
                </div>

                {/* Sub-chapters and Nodes drawer */}
                {isExpanded && hasChildren && (
                  <div className="p-4 bg-slate-950/40 border-t border-slate-900 pl-8 space-y-4">
                    {/* Render direct top-level lessons */}
                    {tcNodes.length > 0 && (
                      <div className="space-y-2">
                        {tcNodes.map((node) => (
                          <LessonNodeItem 
                            key={node.id} 
                            node={node} 
                            openEdit={openEdit} 
                            handleDelete={handleDelete} 
                          />
                        ))}
                      </div>
                    )}

                    {/* Render sub-chapters */}
                    {subs.length > 0 && (
                      <div className="space-y-3">
                        {subs.map((sc) => {
                          const scNodes = getChapterNodes(sc.id);
                          const isSubExpanded = !!expandedChaps[sc.id];
                          const hasSubChildren = scNodes.length > 0;

                          return (
                            <div key={sc.id} className="border border-slate-800/60 rounded-xl overflow-hidden bg-slate-950/20">
                              <div
                                onClick={() => hasSubChildren && toggleExpand(sc.id)}
                                className={`flex justify-between items-center p-3 bg-slate-900/20 cursor-pointer hover:bg-slate-900/40 transition-colors ${
                                  hasSubChildren ? "" : "cursor-default"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className={`material-symbols-outlined text-lg transition-transform text-amber-500 ${
                                    isSubExpanded ? "rotate-90" : ""
                                  } ${hasSubChildren ? "opacity-100" : "opacity-30"}`}>
                                    chevron_right
                                  </span>
                                  <span className="material-symbols-outlined text-amber-500">folder</span>
                                  <span className="font-semibold text-slate-300 text-sm">{sc.title}</span>
                                </div>
                                <span className="bg-slate-900 text-slate-400 border border-slate-800 text-[10px] px-2 py-0.5 rounded-full uppercase">
                                  {scNodes.length} lessons
                                </span>
                              </div>

                              {isSubExpanded && hasSubChildren && (
                                <div className="p-3 bg-slate-950/50 border-t border-slate-900/60 pl-8 space-y-2">
                                  {scNodes.map((node) => (
                                    <LessonNodeItem 
                                      key={node.id} 
                                      node={node} 
                                      openEdit={openEdit} 
                                      handleDelete={handleDelete} 
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LessonNodeItem({ node, openEdit, handleDelete }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-slate-900/10 rounded-xl border border-slate-900 hover:border-slate-800 transition-all gap-3 text-sm">
      <div className="flex items-center gap-2.5">
        <span className="material-symbols-outlined text-slate-500">article</span>
        <div>
          <span className="font-bold text-slate-200">{node.title}</span>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase ${
              node.difficulty === 'Easy' ? 'bg-green-950/40 text-green-400 border border-green-900/50' :
              node.difficulty === 'Hard' ? 'bg-red-950/40 text-red-400 border border-red-900/50' :
              'bg-amber-950/40 text-amber-400 border border-amber-900/50'
            }`}>
              {node.difficulty}
            </span>
            <span className="text-slate-500 text-[10px]">{node.timeToRead}</span>
            {node.videoUrl && (
              <span className="text-blue-400 text-[10px] flex items-center gap-0.5" title={node.videoUrl}>
                <span className="material-symbols-outlined text-[10px]">smart_display</span>
                YouTube
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <span className="bg-slate-950 text-slate-500 text-[10px] font-bold px-2 py-1 rounded border border-slate-900">
          Index: {node.orderIndex}
        </span>
        <button onClick={() => openEdit(node)} className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-blue-400 rounded-lg transition-colors flex items-center gap-1 font-semibold text-xs" title="Sửa & Quản lý">
          <span className="material-symbols-outlined text-xs">edit</span>
          Sửa / Upload
        </button>
        <button onClick={() => handleDelete(node.id)} className="p-1.5 hover:bg-slate-800 text-red-500 hover:text-red-400 rounded-lg transition-colors" title="Xóa">
          <span className="material-symbols-outlined text-sm">delete</span>
        </button>
      </div>
    </div>
  );
}

// ==================== NEW FRAMEWORK ADMIN PANEL (STORY, CONTENTS, MINIGAME, FINAL) ====================
function FrameworkAdminPanel({ form, setForm }) {
  const loadTemplate = (field, type = '') => {
    let tpl = {};
    if (field === 'storyIntro') {
      tpl = {
        enable: true,
        background: "",
        character: {
          name: "Narrator",
          avatar: "",
          position: "left"
        },
        dialogs: [
          {
            id: "dialog_01",
            text: "Xin chào, hôm nay chúng ta sẽ khám phá...",
            animation: "fade"
          }
        ],
        nextButton: {
          text: "Bắt đầu bài học",
          style: "primary"
        }
      };
    } else if (field === 'lessonContents') {
      tpl = [
        {
          conceptId: "concept_01",
          title: "Khái niệm 1",
          media: {
            type: "video",
            url: "https://www.youtube.com/watch?v=Mzg-AdRrjGY",
            autoplay: false
          },
          questions: [
            {
              questionId: "q_01",
              type: "single_choice",
              question: "Câu hỏi trắc nghiệm kiểm tra nhận thức ở đây?",
              answers: [
                {
                  answerId: "a_01",
                  text: "Đáp án sai",
                  isCorrect: false,
                  explanation: "Vì chưa phản ánh đúng bản chất..."
                },
                {
                  answerId: "a_02",
                  text: "Đáp án đúng",
                  isCorrect: true,
                  explanation: "Giải thích khoa học..."
                }
              ]
            }
          ],
          conceptSummary: {
            title: "Đúc kết khái niệm 1",
            content: [
              "Ý chính 1 cần ghi nhớ",
              "Ý chính 2 cần ghi nhớ"
            ]
          }
        }
      ];
    } else if (field === 'minigame') {
      if (type === 'sorting') {
        tpl = {
          enable: true,
          type: "single_column_sorting",
          config: {
            title: "Sắp xếp theo trình tự phát triển lịch sử",
            items: [
              { id: "item_01", text: "Duy vật Chất phác" },
              { id: "item_02", text: "Duy vật Siêu hình" },
              { id: "item_03", text: "Duy vật Biện chứng" }
            ],
            correctOrder: [
              "item_01",
              "item_02",
              "item_03"
            ]
          }
        };
      } else if (type === 'tree') {
        tpl = {
          enable: true,
          type: "mindmap_tree",
          config: {
            title: "Gắn khái niệm vào đúng nhánh sơ đồ",
            treeNodes: [
              { id: "node_root", label: "Chủ nghĩa Duy vật", parentId: null },
              { id: "node_sub", label: "Duy vật Biện chứng", parentId: "node_root" }
            ],
            options: [
              { id: "opt_01", text: "Lênin phát triển", matchNodeId: "node_sub" }
            ]
          }
        };
      } else {
        tpl = {
          enable: true,
          type: "matching_2_columns",
          config: {
            title: "Nối khái niệm biện chứng phù hợp",
            leftColumn: [
              { id: "left_01", text: "Vật chất" }
            ],
            rightColumn: [
              { id: "right_01", text: "Thực tại khách quan độc lập với ý thức" }
            ],
            correctPairs: [
              { leftId: "left_01", rightId: "right_01" }
            ]
          }
        };
      }
    } else if (field === 'finalSummary') {
      tpl = {
        title: "Hoàn thành bài học",
        description: "Bạn đã hoàn thành xuất sắc bài học.",
        keyTakeaways: [
          "Lập luận cốt lõi 1",
          "Lập luận cốt lõi 2"
        ],
        rewards: {
          xp: 100,
          badge: "Lý luận gia"
        },
        actions: {
          retryButton: true,
          nextLessonButton: true
        }
      };
    }
    
    setForm(prev => ({ ...prev, [field]: JSON.stringify(tpl, null, 2) }));
  };

  return (
    <div className="space-y-6 text-left">
      {/* Introduction Dialogs */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex justify-between items-center">
          <h5 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 font-serif">
            <span className="material-symbols-outlined text-sm">chat_bubble</span>
            1. Dẫn truyện (Story Intro JSON)
          </h5>
          <button 
            type="button" 
            onClick={() => loadTemplate('storyIntro')} 
            className="text-[10px] bg-slate-950 border border-slate-850 hover:bg-slate-900 text-indigo-400 px-2 py-0.5 rounded"
          >
            Nạp mẫu
          </button>
        </div>
        <textarea
          rows="5"
          value={form.storyIntro}
          onChange={(e) => setForm({ ...form, storyIntro: e.target.value })}
          placeholder='{"enable": true, "dialogs": [...]}'
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-indigo-500 font-mono resize-none"
        />
      </div>

      {/* Main Concepts Loop */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex justify-between items-center">
          <h5 className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5 font-serif">
            <span className="material-symbols-outlined text-sm">menu_book</span>
            2. Vòng lặp lý thuyết (Lesson Contents JSON)
          </h5>
          <button 
            type="button" 
            onClick={() => loadTemplate('lessonContents')} 
            className="text-[10px] bg-slate-950 border border-slate-855 hover:bg-slate-900 text-amber-500 px-2 py-0.5 rounded"
          >
            Nạp mẫu
          </button>
        </div>
        <textarea
          rows="5"
          value={form.lessonContents}
          onChange={(e) => setForm({ ...form, lessonContents: e.target.value })}
          placeholder='[{"conceptId": "concept_01", "media": {...}, "questions": [...]}]'
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-amber-500 font-mono resize-none"
        />
      </div>

      {/* Minigame configuration */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h5 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 font-serif">
            <span className="material-symbols-outlined text-sm">extension</span>
            3. Trò chơi củng cố (Minigame JSON)
          </h5>
          <div className="flex gap-1">
            <button 
              type="button" 
              onClick={() => loadTemplate('minigame', 'matching')} 
              className="text-[9px] bg-slate-950 border border-slate-850 hover:bg-slate-900 text-indigo-400 px-1.5 py-0.5 rounded"
            >
              Mẫu Ghép cặp
            </button>
            <button 
              type="button" 
              onClick={() => loadTemplate('minigame', 'sorting')} 
              className="text-[9px] bg-slate-950 border border-slate-850 hover:bg-slate-900 text-indigo-400 px-1.5 py-0.5 rounded"
            >
              Mẫu Sắp xếp
            </button>
            <button 
              type="button" 
              onClick={() => loadTemplate('minigame', 'tree')} 
              className="text-[9px] bg-slate-950 border border-slate-850 hover:bg-slate-900 text-indigo-400 px-1.5 py-0.5 rounded"
            >
              Mẫu Sơ đồ
            </button>
          </div>
        </div>
        <textarea
          rows="5"
          value={form.minigame}
          onChange={(e) => setForm({ ...form, minigame: e.target.value })}
          placeholder='{"enable": true, "type": "matching_2_columns", "config": {...}}'
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-indigo-500 font-mono resize-none"
        />
      </div>

      {/* Final summary */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex justify-between items-center">
          <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-serif">
            <span className="material-symbols-outlined text-sm">verified</span>
            4. Đúc kết & Huy hiệu (Final Summary JSON)
          </h5>
          <button 
            type="button" 
            onClick={() => loadTemplate('finalSummary')} 
            className="text-[10px] bg-slate-950 border border-slate-850 hover:bg-slate-900 text-emerald-400 px-2 py-0.5 rounded"
          >
            Nạp mẫu
          </button>
        </div>
        <textarea
          rows="5"
          value={form.finalSummary}
          onChange={(e) => setForm({ ...form, finalSummary: e.target.value })}
          placeholder='{"title": "Đúc kết", "keyTakeaways": [...]}'
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-emerald-500 font-mono resize-none"
        />
      </div>
    </div>
  );
}
