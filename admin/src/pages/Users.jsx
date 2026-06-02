import React, { useState, useEffect, useCallback } from 'react';
import AdminPageShell from '../components/AdminPageShell';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

export default function Users() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState({ isOpen: false, user: null });
  const [editForm, setEditForm] = useState({ name: '', email: '', streak: 0 });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const list = await api.users.list();
      setUsers(list);
    } catch (err) {
      showToast('Lỗi tải danh sách học viên: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const openEdit = (user) => {
    setEditModal({ isOpen: true, user });
    setEditForm({ name: user.name || '', email: user.email, streak: user.streak });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.users.update(editModal.user.id, {
        name: editForm.name,
        email: editForm.email,
        streak: Number(editForm.streak),
      });
      showToast('Cập nhật học viên thành công!', 'success');
      setEditModal({ isOpen: false, user: null });
      loadUsers();
    } catch (err) {
      showToast('Cập nhật thất bại: ' + err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa học viên này? Hành động này sẽ xóa toàn bộ tiến trình học tập, tranh luận và thẻ nhớ liên quan.')) return;
    try {
      await api.users.delete(id);
      showToast('Xóa học viên thành công!', 'success');
      loadUsers();
    } catch (err) {
      showToast('Xóa thất bại: ' + err.message, 'error');
    }
  };

  return (
    <AdminPageShell activeKey="users">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Quản lý Học viên</h1>
            <p className="text-slate-400 mt-1">Quản lý thông tin tài khoản, tích lũy điểm streak và hồ sơ tiến độ của người học.</p>
          </div>
          <button onClick={loadUsers} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 px-4 py-2 rounded-xl border border-slate-700 font-semibold transition-colors">
            <span className="material-symbols-outlined text-sm">sync</span> Làm mới
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-red-500 text-5xl animate-spin">sync</span>
            <p className="text-slate-400 mt-4">Đang tải danh sách học viên...</p>
          </div>
        ) : (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/50 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-4">Học viên</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Chuỗi Streak</th>
                    <th className="p-4">Ngày đăng ký</th>
                    <th className="p-4 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-500">Chưa có học viên nào đăng ký hệ thống.</td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-900/30">
                        <td className="p-4 font-bold text-slate-200">{u.name || 'Học viên ẩn danh'}</td>
                        <td className="p-4 text-slate-400">{u.email}</td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 bg-amber-950/40 border border-amber-900/50 text-amber-500 px-2 py-1 rounded-lg text-xs font-bold">
                            <span className="material-symbols-outlined text-xs">local_fire_department</span>
                            {u.streak} ngày
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td className="p-4 flex justify-center gap-2">
                          <button onClick={() => openEdit(u)} className="p-2 hover:bg-slate-800 text-blue-400 rounded-lg transition-colors" title="Chỉnh sửa">
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button onClick={() => handleDelete(u.id)} className="p-2 hover:bg-slate-800 text-red-400 rounded-lg transition-colors" title="Xóa học viên">
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

        {/* Edit Modal */}
        {editModal.isOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-950 rounded-2xl border border-slate-800 w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-100">Chỉnh sửa Học viên</h3>
                <button onClick={() => setEditModal({ isOpen: false, user: null })} className="text-slate-500 hover:text-slate-300">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Họ và tên</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Chuỗi học tập (Streak)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editForm.streak}
                    onChange={(e) => setEditForm({ ...editForm, streak: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
                <button type="submit" className="w-full bg-red-800 hover:bg-red-900 text-white font-bold py-3 rounded-xl transition-colors">
                  Lưu thay đổi
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminPageShell>
  );
}
