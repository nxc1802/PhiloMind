import React, { useState, useEffect, useCallback } from 'react';
import AdminPageShell from '../components/AdminPageShell';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

export default function Podcasts() {
  const { showToast } = useToast();
  const [podcasts, setPodcasts] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [synthesizing, setSynthesizing] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: 'create', podcast: null });
  
  const [scriptText, setScriptText] = useState('');
  const [form, setForm] = useState({
    nodeId: '',
    audioUrl: '',
    transcript: '[]',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pList, nList] = await Promise.all([
        api.podcasts.list(),
        api.nodes.list(),
      ]);
      setPodcasts(pList);
      setNodes(nList);
    } catch (err) {
      showToast('Lỗi tải dữ liệu Podcasts: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreate = () => {
    setModal({ isOpen: true, type: 'create', podcast: null });
    setScriptText('Chào mừng các bạn học sinh đến với bài giảng hôm nay. Chúng ta sẽ cùng nhau thảo luận về các quy luật cơ bản của phép biện chứng duy vật.');
    setForm({
      nodeId: nodes.length > 0 ? nodes[0].id : '',
      audioUrl: '',
      transcript: '[]',
    });
  };

  const openEdit = (p) => {
    setModal({ isOpen: true, type: 'edit', podcast: p });
    setScriptText('');
    setForm({
      nodeId: p.nodeId,
      audioUrl: p.audioUrl,
      transcript: JSON.stringify(p.transcript, null, 2),
    });
  };

  const handleSynthesize = async () => {
    if (!form.nodeId) {
      showToast('Vui lòng chọn bài học liên kết trước.', 'warning');
      return;
    }
    if (!scriptText.trim()) {
      showToast('Vui lòng nhập kịch bản lời thoại cần chuyển đổi.', 'warning');
      return;
    }

    setSynthesizing(true);
    try {
      showToast('Đang tiến hành chuyển đổi TTS & sinh podcast preview...', 'info');
      const result = await api.podcasts.synthesize(form.nodeId, scriptText);
      setForm({
        ...form,
        audioUrl: result.audioUrl,
        transcript: JSON.stringify(result.transcript, null, 2),
      });
      showToast('Tổng hợp TTS thành công! Hãy nghe thử bản Preview.', 'success');
    } catch (err) {
      showToast('Chuyển đổi TTS thất bại: ' + err.message, 'error');
    } finally {
      setSynthesizing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.audioUrl) {
      showToast('Vui lòng nhập hoặc chạy TTS để sinh Audio URL.', 'warning');
      return;
    }

    let parsedTranscript;
    try {
      parsedTranscript = JSON.parse(form.transcript);
    } catch (_) {
      showToast('Lỗi: Kịch bản (transcript) phải là định dạng JSON mảng hợp lệ.', 'error');
      return;
    }

    try {
      if (modal.type === 'create') {
        await api.podcasts.create({
          nodeId: form.nodeId,
          audioUrl: form.audioUrl,
          transcript: parsedTranscript,
        });
        showToast('Tạo Podcast thành công!', 'success');
      } else {
        await api.podcasts.update(modal.podcast.id, {
          audioUrl: form.audioUrl,
          transcript: parsedTranscript,
        });
        showToast('Cập nhật Podcast thành công!', 'success');
      }
      setModal({ isOpen: false, type: 'create', podcast: null });
      loadData();
    } catch (err) {
      showToast('Thao tác thất bại: ' + err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa Podcast này?')) return;
    try {
      await api.podcasts.delete(id);
      showToast('Xóa Podcast thành công!', 'success');
      loadData();
    } catch (err) {
      showToast('Xóa Podcast thất bại: ' + err.message, 'error');
    }
  };

  return (
    <AdminPageShell activeKey="podcasts">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Quản lý Podcasts bài giảng</h1>
            <p className="text-slate-400 mt-1">Hệ thống sản xuất podcast tự động: Nhập kịch bản, chạy TTS nghe thử preview, và xuất bản bài giảng cho học viên.</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-red-800 hover:bg-red-900 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg transition-colors">
            <span className="material-symbols-outlined text-sm">add</span> Thêm & Chuyển TTS Podcast
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-red-500 text-5xl animate-spin">sync</span>
            <p className="text-slate-400 mt-4">Đang tải danh sách Podcasts...</p>
          </div>
        ) : (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/50 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-4">Bài học liên kết</th>
                    <th className="p-4">Âm thanh bài giảng</th>
                    <th className="p-4 text-center">Số phân đoạn thoại</th>
                    <th className="p-4 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {podcasts.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-slate-500">Chưa có Podcast học tập nào được tạo.</td>
                    </tr>
                  ) : (
                    podcasts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-900/30">
                        <td className="p-4 font-bold text-slate-200">{p.node?.title || 'N/A'}</td>
                        <td className="p-4 text-slate-400">
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-red-500">mic</span>
                            <audio controls className="h-8 max-w-[240px]" src={p.audioUrl} />
                          </div>
                        </td>
                        <td className="p-4 text-center text-slate-300 font-semibold">
                          {Array.isArray(p.transcript) ? p.transcript.length : 0} câu thoại
                        </td>
                        <td className="p-4 flex justify-center gap-2">
                          <button onClick={() => openEdit(p)} className="p-2 hover:bg-slate-800 text-blue-400 rounded-lg transition-colors" title="Chỉnh sửa">
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-slate-800 text-red-400 rounded-lg transition-colors" title="Xóa">
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
            <div className="bg-slate-950 rounded-2xl border border-slate-800 w-full max-w-xl shadow-2xl overflow-hidden p-6 space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-100">
                  {modal.type === 'create' ? 'Tạo Podcast & Chuyển TTS' : 'Chỉnh sửa Podcast'}
                </h3>
                <button onClick={() => setModal({ isOpen: false, type: 'create', podcast: null })} className="text-slate-500 hover:text-slate-300">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
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

                {modal.type === 'create' && (
                  <div className="space-y-2 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
                    <label className="text-xs font-semibold uppercase tracking-wider text-amber-500 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">edit_note</span> Nhập Kịch bản lời thoại TTS (Tiếng Việt)
                    </label>
                    <textarea
                      rows="4"
                      placeholder="Nhập nội dung bài giảng để sinh âm thanh tự động qua hệ thống TTS..."
                      value={scriptText}
                      onChange={(e) => setScriptText(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-amber-500 transition-colors resize-none"
                    />
                    <button
                      type="button"
                      disabled={synthesizing}
                      onClick={handleSynthesize}
                      className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      {synthesizing ? (
                        <>
                          <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                          Đang sinh giọng nói và phân cảnh...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-sm">settings_voice</span>
                          Chạy giọng nói TTS & Xem thử (Synthesize Audio)
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Preview Audio section if available */}
                {form.audioUrl && (
                  <div className="space-y-2 bg-red-950/20 p-4 rounded-xl border border-red-900/30">
                    <label className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">play_circle</span> Nghe thử bản ghi Podcast (Preview Player)
                    </label>
                    <audio src={form.audioUrl} controls className="w-full mt-1 accent-red-600" />
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-green-400">check_circle</span>
                      Âm thanh đã được lưu tạm trên đám mây. Click Submit để xuất bản chính thức.
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Đường dẫn file âm thanh chính thức</label>
                  <input
                    type="text"
                    required
                    placeholder="Chạy TTS ở trên để tự động điền hoặc nhập URL thủ công..."
                    value={form.audioUrl}
                    onChange={(e) => setForm({ ...form, audioUrl: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-red-500 transition-colors text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Kịch bản đàm thoại (JSON Transcript)</label>
                  <textarea
                    rows="5"
                    required
                    placeholder='[{"time": 0, "speaker": "Host", "text": "Buổi học..."}]'
                    value={form.transcript}
                    onChange={(e) => setForm({ ...form, transcript: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-mono placeholder:text-slate-600 focus:outline-none focus:border-red-500 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!form.audioUrl}
                  className="w-full bg-red-800 hover:bg-red-900 disabled:bg-slate-800 text-white font-bold py-3 rounded-xl transition-colors shadow-lg"
                >
                  {modal.type === 'create' ? 'Tạo Podcast & Xuất bản' : 'Lưu thay đổi'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminPageShell>
  );
}
