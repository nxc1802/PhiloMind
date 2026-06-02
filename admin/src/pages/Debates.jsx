import React, { useState, useEffect, useCallback } from 'react';
import AdminPageShell from '../components/AdminPageShell';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

export default function Debates() {
  const { showToast } = useToast();
  
  // Tabs: 'history' or 'topics'
  const [activeTab, setActiveTab] = useState('history');
  
  // Data States
  const [debates, setDebates] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [historyModal, setHistoryModal] = useState({ isOpen: false, debate: null });
  const [topicModal, setTopicModal] = useState({ isOpen: false, type: 'create', topic: null });
  
  // Topic Form State
  const [topicForm, setTopicForm] = useState({
    title: '',
    description: '',
    initialPrompt: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'history') {
        const list = await api.debates.list();
        setDebates(list);
      } else {
        const list = await api.debateTopics.list();
        setTopics(list);
      }
    } catch (err) {
      showToast('Lỗi tải dữ liệu tranh biện: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ==================== HISTORY HANDLERS ====================
  const openHistoryView = (d) => {
    setHistoryModal({ isOpen: true, debate: d });
  };

  const handleDeleteHistory = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lịch sử phiên tranh luận này?')) return;
    try {
      await api.debates.delete(id);
      showToast('Xóa phiên tranh luận thành công!', 'success');
      loadData();
    } catch (err) {
      showToast('Xóa phiên tranh luận thất bại: ' + err.message, 'error');
    }
  };

  // ==================== TOPICS CRUD HANDLERS ====================
  const openCreateTopic = () => {
    setTopicModal({ isOpen: true, type: 'create', topic: null });
    setTopicForm({
      title: '',
      description: '',
      initialPrompt: '',
    });
  };

  const openEditTopic = (topic) => {
    setTopicModal({ isOpen: true, type: 'edit', topic });
    setTopicForm({
      title: topic.title,
      description: topic.description,
      initialPrompt: topic.initialPrompt,
    });
  };

  const handleSubmitTopic = async (e) => {
    e.preventDefault();
    try {
      if (topicModal.type === 'create') {
        await api.debateTopics.create(topicForm);
        showToast('Tạo kịch bản tranh biện thành công!', 'success');
      } else {
        await api.debateTopics.update(topicModal.topic.id, topicForm);
        showToast('Cập nhật kịch bản tranh biện thành công!', 'success');
      }
      setTopicModal({ isOpen: false, type: 'create', topic: null });
      loadData();
    } catch (err) {
      showToast('Thao tác kịch bản thất bại: ' + err.message, 'error');
    }
  };

  const handleDeleteTopic = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa kịch bản tranh luận này? Việc này không xóa lịch sử hiện có nhưng học viên sẽ không chọn được kịch bản này nữa.')) return;
    try {
      await api.debateTopics.delete(id);
      showToast('Xóa kịch bản thành công!', 'success');
      loadData();
    } catch (err) {
      showToast('Xóa kịch bản thất bại: ' + err.message, 'error');
    }
  };

  return (
    <AdminPageShell activeKey="debates">
      <div className="space-y-8">
        
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Học viện Tranh luận AI</h1>
            <p className="text-slate-400 mt-1">Giám sát các cuộc phản biện Socratic và quản lý kịch bản, chủ đề tranh luận học thuật.</p>
          </div>
          
          {activeTab === 'topics' && (
            <button onClick={openCreateTopic} className="flex items-center gap-2 bg-red-800 hover:bg-red-900 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg transition-colors">
              <span className="material-symbols-outlined text-sm">add</span> Thêm Kịch Bản Mới
            </button>
          )}
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 p-1.5 bg-slate-950 rounded-xl border border-slate-800/80 w-fit">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs transition-colors ${
              activeTab === 'history'
                ? 'bg-slate-900 text-red-500 shadow-sm border border-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-sm">history</span> Lịch sử tranh biện
          </button>
          <button
            onClick={() => setActiveTab('topics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs transition-colors ${
              activeTab === 'topics'
                ? 'bg-slate-900 text-amber-500 shadow-sm border border-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-sm">question_answer</span> Quản lý Kịch bản (Topics)
          </button>
        </div>

        {/* Main Content Area */}
        {loading ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-red-500 text-5xl animate-spin">sync</span>
            <p className="text-slate-400 mt-4">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
            {activeTab === 'history' ? (
              
              /* TAB 1: HISTORY TABLE */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-900/50 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-4">Học viên</th>
                      <th className="p-4">Phân loại & Điểm tranh luận</th>
                      <th className="p-4 text-center">Số lượt hội thoại</th>
                      <th className="p-4 text-center">Chi tiết</th>
                      <th className="p-4 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {debates.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-slate-500">Chưa có cuộc tranh luận nào được thực hiện.</td>
                      </tr>
                    ) : (
                      debates.map((d) => (
                        <tr key={d.id} className="hover:bg-slate-900/30">
                          <td className="p-4 font-bold text-slate-200">{d.user?.name || 'Học viên ẩn danh'}</td>
                          <td className="p-4 text-slate-400">
                            {d.topic ? (
                              <span className="flex items-center gap-1.5 text-amber-500 text-xs">
                                <span className="material-symbols-outlined text-xs">category</span>
                                Kịch bản: {d.topic.title}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-blue-400 text-xs">
                                <span className="material-symbols-outlined text-xs">book</span>
                                Lý thuyết: {d.node?.title || 'N/A'}
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-center text-slate-300 font-semibold">
                            {Array.isArray(d.transcript) ? d.transcript.length : 0} tin nhắn
                          </td>
                          <td className="p-4 text-center">
                            <button onClick={() => openHistoryView(d)} className="bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-1 rounded text-xs font-bold text-slate-300 transition-colors">
                              Xem Kịch Bản
                            </button>
                          </td>
                          <td className="p-4 flex justify-center gap-2">
                            <button onClick={() => handleDeleteHistory(d.id)} className="p-2 hover:bg-slate-800 text-red-400 rounded-lg transition-colors" title="Xóa">
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              
              /* TAB 2: TOPICS TABLE */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-900/50 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-4">Kịch bản (Topic)</th>
                      <th className="p-4">Mô tả tóm tắt</th>
                      <th className="p-4">Prompt Socratic mở đầu</th>
                      <th className="p-4 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {topics.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-8 text-center text-slate-500">Chưa có kịch bản tranh luận AI nào được cấu hình.</td>
                      </tr>
                    ) : (
                      topics.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-900/30">
                          <td className="p-4 font-bold text-amber-500">{t.title}</td>
                          <td className="p-4 text-slate-400 max-w-xs truncate">{t.description}</td>
                          <td className="p-4 text-xs font-mono text-slate-500 max-w-md truncate">{t.initialPrompt}</td>
                          <td className="p-4 flex justify-center gap-2">
                            <button onClick={() => openEditTopic(t)} className="p-2 hover:bg-slate-800 text-blue-400 rounded-lg transition-colors" title="Sửa kịch bản">
                              <span className="material-symbols-outlined text-sm">edit</span>
                            </button>
                            <button onClick={() => handleDeleteTopic(t.id)} className="p-2 hover:bg-slate-800 text-red-400 rounded-lg transition-colors" title="Xóa">
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* History Transcript View Modal */}
        {historyModal.isOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-950 rounded-2xl border border-slate-800 w-full max-w-2xl shadow-2xl overflow-hidden p-6 space-y-6 flex flex-col max-h-[85vh]">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-slate-100">Chi tiết đối thoại phản biện</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Học viên: {historyModal.debate.user?.name || 'Học viên'} | Loạị hình: {historyModal.debate.topic ? `Chủ đề "${historyModal.debate.topic.title}"` : `Bài lý thuyết "${historyModal.debate.node?.title}"`}
                  </p>
                </div>
                <button onClick={() => setHistoryModal({ isOpen: false, debate: null })} className="text-slate-500 hover:text-slate-300">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {Array.isArray(historyModal.debate.transcript) && historyModal.debate.transcript.map((msg, idx) => (
                  <div key={idx} className={`p-4 rounded-2xl max-w-[85%] border ${
                    msg.speaker === 'User'
                      ? 'bg-red-950/20 border-red-900/30 text-slate-200 ml-auto'
                      : 'bg-slate-900 border-slate-800 text-slate-300 mr-auto'
                  }`}>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      {msg.speaker === 'User' ? 'Học viên (User)' : 'Socratic AI Bot'}
                    </p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Topic CRUD Modal */}
        {topicModal.isOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-950 rounded-2xl border border-slate-800 w-full max-w-lg shadow-2xl overflow-hidden p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-100">
                  {topicModal.type === 'create' ? 'Tạo kịch bản tranh luận' : 'Chỉnh sửa kịch bản'}
                </h3>
                <button onClick={() => setTopicModal({ isOpen: false, type: 'create', topic: null })} className="text-slate-500 hover:text-slate-300">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleSubmitTopic} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tiêu đề kịch bản (Topic Title)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Tính khách quan của Vật chất"
                    value={topicForm.title}
                    onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mô tả ngắn (Description)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Debate về lập luận vật chất có trước ý thức..."
                    value={topicForm.description}
                    onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Lời mở đầu phái Socratic (Initial Prompt)</label>
                  <textarea
                    rows="6"
                    required
                    placeholder="Ví dụ: Xin chào đồng chí! Tôi có một luận điểm muốn phản biện cùng đồng chí: 'Ý thức quyết định vật chất'. Đồng chí có thể đưa ra dẫn chứng để bênh vực lập trường khách quan biện chứng của mình không?"
                    value={topicForm.initialPrompt}
                    onChange={(e) => setTopicForm({ ...topicForm, initialPrompt: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-red-500 transition-colors resize-none text-sm leading-relaxed"
                  />
                  <p className="text-[10px] text-slate-500">Đây là phản hồi đầu tiên của AI khi học viên bắt đầu nhấn chọn tranh biện cho chủ đề này.</p>
                </div>

                <button type="submit" className="w-full bg-red-800 hover:bg-red-900 text-white font-bold py-3 rounded-xl transition-colors shadow-lg">
                  {topicModal.type === 'create' ? 'Tạo kịch bản' : 'Lưu kịch bản'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </AdminPageShell>
  );
}
