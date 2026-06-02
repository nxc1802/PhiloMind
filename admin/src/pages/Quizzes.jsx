import React, { useState, useEffect, useCallback } from 'react';
import AdminPageShell from '../components/AdminPageShell';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

export default function Quizzes() {
  const { showToast } = useToast();
  const [quizzes, setQuizzes] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState({ isOpen: false, type: 'create', quiz: null });
  const [form, setForm] = useState({
    nodeId: '',
    type: 'matching', // default to matching as requested
    title: '',
    description: '',
  });

  // Dynamic questions schema based on quiz type
  const [mcqQuestions, setMcqQuestions] = useState([
    { question: '', options: ['', '', '', ''], correctIndex: 0 }
  ]);
  const [matchingPairs, setMatchingPairs] = useState([
    { left: '', right: '' }
  ]);
  const [essayPrompts, setEssayPrompts] = useState([
    { question: '', sampleAnswer: '' }
  ]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [qList, nList] = await Promise.all([
        api.quizzes.list(),
        api.nodes.list(),
      ]);
      setQuizzes(qList || []);
      setNodes(nList || []);
    } catch (err) {
      showToast('Lỗi tải dữ liệu quiz: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreate = () => {
    setModal({ isOpen: true, type: 'create', quiz: null });
    setForm({
      nodeId: nodes.length > 0 ? nodes[0].id : '',
      type: 'matching',
      title: '',
      description: '',
    });
    setMcqQuestions([{ question: '', options: ['', '', '', ''], correctIndex: 0 }]);
    setMatchingPairs([{ left: '', right: '' }]);
    setEssayPrompts([{ question: '', sampleAnswer: '' }]);
  };

  const openEdit = (quiz) => {
    setModal({ isOpen: true, type: 'edit', quiz });
    setForm({
      nodeId: quiz.nodeId || '',
      type: quiz.type,
      title: quiz.title,
      description: quiz.description || '',
    });

    // Populate question structures
    if (quiz.type === 'mcq' || quiz.type === 'image' || quiz.type === 'analysis') {
      setMcqQuestions(Array.isArray(quiz.questions) ? quiz.questions : []);
    } else if (quiz.type === 'matching') {
      setMatchingPairs(Array.isArray(quiz.questions) ? quiz.questions : []);
    } else if (quiz.type === 'essay') {
      setEssayPrompts(Array.isArray(quiz.questions) ? quiz.questions : []);
    }
  };

  // MCQ Helpers
  const addMcqQuestion = () => {
    setMcqQuestions([...mcqQuestions, { question: '', options: ['', '', '', ''], correctIndex: 0 }]);
  };
  const removeMcqQuestion = (index) => {
    setMcqQuestions(mcqQuestions.filter((_, i) => i !== index));
  };
  const updateMcqQuestion = (index, field, value) => {
    const updated = [...mcqQuestions];
    updated[index][field] = value;
    setMcqQuestions(updated);
  };
  const updateMcqOption = (qIndex, oIndex, value) => {
    const updated = [...mcqQuestions];
    updated[qIndex].options[oIndex] = value;
    setMcqQuestions(updated);
  };

  // Matching Helpers
  const addMatchingPair = () => {
    setMatchingPairs([...matchingPairs, { left: '', right: '' }]);
  };
  const removeMatchingPair = (index) => {
    setMatchingPairs(matchingPairs.filter((_, i) => i !== index));
  };
  const updateMatchingPair = (index, field, value) => {
    const updated = [...matchingPairs];
    updated[index][field] = value;
    setMatchingPairs(updated);
  };

  // Essay Helpers
  const addEssayPrompt = () => {
    setEssayPrompts([...essayPrompts, { question: '', sampleAnswer: '' }]);
  };
  const removeEssayPrompt = (index) => {
    setEssayPrompts(essayPrompts.filter((_, i) => i !== index));
  };
  const updateEssayPrompt = (index, field, value) => {
    const updated = [...essayPrompts];
    updated[index][field] = value;
    setEssayPrompts(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let questionsPayload = [];
    if (form.type === 'mcq' || form.type === 'image' || form.type === 'analysis') {
      questionsPayload = mcqQuestions;
    } else if (form.type === 'matching') {
      questionsPayload = matchingPairs;
    } else if (form.type === 'essay') {
      questionsPayload = essayPrompts;
    }

    const payload = {
      ...form,
      questions: questionsPayload,
    };

    try {
      if (modal.type === 'create') {
        await api.quizzes.create(payload);
        showToast('Tạo bộ Quiz mới thành công!', 'success');
      } else {
        await api.quizzes.update(modal.quiz.id, payload);
        showToast('Cập nhật bộ Quiz thành công!', 'success');
      }
      setModal({ isOpen: false, type: 'create', quiz: null });
      loadData();
    } catch (err) {
      showToast('Lưu Quiz thất bại: ' + err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài kiểm tra/trò chơi ghép cặp này không? Sinh viên sẽ không thấy bài học này trên giao diện luyện tập.')) return;
    try {
      await api.quizzes.delete(id);
      showToast('Xóa thành công!', 'success');
      loadData();
    } catch (err) {
      showToast('Xóa thất bại: ' + err.message, 'error');
    }
  };

  return (
    <AdminPageShell activeKey="quizzes">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500 text-3xl">quiz</span>
              Hệ thống Bài tập & Trò chơi Ghép cặp
            </h1>
            <p className="text-slate-400 mt-1">Thiết lập các bộ câu hỏi ôn tập, bài tự luận, hoặc thử thách ghép cặp khái niệm cho từng bài học.</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-red-800 hover:bg-red-900 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg transition-colors">
            <span className="material-symbols-outlined text-sm">add</span> Tạo Bộ Quiz/Ghép Cặp
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-red-500 text-5xl animate-spin">sync</span>
            <p className="text-slate-400 mt-4">Đang tải danh sách bài tập...</p>
          </div>
        ) : (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/50 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-4">Tiêu đề bộ đề</th>
                    <th className="p-4">Chuyên mục / Dạng bài</th>
                    <th className="p-4">Bài học liên kết (Node)</th>
                    <th className="p-4">Số lượng câu hỏi / thẻ ghép</th>
                    <th className="p-4 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {quizzes.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-500">Chưa có bài tập hay trò chơi ghép cặp nào được tạo lập.</td>
                    </tr>
                  ) : (
                    quizzes.map((q) => (
                      <tr key={q.id} className="hover:bg-slate-900/30">
                        <td className="p-4 font-bold text-slate-200">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-red-500">
                              {q.type === 'matching' ? 'grid_view' : 'quiz'}
                            </span>
                            <span>{q.title}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${
                            q.type === 'matching' 
                              ? 'bg-emerald-950/45 text-emerald-450 border-emerald-900/50' 
                              : 'bg-red-950/45 text-red-450 border-red-900/50'
                          }`}>
                            {q.type === 'matching' ? 'Trò chơi Ghép Cặp' : q.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">{q.node?.title || 'Tất cả / Hệ thống'}</td>
                        <td className="p-4 font-mono text-slate-400">
                          {Array.isArray(q.questions) ? `${q.questions.length} phần tử` : '0'}
                        </td>
                        <td className="p-4 flex justify-center gap-2">
                          <button onClick={() => openEdit(q)} className="p-2 hover:bg-slate-800 text-blue-400 rounded-lg transition-colors" title="Chỉnh sửa">
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button onClick={() => handleDelete(q.id)} className="p-2 hover:bg-slate-800 text-red-400 rounded-lg transition-colors" title="Xóa">
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create/Edit Modal */}
        {modal.isOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-950 rounded-2xl border border-slate-800 w-full max-w-2xl max-h-[85vh] shadow-2xl overflow-y-auto p-6 space-y-6">
              <div className="flex justify-between items-center text-left">
                <h3 className="text-xl font-bold text-slate-100">
                  {modal.type === 'create' ? 'Tạo Bộ Quiz / Ghép Cặp' : 'Chỉnh sửa Bộ đề'}
                </h3>
                <button onClick={() => setModal({ isOpen: false, type: 'create', quiz: null })} className="text-slate-500 hover:text-slate-300">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Bài học liên kết (Concept Node)</label>
                    <select
                      value={form.nodeId}
                      onChange={(e) => setForm({ ...form, nodeId: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-red-500 transition-colors"
                    >
                      <option value="">Hệ thống / Toàn cục</option>
                      {nodes.map((n) => (
                        <option key={n.id} value={n.id}>{n.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Dạng học tập / Quiz</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-red-500 transition-colors"
                    >
                      <option value="matching">Trò chơi Ghép Cặp (Matching Game)</option>
                      <option value="mcq">Trắc nghiệm tổng hợp (MCQ)</option>
                      <option value="essay">Tự luận biện chứng (Essay)</option>
                      <option value="image">Đoán ảnh triết học (Image Guess)</option>
                      <option value="analysis">Phân tích học thuyết (Analysis)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tiêu đề Bộ đề</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Ghép cặp cặp trùn lượng - chất"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mô tả hướng dẫn bài làm</label>
                  <textarea
                    rows="2"
                    placeholder="Ví dụ: Chọn khái niệm cột trái khớp định nghĩa cột phải..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-red-500 transition-colors resize-none"
                  />
                </div>

                {/* DYNAMIC FORMS BASED ON TYPE */}
                <div className="border-t border-slate-800 pt-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-red-400 uppercase tracking-wider">Cấu trúc bộ câu hỏi</h4>
                    {form.type === 'matching' && (
                      <button type="button" onClick={addMatchingPair} className="bg-slate-900 hover:bg-slate-850 border border-slate-800 px-3 py-1 rounded text-xs text-slate-300 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">add</span> Thêm cặp thẻ
                      </button>
                    )}
                    {form.type === 'mcq' && (
                      <button type="button" onClick={addMcqQuestion} className="bg-slate-900 hover:bg-slate-850 border border-slate-800 px-3 py-1 rounded text-xs text-slate-300 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">add</span> Thêm câu hỏi
                      </button>
                    )}
                    {form.type === 'essay' && (
                      <button type="button" onClick={addEssayPrompt} className="bg-slate-900 hover:bg-slate-850 border border-slate-800 px-3 py-1 rounded text-xs text-slate-300 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">add</span> Thêm tự luận
                      </button>
                    )}
                  </div>

                  {/* 1. MATCHING GAPE PAIRS */}
                  {form.type === 'matching' && (
                    <div className="space-y-3">
                      {matchingPairs.map((pair, index) => (
                        <div key={index} className="flex gap-3 items-start bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              required
                              placeholder="Khái niệm bên trái (ví dụ: Vật chất)"
                              value={pair.left}
                              onChange={(e) => updateMatchingPair(index, 'left', e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100"
                            />
                            <textarea
                              rows="2"
                              required
                              placeholder="Định nghĩa tương ứng bên phải (ví dụ: Là thực tại khách quan...)"
                              value={pair.right}
                              onChange={(e) => updateMatchingPair(index, 'right', e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 resize-none"
                            />
                          </div>
                          {matchingPairs.length > 1 && (
                            <button type="button" onClick={() => removeMatchingPair(index)} className="text-red-500 hover:text-red-400 p-1">
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 2. MCQ */}
                  {form.type === 'mcq' && (
                    <div className="space-y-4">
                      {mcqQuestions.map((mcq, qIdx) => (
                        <div key={qIdx} className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-3">
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-grow">
                              <label className="text-[10px] text-slate-500 font-bold block mb-1">Câu hỏi {qIdx + 1}</label>
                              <input
                                type="text"
                                required
                                placeholder="Nội dung câu hỏi..."
                                value={mcq.question}
                                onChange={(e) => updateMcqQuestion(qIdx, 'question', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100"
                              />
                            </div>
                            {mcqQuestions.length > 1 && (
                              <button type="button" onClick={() => removeMcqQuestion(qIdx)} className="text-red-550 hover:text-red-400 mt-5">
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {mcq.options.map((opt, oIdx) => (
                              <div key={oIdx} className="flex gap-2 items-center">
                                <span className="text-xs text-slate-500 font-bold">{String.fromCharCode(65 + oIdx)}.</span>
                                <input
                                  type="text"
                                  required
                                  placeholder={`Lựa chọn ${oIdx + 1}...`}
                                  value={opt}
                                  onChange={(e) => updateMcqOption(qIdx, oIdx, e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100"
                                />
                              </div>
                            ))}
                          </div>

                          <div className="w-1/2">
                            <label className="text-[10px] text-slate-550 font-bold block mb-1">Lựa chọn đúng (Đáp án)</label>
                            <select
                              value={mcq.correctIndex}
                              onChange={(e) => updateMcqQuestion(qIdx, 'correctIndex', parseInt(e.target.value, 10))}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100"
                            >
                              <option value="0">Đáp án A</option>
                              <option value="1">Đáp án B</option>
                              <option value="2">Đáp án C</option>
                              <option value="3">Đáp án D</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 3. ESSAY */}
                  {form.type === 'essay' && (
                    <div className="space-y-3">
                      {essayPrompts.map((essay, index) => (
                        <div key={index} className="flex gap-3 items-start bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              required
                              placeholder="Câu hỏi tự luận (ví dụ: Tại sao ý thức có tính năng động sáng tạo?)"
                              value={essay.question}
                              onChange={(e) => updateEssayPrompt(index, 'question', e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100"
                            />
                            <textarea
                              rows="2"
                              required
                              placeholder="Gợi ý/Đáp án tham khảo học thuật..."
                              value={essay.sampleAnswer}
                              onChange={(e) => updateEssayPrompt(index, 'sampleAnswer', e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 resize-none"
                            />
                          </div>
                          {essayPrompts.length > 1 && (
                            <button type="button" onClick={() => removeEssayPrompt(index)} className="text-red-500 hover:text-red-400 p-1">
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button type="submit" className="w-full bg-red-800 hover:bg-red-900 text-white font-bold py-3.5 rounded-xl shadow-lg transition-colors">
                  {modal.type === 'create' ? 'Tạo Bộ Quiz / Ghép Cặp' : 'Lưu Thay Đổi'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminPageShell>
  );
}
