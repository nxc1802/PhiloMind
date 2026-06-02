import React, { useState, useEffect, useCallback } from 'react';
import AdminPageShell from '../components/AdminPageShell';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

export default function Chapters() {
  const { showToast } = useToast();
  const [chapters, setChapters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, type: 'create', chapter: null });
  const [form, setForm] = useState({ title: '', orderIndex: 1, courseId: '', parentChapterId: '' });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [chapList, courseList] = await Promise.all([
        api.chapters.list(),
        api.courses.list(),
      ]);
      setChapters(chapList);
      setCourses(courseList);
    } catch (err) {
      showToast('Lỗi tải dữ liệu chương học: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreate = () => {
    setModal({ isOpen: true, type: 'create', chapter: null });
    setForm({
      title: '',
      orderIndex: chapters.length + 1,
      courseId: courses.length > 0 ? courses[0].id : '',
      parentChapterId: '',
    });
  };

  const openEdit = (chapter) => {
    setModal({ isOpen: true, type: 'edit', chapter });
    setForm({
      title: chapter.title,
      orderIndex: chapter.orderIndex,
      courseId: chapter.courseId,
      parentChapterId: chapter.parentChapterId || '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modal.type === 'create') {
        await api.chapters.create({
          title: form.title,
          orderIndex: Number(form.orderIndex),
          courseId: form.courseId,
          parentChapterId: form.parentChapterId || null,
        });
        showToast('Tạo chương học thành công!', 'success');
      } else {
        await api.chapters.update(modal.chapter.id, {
          title: form.title,
          orderIndex: Number(form.orderIndex),
          parentChapterId: form.parentChapterId || null,
        });
        showToast('Cập nhật chương học thành công!', 'success');
      }
      setModal({ isOpen: false, type: 'create', chapter: null });
      loadData();
    } catch (err) {
      showToast('Thao tác thất bại: ' + err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa chương này? Việc này sẽ xóa toàn bộ concept nodes, flashcards và podcasts trực thuộc.')) return;
    try {
      await api.chapters.delete(id);
      showToast('Xóa chương học thành công!', 'success');
      loadData();
    } catch (err) {
      showToast('Xóa thất bại: ' + err.message, 'error');
    }
  };

  return (
    <AdminPageShell activeKey="chapters">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Quản lý Chương học</h1>
            <p className="text-slate-400 mt-1">Quản lý các chương lớn phân đoạn giáo trình bài giảng.</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-red-800 hover:bg-red-900 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg transition-colors">
            <span className="material-symbols-outlined text-sm">add</span> Thêm Chương học
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-red-500 text-5xl animate-spin">sync</span>
            <p className="text-slate-400 mt-4">Đang tải danh sách chương học...</p>
          </div>
        ) : (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/50 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-4">Chương học</th>
                    <th className="p-4 text-center">Thứ tự</th>
                    <th className="p-4 text-center">Số bài học</th>
                    <th className="p-4 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {chapters.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-slate-500">Chưa có chương học nào được tạo.</td>
                    </tr>
                  ) : (
                    chapters.map((ch) => {
                      return (
                        <tr key={ch.id} className="hover:bg-slate-900/30">
                          <td className="p-4 font-bold text-slate-200">{ch.title}</td>
                          <td className="p-4 text-center text-slate-300 font-semibold">{ch.orderIndex}</td>
                          <td className="p-4 text-center">
                            <span className="bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 text-xs text-slate-400">
                              {ch._count?.nodes || 0} bài học
                            </span>
                          </td>
                          <td className="p-4 flex justify-center gap-2">
                            <button onClick={() => openEdit(ch)} className="p-2 hover:bg-slate-800 text-blue-400 rounded-lg transition-colors" title="Chỉnh sửa">
                              <span className="material-symbols-outlined text-sm">edit</span>
                            </button>
                            <button onClick={() => handleDelete(ch.id)} className="p-2 hover:bg-slate-800 text-red-400 rounded-lg transition-colors" title="Xóa">
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create/Edit Modal */}
        {modal.isOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-950 rounded-2xl border border-slate-800 w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-100">
                  {modal.type === 'create' ? 'Thêm Chương mới' : 'Chỉnh sửa Chương'}
                </h3>
                <button onClick={() => setModal({ isOpen: false, type: 'create', chapter: null })} className="text-slate-500 hover:text-slate-300">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tên chương học</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Chương 1: Khái lược về triết học"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
                {/* Hóa giải cơ chế đa khóa học, mặc định liên kết với khóa học Triết học Mác – Lênin duy nhất */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Thuộc Chương Cha (Optional / Tạo Sub-chapter)</label>
                  <select
                    value={form.parentChapterId}
                    onChange={(e) => setForm({ ...form, parentChapterId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-red-500 transition-colors"
                  >
                    <option value="">-- Chọn Chương Cha (Không có) --</option>
                    {chapters
                      .filter(ch => ch.courseId === form.courseId && (!modal.chapter || ch.id !== modal.chapter.id) && !ch.parentChapterId)
                      .map((ch) => (
                        <option key={ch.id} value={ch.id}>{ch.title}</option>
                      ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Thứ tự hiển thị (Order Index)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.orderIndex}
                    onChange={(e) => setForm({ ...form, orderIndex: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
                <button type="submit" className="w-full bg-red-800 hover:bg-red-900 text-white font-bold py-3 rounded-xl transition-colors">
                  {modal.type === 'create' ? 'Tạo Chương học' : 'Lưu thay đổi'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminPageShell>
  );
}
