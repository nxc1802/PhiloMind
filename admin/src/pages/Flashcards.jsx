import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AdminPageShell from '../components/AdminPageShell';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

export default function Flashcards() {
  const { showToast } = useToast();
  const [flashcards, setFlashcards] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({}); // Keep track of open folder keys

  const [modal, setModal] = useState({ isOpen: false, type: 'create', flashcard: null });
  const [form, setForm] = useState({
    nodeId: '',
    tag: 'Chung',
    question: '',
    answer: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [fList, nList, cList, chList] = await Promise.all([
        api.flashcards.list(),
        api.nodes.list(),
        api.courses.list(),
        api.chapters.list(),
      ]);
      setFlashcards(fList || []);
      setNodes(nList || []);
      setCourses(cList || []);
      setChapters(chList || []);
      
      // Auto expand first course by default
      if (cList && cList.length > 0) {
        setExpanded(prev => ({ ...prev, [`course-${cList[0].id}`]: true }));
      }
    } catch (err) {
      showToast('Lỗi tải dữ liệu thẻ nhớ: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Group flashcards into a tree hierarchy: Course -> Chapter -> Node -> Flashcards
  const treeData = useMemo(() => {
    const courseMap = {};

    // Initialize with all courses, chapters, and nodes
    courses.forEach(c => {
      courseMap[c.id] = {
        id: c.id,
        title: c.title,
        chapters: {}
      };
    });

    chapters.forEach(ch => {
      const cId = ch.courseId;
      if (!courseMap[cId]) {
        courseMap[cId] = { id: cId, title: 'Khóa học khác', chapters: {} };
      }
      courseMap[cId].chapters[ch.id] = {
        id: ch.id,
        title: ch.title,
        nodes: {}
      };
    });

    nodes.forEach(n => {
      const ch = chapters.find(c => c.id === n.chapterId);
      const cId = ch ? ch.courseId : 'unknown';
      const chId = n.chapterId;

      if (!courseMap[cId]) {
        courseMap[cId] = { id: cId, title: 'Khóa học khác', chapters: {} };
      }
      if (!courseMap[cId].chapters[chId]) {
        courseMap[cId].chapters[chId] = { id: chId, title: 'Chương khác', nodes: {} };
      }

      courseMap[cId].chapters[chId].nodes[n.id] = {
        id: n.id,
        title: n.title,
        flashcards: []
      };
    });

    // Populate actual flashcards
    flashcards.forEach(fc => {
      const n = nodes.find(node => node.id === fc.nodeId);
      const nodeId = fc.nodeId;
      if (!n) return;

      const ch = chapters.find(c => c.id === n.chapterId);
      const cId = ch ? ch.courseId : 'unknown';
      const chId = n.chapterId;

      if (courseMap[cId] && courseMap[cId].chapters[chId] && courseMap[cId].chapters[chId].nodes[nodeId]) {
        courseMap[cId].chapters[chId].nodes[nodeId].flashcards.push(fc);
      }
    });

    // Flatten maps into arrays for rendering
    return Object.values(courseMap).map(c => ({
      ...c,
      chapters: Object.values(c.chapters).map(ch => ({
        ...ch,
        nodes: Object.values(ch.nodes).filter(n => n.flashcards.length > 0) // only show nodes with flashcards, or all nodes
      })).filter(ch => ch.nodes.length > 0)
    })).filter(c => c.chapters.length > 0);
  }, [courses, chapters, nodes, flashcards]);

  const toggleExpand = (key) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const openCreate = () => {
    setModal({ isOpen: true, type: 'create', flashcard: null });
    setForm({
      nodeId: nodes.length > 0 ? nodes[0].id : '',
      tag: 'Chung',
      question: '',
      answer: '',
    });
  };

  const openEdit = (fc) => {
    setModal({ isOpen: true, type: 'edit', flashcard: fc });
    setForm({
      nodeId: fc.nodeId,
      tag: fc.tag,
      question: fc.question,
      answer: fc.answer,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modal.type === 'create') {
        await api.flashcards.create(form);
        showToast('Tạo thẻ nhớ thành công!', 'success');
      } else {
        await api.flashcards.update(modal.flashcard.id, {
          tag: form.tag,
          question: form.question,
          answer: form.answer,
        });
        showToast('Cập nhật thẻ nhớ thành công!', 'success');
      }
      setModal({ isOpen: false, type: 'create', flashcard: null });
      loadData();
    } catch (err) {
      showToast('Thao tác thất bại: ' + err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thẻ nhớ này? Thẻ nhớ này sẽ bị loại khỏi danh sách ôn tập của tất cả học viên.')) return;
    try {
      await api.flashcards.delete(id);
      showToast('Xóa thẻ nhớ thành công!', 'success');
      loadData();
    } catch (err) {
      showToast('Xóa thẻ nhớ thất bại: ' + err.message, 'error');
    }
  };

  return (
    <AdminPageShell activeKey="flashcards">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500 text-3xl">layers</span>
              Quản lý Thẻ nhớ (Hierarchical Flashcards)
            </h1>
            <p className="text-slate-400 mt-1">Hệ thống thẻ nhớ ôn tập phân cấp theo Khóa học → Chương → Bài học để dễ theo dõi.</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-red-800 hover:bg-red-900 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg transition-colors">
            <span className="material-symbols-outlined text-sm">add</span> Thêm Thẻ nhớ
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-red-500 text-5xl animate-spin">sync</span>
            <p className="text-slate-400 mt-4">Đang tải cấu trúc cây thẻ nhớ...</p>
          </div>
        ) : treeData.length === 0 ? (
          <div className="bg-slate-950 rounded-2xl p-12 text-center border border-slate-800">
            <span className="material-symbols-outlined text-5xl text-slate-600 mb-3">layers_clear</span>
            <p className="text-slate-500">Chưa có thẻ nhớ nào được tạo lập trong hệ thống.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {treeData.map(course => {
              const courseKey = `course-${course.id}`;
              const isCourseExpanded = expanded[courseKey];

              return (
                <div key={course.id} className="bg-slate-950 rounded-2xl border border-slate-800 shadow-lg overflow-hidden">
                  {/* Course Header */}
                  <button 
                    onClick={() => toggleExpand(courseKey)}
                    className="w-full flex items-center justify-between px-6 py-4 bg-slate-900/60 hover:bg-slate-900/80 transition-colors text-left border-b border-slate-800/40"
                  >
                    <div className="flex items-center gap-3 text-red-400 font-bold text-lg">
                      <span className="material-symbols-outlined">menu_book</span>
                      <span>{course.title}</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-450">
                      {isCourseExpanded ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>

                  {isCourseExpanded && (
                    <div className="p-6 space-y-6">
                      {course.chapters.map(chapter => {
                        const chapterKey = `chapter-${chapter.id}`;
                        const isChapterExpanded = expanded[chapterKey];

                        return (
                          <div key={chapter.id} className="border border-slate-800/80 rounded-xl bg-slate-900/10 overflow-hidden">
                            {/* Chapter Header */}
                            <button 
                              onClick={() => toggleExpand(chapterKey)}
                              className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-900/40 hover:bg-slate-900/60 transition-colors text-left"
                            >
                              <div className="flex items-center gap-2.5 text-slate-200 font-semibold text-base">
                                <span className="material-symbols-outlined text-amber-500">folder</span>
                                <span>{chapter.title}</span>
                              </div>
                              <span className="material-symbols-outlined text-slate-500">
                                {isChapterExpanded ? 'folder_open' : 'folder'}
                              </span>
                            </button>

                            {isChapterExpanded && (
                              <div className="p-4 space-y-4 border-t border-slate-800/40 bg-slate-950/20">
                                {chapter.nodes.map(node => {
                                  const nodeKey = `node-${node.id}`;
                                  const isNodeExpanded = expanded[nodeKey];

                                  return (
                                    <div key={node.id} className="ml-4 border-l-2 border-slate-800 pl-4 py-2">
                                      {/* Node title trigger */}
                                      <button 
                                        onClick={() => toggleExpand(nodeKey)}
                                        className="flex items-center gap-2 hover:text-red-400 text-slate-350 text-sm font-semibold transition-colors mb-3 text-left"
                                      >
                                        <span className="material-symbols-outlined text-red-500/80">bookmark</span>
                                        <span>{node.title}</span>
                                        <span className="text-xs text-slate-500">({node.flashcards.length} thẻ)</span>
                                        <span className="material-symbols-outlined text-xs">
                                          {isNodeExpanded ? 'arrow_drop_up' : 'arrow_drop_down'}
                                        </span>
                                      </button>

                                      {isNodeExpanded && (
                                        <div className="grid gap-3 mt-2 grid-cols-1 md:grid-cols-2">
                                          {node.flashcards.map(fc => (
                                            <div key={fc.id} className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
                                              <div className="space-y-2 text-left">
                                                <div className="flex justify-between items-start gap-2">
                                                  <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[10px] text-slate-400 font-bold uppercase">
                                                    {fc.tag}
                                                  </span>
                                                  <div className="flex gap-1 shrink-0">
                                                    <button onClick={() => openEdit(fc)} className="p-1 hover:bg-slate-800 text-blue-400 rounded transition-colors" title="Chỉnh sửa">
                                                      <span className="material-symbols-outlined text-base">edit</span>
                                                    </button>
                                                    <button onClick={() => handleDelete(fc.id)} className="p-1 hover:bg-slate-800 text-red-400 rounded transition-colors" title="Xóa">
                                                      <span className="material-symbols-outlined text-base">delete</span>
                                                    </button>
                                                  </div>
                                                </div>
                                                <p className="text-xs text-slate-400 font-bold">Mặt trước (Q):</p>
                                                <p className="text-sm font-semibold text-slate-100">{fc.question}</p>
                                                <div className="h-px bg-slate-800/40 my-2" />
                                                <p className="text-xs text-slate-400 font-bold">Mặt sau (A):</p>
                                                <p className="text-xs text-slate-300 leading-relaxed italic">{fc.answer}</p>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Create/Edit Modal */}
        {modal.isOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-950 rounded-2xl border border-slate-800 w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-6">
              <div className="flex justify-between items-center text-left">
                <h3 className="text-xl font-bold text-slate-100">
                  {modal.type === 'create' ? 'Tạo Thẻ nhớ mới' : 'Chỉnh sửa Thẻ nhớ'}
                </h3>
                <button onClick={() => setModal({ isOpen: false, type: 'create', flashcard: null })} className="text-slate-500 hover:text-slate-300">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                {modal.type === 'create' && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Bài học liên kết (Concept Node)</label>
                    <select
                      value={form.nodeId}
                      onChange={(e) => setForm({ ...form, nodeId: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-red-500 transition-colors"
                    >
                      {nodes.map((n) => (
                        <option key={n.id} value={n.id}>{n.title}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Nhãn chủ đề (Tag)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Vật chất, Ý thức, Lịch sử"
                    value={form.tag}
                    onChange={(e) => setForm({ ...form, tag: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Câu hỏi (Mặt trước thẻ)</label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Câu hỏi ôn tập..."
                    value={form.question}
                    onChange={(e) => setForm({ ...form, question: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-red-500 transition-colors resize-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Đáp án (Mặt sau thẻ)</label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Đáp án học thuật chuẩn..."
                    value={form.answer}
                    onChange={(e) => setForm({ ...form, answer: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-red-500 transition-colors resize-none"
                  />
                </div>
                <button type="submit" className="w-full bg-red-800 hover:bg-red-900 text-white font-bold py-3 rounded-xl transition-colors">
                  {modal.type === 'create' ? 'Tạo Thẻ nhớ' : 'Lưu thay đổi'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminPageShell>
  );
}
