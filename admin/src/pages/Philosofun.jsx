import React, { useState, useEffect, useCallback } from 'react';
import AdminPageShell from '../components/AdminPageShell';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

export default function Philosofun() {
  const { showToast } = useToast();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formType, setFormType] = useState('create'); // 'create' | 'edit'
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.philosofun.list();
      setVideos(res || []);
    } catch (err) {
      showToast('Lỗi tải danh sách video: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreate = () => {
    setFormType('create');
    setSelectedId(null);
    setForm({ title: '', description: '', videoUrl: '' });
    setIsModalOpen(true);
  };

  const openEdit = (video) => {
    setFormType('edit');
    setSelectedId(video.id);
    setForm({
      title: video.title,
      description: video.description || '',
      videoUrl: video.videoUrl,
    });
    setIsModalOpen(false); // Make sure it's reset first
    setTimeout(() => setIsModalOpen(true), 50);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.videoUrl) {
      showToast('Vui lòng nhập đầy đủ tiêu đề và liên kết video', 'warning');
      return;
    }

    try {
      if (formType === 'create') {
        await api.philosofun.create(form);
        showToast('Đăng video thành công!', 'success');
      } else {
        await api.philosofun.update(selectedId, form);
        showToast('Cập nhật video thành công!', 'success');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      showToast('Thao tác thất bại: ' + err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Đồng chí chắc chắn muốn xóa video này khỏi hệ thống?')) return;
    try {
      await api.philosofun.delete(id);
      showToast('Đã xóa video thành công!', 'success');
      loadData();
    } catch (err) {
      showToast('Xóa video thất bại: ' + err.message, 'error');
    }
  };

  const getYoutubeId = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  };

  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(search.toLowerCase()) ||
    (v.description && v.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AdminPageShell activeKey="philosofun">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <span className="material-symbols-outlined text-red-500 text-4xl">smart_display</span>
            Quản lý Philosofun
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Nơi đăng tải và quản lý các video tình huống, kịch bản triết học hấp dẫn cho học viên.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="bg-red-800 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all self-start md:self-auto"
        >
          <span className="material-symbols-outlined">add</span>
          Thêm video mới
        </button>
      </div>

      {/* Filter and search */}
      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm video tình huống..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-red-800 transition-colors"
          />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            search
          </span>
        </div>
      </div>

      {/* Content list */}
      {loading ? (
        <div className="text-center py-20 bg-slate-950 rounded-2xl border border-slate-800">
          <span className="material-symbols-outlined animate-spin text-4xl text-red-500">sync</span>
          <p className="text-slate-400 mt-2">Đang tải danh sách video...</p>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="text-center py-20 bg-slate-950 rounded-2xl border border-slate-800 border-dashed">
          <span className="material-symbols-outlined text-slate-650 text-5xl mb-3">video_library</span>
          <h3 className="font-bold text-slate-300 text-lg">Chưa có video tình huống nào</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            {search ? 'Không tìm thấy video nào khớp với từ khóa tìm kiếm.' : 'Hãy đăng tải video YouTube đầu tiên để học viên cùng thưởng thức và suy ngẫm.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => {
            const ytId = getYoutubeId(video.videoUrl);
            return (
              <div key={video.id} className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex flex-col hover:border-slate-700 transition-all">
                {/* Thumbnail / Video */}
                <div className="aspect-video bg-slate-900 relative group">
                  {ytId ? (
                    <img
                      src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-900">
                      <span className="material-symbols-outlined text-4xl">broken_image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-3">
                    <button
                      onClick={() => openEdit(video)}
                      className="h-10 w-10 bg-slate-850 hover:bg-slate-800 text-white rounded-full flex items-center justify-center transition-all"
                      title="Chỉnh sửa"
                    >
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="h-10 w-10 bg-red-950/80 hover:bg-red-900 text-red-400 rounded-full flex items-center justify-center transition-all"
                      title="Xóa"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base leading-snug line-clamp-2" title={video.title}>
                      {video.title}
                    </h3>
                    <p className="text-slate-400 text-xs mt-2 line-clamp-3">
                      {video.description || 'Không có mô tả.'}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-2xs text-slate-500">
                    <span className="truncate max-w-[180px]" title={video.videoUrl}>
                      🔗 {video.videoUrl}
                    </span>
                    <span>
                      {new Date(video.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white text-lg">
                {formType === 'create' ? 'Thêm video tình huống mới' : 'Chỉnh sửa video tình huống'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-1.5">
                  Tiêu đề video
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ví dụ: Nghịch lý Con tàu của Theseus và bài học bản sắc"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 outline-none focus:border-red-800"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-1.5">
                  Mô tả tình huống
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Mô tả tóm tắt nội dung và câu hỏi suy ngẫm cho học viên..."
                  rows="3"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 outline-none focus:border-red-800 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-1.5">
                  YouTube Video URL
                </label>
                <input
                  type="url"
                  required
                  value={form.videoUrl}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 outline-none focus:border-red-800"
                />
              </div>

              {getYoutubeId(form.videoUrl) && (
                <div className="aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
                  <iframe
                    title="youtube-preview"
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${getYoutubeId(form.videoUrl)}`}
                    frameBorder="0"
                    allowFullScreen
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-850 hover:bg-slate-800 text-slate-300 font-semibold px-5 py-2.5 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-red-800 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md"
                >
                  {formType === 'create' ? 'Đăng ngay' : 'Cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminPageShell>
  );
}
