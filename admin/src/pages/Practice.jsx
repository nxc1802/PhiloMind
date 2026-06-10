import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AdminPageShell from '../components/AdminPageShell';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

export default function Practice() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('flashcard'); // 'flashcard' | 'matching' | 'quiz'
  
  // Data States
  const [flashcards, setFlashcards] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({}); // Keep track of open folder keys in flashcard tree

  // Modal States
  const [fcModal, setFcModal] = useState({ isOpen: false, type: 'create', flashcard: null });
  const [quizModal, setQuizModal] = useState({ isOpen: false, type: 'create', quiz: null });

  // Form States - Flashcard
  const [fcForm, setFcForm] = useState({
    nodeId: '',
    tag: 'Chung',
    question: '',
    answer: '',
  });

  // Form States - Quiz
  const [quizForm, setQuizForm] = useState({
    nodeId: '',
    type: 'matching',
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
      const [fList, qList, nList, cList, chList] = await Promise.all([
        api.flashcards.list(),
        api.quizzes.list(),
        api.nodes.list(),
        api.courses.list(),
        api.chapters.list(),
      ]);
      setFlashcards(fList || []);
      setQuizzes(qList || []);
      setNodes(nList || []);
      setCourses(cList || []);
      setChapters(chList || []);
      
      // Auto expand first course by default
      if (cList && cList.length > 0) {
        setExpanded(prev => ({ ...prev, [`course-${cList[0].id}`]: true }));
      }
    } catch (err) {
      showToast('Lỗi tải dữ liệu: ' + err.message, 'error');
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

    courses.forEach(c => {
      courseMap[c.id] = { id: c.id, title: c.title, chapters: {} };
    });

    chapters.forEach(ch => {
      const cId = ch.courseId;
      if (!courseMap[cId]) {
        courseMap[cId] = { id: cId, title: 'Khóa học khác', chapters: {} };
      }
      courseMap[cId].chapters[ch.id] = { id: ch.id, title: ch.title, nodes: {} };
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

      courseMap[cId].chapters[chId].nodes[n.id] = { id: n.id, title: n.title, flashcards: [] };
    });

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

    return Object.values(courseMap).map(c => ({
      ...c,
      chapters: Object.values(c.chapters).map(ch => ({
        ...ch,
        nodes: Object.values(ch.nodes).filter(n => n.flashcards.length > 0)
      })).filter(ch => ch.nodes.length > 0)
    })).filter(c => c.chapters.length > 0);
  }, [courses, chapters, nodes, flashcards]);

  const toggleExpand = (key) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Flashcards CRUD
  const openCreateFc = () => {
    setFcModal({ isOpen: true, type: 'create', flashcard: null });
    setFcForm({
      nodeId: nodes.length > 0 ? nodes[0].id : '',
      tag: 'Chung',
      question: '',
      answer: '',
    });
  };

  const openEditFc = (fc) => {
    setFcModal({ isOpen: true, type: 'edit', flashcard: fc });
    setFcForm({
      nodeId: fc.nodeId,
      tag: fc.tag,
      question: fc.question,
      answer: fc.answer,
    });
  };

  const handleFcSubmit = async (e) => {
    e.preventDefault();
    try {
      if (fcModal.type === 'create') {
        await api.flashcards.create(fcForm);
        showToast('Tạo thẻ nhớ thành công!', 'success');
      } else {
        await api.flashcards.update(fcModal.flashcard.id, {
          tag: fcForm.tag,
          question: fcForm.question,
          answer: fcForm.answer,
        });
        showToast('Cập nhật thẻ nhớ thành công!', 'success');
      }
      setFcModal({ isOpen: false, type: 'create', flashcard: null });
      loadData();
    } catch (err) {
      showToast('Thao tác thất bại: ' + err.message, 'error');
    }
  };

  const handleFcDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thẻ nhớ này? Thẻ nhớ này sẽ bị loại khỏi danh sách ôn tập của tất cả học viên.')) return;
    try {
      await api.flashcards.delete(id);
      showToast('Xóa thẻ nhớ thành công!', 'success');
      loadData();
    } catch (err) {
      showToast('Xóa thẻ nhớ thất bại: ' + err.message, 'error');
    }
  };

  // Quizzes/Matching Games CRUD
  const openCreateQuiz = (type) => {
    setQuizModal({ isOpen: true, type: 'create', quiz: null });
    setQuizForm({
      nodeId: nodes.length > 0 ? nodes[0].id : '',
      type: type,
      title: '',
      description: '',
    });
    setMcqQuestions([{ question: '', options: ['', '', '', ''], correctIndex: 0 }]);
    setMatchingPairs([{ left: '', right: '' }]);
    setEssayPrompts([{ question: '', sampleAnswer: '' }]);
  };

  const openEditQuiz = (quiz) => {
    setQuizModal({ isOpen: true, type: 'edit', quiz });
    setQuizForm({
      nodeId: quiz.nodeId || '',
      type: quiz.type,
      title: quiz.title,
      description: quiz.description || '',
    });

    if (quiz.type === 'mcq' || quiz.type === 'image' || quiz.type === 'analysis') {
      setMcqQuestions(Array.isArray(quiz.questions) ? quiz.questions : []);
    } else if (quiz.type === 'matching') {
      setMatchingPairs(Array.isArray(quiz.questions) ? quiz.questions : []);
    } else if (quiz.type === 'essay') {
      setEssayPrompts(Array.isArray(quiz.questions) ? quiz.questions : []);
    }
  };

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

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    let questionsPayload = [];
    if (quizForm.type === 'mcq' || quizForm.type === 'image' || quizForm.type === 'analysis') {
      questionsPayload = mcqQuestions;
    } else if (quizForm.type === 'matching') {
      questionsPayload = matchingPairs;
    } else if (quizForm.type === 'essay') {
      questionsPayload = essayPrompts;
    }

    const payload = {
      ...quizForm,
      questions: questionsPayload,
    };

    try {
      if (quizModal.type === 'create') {
        await api.quizzes.create(payload);
        showToast('Tạo thành công!', 'success');
      } else {
        await api.quizzes.update(quizModal.quiz.id, payload);
        showToast('Cập nhật thành công!', 'success');
      }
      setQuizModal({ isOpen: false, type: 'create', quiz: null });
      loadData();
    } catch (err) {
      showToast('Lưu thất bại: ' + err.message, 'error');
    }
  };

  const handleQuizDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài luyện tập này?')) return;
    try {
      await api.quizzes.delete(id);
      showToast('Xóa thành công!', 'success');
      loadData();
    } catch (err) {
      showToast('Xóa thất bại: ' + err.message, 'error');
    }
  };

  // Partition quizzes
  const matchingGames = useMemo(() => quizzes.filter(q => q.type === 'matching'), [quizzes]);
  const otherQuizzes = useMemo(() => quizzes.filter(q => q.type !== 'matching'), [quizzes]);

  return (
    <AdminPageShell activeKey="practice">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500 text-3xl">fitness_center</span>
              Hệ thống Quản lý Luyện tập (Practice Management)
            </h1>
            <p className="text-slate-400 mt-1">Cấu hình ngân hàng câu hỏi ôn tập, game ghép cặp, hoặc bài trắc nghiệm tự luyện.</p>
          </div>
          
          <div className="flex gap-2">
            {activeTab === 'flashcard' && (
              <button onClick={openCreateFc} className="flex items-center gap-2 bg-red-800 hover:bg-red-900 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg transition-all">
                <span className="material-symbols-outlined text-sm">add</span> Thêm Thẻ nhớ
              </button>
            )}
            {activeTab === 'matching' && (
              <button onClick={() => openCreateQuiz('matching')} className="flex items-center gap-2 bg-red-800 hover:bg-red-900 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg transition-all">
                <span className="material-symbols-outlined text-sm">add</span> Tạo Bộ Ghép Cặp
              </button>
            )}
            {activeTab === 'quiz' && (
              <button onClick={() => openCreateQuiz('mcq')} className="flex items-center gap-2 bg-red-800 hover:bg-red-900 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg transition-all">
                <span className="material-symbols-outlined text-sm">add</span> Tạo Bộ Quiz Tổng Hợp
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setActiveTab('flashcard')}
            className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'flashcard'
                ? 'border-red-500 text-red-400 font-bold bg-slate-900/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🎴 Flashcard Ôn Tập
          </button>
          <button
            onClick={() => setActiveTab('matching')}
            className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'matching'
                ? 'border-red-500 text-red-400 font-bold bg-slate-900/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🧩 Ghép Cặp (Shinkei)
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'quiz'
                ? 'border-red-500 text-red-400 font-bold bg-slate-900/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            📝 Quiz Tổng Hợp
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-red-500 text-5xl animate-spin">sync</span>
            <p className="text-slate-400 mt-4">Đang tải cấu trúc dữ liệu luyện tập...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* TAB 1: FLASHCARDS TREE */}
            {activeTab === 'flashcard' && (
              treeData.length === 0 ? (
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
                      <div key={course.id} className="bg-slate-950 rounded-2xl border border-slate-800 shadow-lg overflow-hidden text-left">
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
                                                          <button onClick={() => openEditFc(fc)} className="p-1 hover:bg-slate-800 text-blue-400 rounded transition-colors" title="Chỉnh sửa">
                                                            <span className="material-symbols-outlined text-base">edit</span>
                                                          </button>
                                                          <button onClick={() => handleFcDelete(fc.id)} className="p-1 hover:bg-slate-800 text-red-400 rounded transition-colors" title="Xóa">
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
              )
            )}

            {/* TAB 2: MATCHING GAMES (SHINKEI) */}
            {activeTab === 'matching' && (
              <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-900/50 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-4">Tên Trò Chơi</th>
                        <th className="p-4">Bài học liên kết (Node)</th>
                        <th className="p-4">Số lượng cặp thẻ</th>
                        <th className="p-4 text-center">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {matchingGames.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="p-8 text-center text-slate-550">Chưa có trò chơi ghép cặp nào được khởi tạo.</td>
                        </tr>
                      ) : (
                        matchingGames.map((q) => (
                          <tr key={q.id} className="hover:bg-slate-900/30">
                            <td className="p-4 font-bold text-slate-200">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-emerald-500">grid_view</span>
                                <span>{q.title}</span>
                              </div>
                            </td>
                            <td className="p-4 text-slate-400">{q.node?.title || 'Toàn cục'}</td>
                            <td className="p-4 font-mono text-slate-400">
                              {Array.isArray(q.questions) ? `${q.questions.length} cặp` : '0'}
                            </td>
                            <td className="p-4 flex justify-center gap-2">
                              <button onClick={() => openEditQuiz(q)} className="p-2 hover:bg-slate-800 text-blue-400 rounded-lg transition-colors">
                                <span className="material-symbols-outlined text-sm">edit</span>
                              </button>
                              <button onClick={() => handleQuizDelete(q.id)} className="p-2 hover:bg-slate-800 text-red-400 rounded-lg transition-colors">
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

            {/* TAB 3: MCQ & OTHER QUIZZES */}
            {activeTab === 'quiz' && (
              <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-900/50 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-4">Tiêu đề Quiz</th>
                        <th className="p-4">Loại hình</th>
                        <th className="p-4">Bài học liên kết (Node)</th>
                        <th className="p-4">Số lượng câu hỏi</th>
                        <th className="p-4 text-center">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {otherQuizzes.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-slate-550">Chưa có bộ đề trắc nghiệm/tự luận nào được tạo lập.</td>
                        </tr>
                      ) : (
                        otherQuizzes.map((q) => (
                          <tr key={q.id} className="hover:bg-slate-900/30">
                            <td className="p-4 font-bold text-slate-200">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-red-500">quiz</span>
                                <span>{q.title}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 rounded text-xs font-bold uppercase border bg-red-950/40 text-red-400 border-red-900/50">
                                {q.type.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-4 text-slate-400">{q.node?.title || 'Toàn cục'}</td>
                            <td className="p-4 font-mono text-slate-400">
                              {Array.isArray(q.questions) ? `${q.questions.length} câu` : '0'}
                            </td>
                            <td className="p-4 flex justify-center gap-2">
                              <button onClick={() => openEditQuiz(q)} className="p-2 hover:bg-slate-800 text-blue-400 rounded-lg transition-colors">
                                <span className="material-symbols-outlined text-sm">edit</span>
                              </button>
                              <button onClick={() => handleQuizDelete(q.id)} className="p-2 hover:bg-slate-800 text-red-400 rounded-lg transition-colors">
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
          </div>
        )}

        {/* MODAL 1: FLASHCARD CREATE/EDIT */}
        {fcModal.isOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-950 rounded-2xl border border-slate-800 w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-6">
              <div className="flex justify-between items-center text-left">
                <h3 className="text-xl font-bold text-slate-100">
                  {fcModal.type === 'create' ? 'Tạo Thẻ nhớ mới' : 'Chỉnh sửa Thẻ nhớ'}
                </h3>
                <button onClick={() => setFcModal({ isOpen: false, type: 'create', flashcard: null })} className="text-slate-500 hover:text-slate-300">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <form onSubmit={handleFcSubmit} className="space-y-4 text-left">
                {fcModal.type === 'create' && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Bài học liên kết (Concept Node)</label>
                    <select
                      value={fcForm.nodeId}
                      onChange={(e) => setFcForm({ ...fcForm, nodeId: e.target.value })}
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
                    placeholder="Ví dụ: Vật chất, Ý thức..."
                    value={fcForm.tag}
                    onChange={(e) => setFcForm({ ...fcForm, tag: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-650 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Câu hỏi (Mặt trước)</label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Câu hỏi ôn tập..."
                    value={fcForm.question}
                    onChange={(e) => setFcForm({ ...fcForm, question: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-650 focus:outline-none focus:border-red-500 transition-colors resize-none"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Đáp án (Mặt sau)</label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Đáp án chuẩn..."
                    value={fcForm.answer}
                    onChange={(e) => setFcForm({ ...fcForm, answer: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-650 focus:outline-none focus:border-red-500 transition-colors resize-none"
                  />
                </div>
                
                <button type="submit" className="w-full bg-red-800 hover:bg-red-900 text-white font-bold py-3 rounded-xl transition-colors">
                  {fcModal.type === 'create' ? 'Tạo Thẻ nhớ' : 'Lưu thay đổi'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: QUIZZES/GAMES CREATE/EDIT */}
        {quizModal.isOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-950 rounded-2xl border border-slate-800 w-full max-w-2xl max-h-[85vh] shadow-2xl overflow-y-auto p-6 space-y-6">
              <div className="flex justify-between items-center text-left">
                <h3 className="text-xl font-bold text-slate-100">
                  {quizModal.type === 'create' ? (quizForm.type === 'matching' ? 'Tạo Trò chơi Ghép cặp' : 'Tạo Bộ Quiz mới') : 'Chỉnh sửa'}
                </h3>
                <button onClick={() => setQuizModal({ isOpen: false, type: 'create', quiz: null })} className="text-slate-500 hover:text-slate-300">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleQuizSubmit} className="space-y-6 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Bài học liên kết</label>
                    <select
                      value={quizForm.nodeId}
                      onChange={(e) => setQuizForm({ ...quizForm, nodeId: e.target.value })}
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
                    {quizForm.type === 'matching' ? (
                      <input
                        type="text"
                        disabled
                        value="Trò chơi Ghép Cặp (Shinkei)"
                        className="w-full bg-slate-900/50 border border-slate-800/80 rounded-xl px-4 py-2.5 text-slate-400 cursor-not-allowed"
                      />
                    ) : (
                      <select
                        value={quizForm.type}
                        onChange={(e) => setQuizForm({ ...quizForm, type: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-red-500 transition-colors"
                      >
                        <option value="mcq">Trắc nghiệm tổng hợp (MCQ)</option>
                        <option value="essay">Tự luận biện chứng (Essay)</option>
                        <option value="image">Đoán ảnh triết học (Image Guess)</option>
                        <option value="analysis">Phân tích học thuyết (Analysis)</option>
                      </select>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tiêu đề</label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập tiêu đề học thuật..."
                    value={quizForm.title}
                    onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-650 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mô tả hướng dẫn</label>
                  <textarea
                    rows="2"
                    placeholder="Mô tả cho học viên..."
                    value={quizForm.description}
                    onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-650 focus:outline-none focus:border-red-500 transition-colors resize-none"
                  />
                </div>

                {/* DYNAMIC FORMS */}
                <div className="border-t border-slate-800 pt-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-red-400 uppercase tracking-wider">Cấu trúc bộ câu hỏi</h4>
                    {quizForm.type === 'matching' && (
                      <button type="button" onClick={addMatchingPair} className="bg-slate-900 hover:bg-slate-850 border border-slate-800 px-3 py-1 rounded text-xs text-slate-300 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">add</span> Thêm cặp thẻ
                      </button>
                    )}
                    {(quizForm.type === 'mcq' || quizForm.type === 'image' || quizForm.type === 'analysis') && (
                      <button type="button" onClick={addMcqQuestion} className="bg-slate-900 hover:bg-slate-850 border border-slate-800 px-3 py-1 rounded text-xs text-slate-300 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">add</span> Thêm câu hỏi
                      </button>
                    )}
                    {quizForm.type === 'essay' && (
                      <button type="button" onClick={addEssayPrompt} className="bg-slate-900 hover:bg-slate-850 border border-slate-800 px-3 py-1 rounded text-xs text-slate-300 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">add</span> Thêm tự luận
                      </button>
                    )}
                  </div>

                  {/* 1. MATCHING GAPE PAIRS */}
                  {quizForm.type === 'matching' && (
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
                              placeholder="Định nghĩa tương ứng..."
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

                  {/* 2. MCQ / IMAGE / ANALYSIS */}
                  {(quizForm.type === 'mcq' || quizForm.type === 'image' || quizForm.type === 'analysis') && (
                    <div className="space-y-4">
                      {mcqQuestions.map((mcq, qIdx) => (
                        <div key={qIdx} className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-3">
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-grow">
                              <label className="text-[10px] text-slate-555 font-bold block mb-1">Câu hỏi {qIdx + 1}</label>
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
                              <button type="button" onClick={() => removeMcqQuestion(qIdx)} className="text-red-550 hover:text-red-450 mt-5">
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
                            <label className="text-[10px] text-slate-555 font-bold block mb-1">Lựa chọn đúng (Đáp án)</label>
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
                  {quizForm.type === 'essay' && (
                    <div className="space-y-3">
                      {essayPrompts.map((essay, index) => (
                        <div key={index} className="flex gap-3 items-start bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              required
                              placeholder="Câu hỏi tự luận..."
                              value={essay.question}
                              onChange={(e) => updateEssayPrompt(index, 'question', e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100"
                            />
                            <textarea
                              rows="2"
                              required
                              placeholder="Gợi ý/Đáp án..."
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
                  Lưu Thông Tin
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminPageShell>
  );
}
