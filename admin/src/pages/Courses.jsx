import React, { useState, useEffect, useCallback } from 'react';
import AdminPageShell from '../components/AdminPageShell';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

export default function Courses() {
  const { showToast } = useToast();
  const [documents, setDocuments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false });
  const [pdfFile, setPdfFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [docList, courseList] = await Promise.all([
        api.documents.list(),
        api.courses.list(),
      ]);
      setDocuments(docList || []);
      setCourses(courseList || []);
    } catch (err) {
      showToast('Lỗi tải danh sách tài liệu PDF: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openUploadModal = () => {
    setModal({ isOpen: true });
    setPdfFile(null);
    setTitle('');
    setDescription('');
  };

  const handlePdfUpload = async (e) => {
    e.preventDefault();
    if (!pdfFile) return;

    // Lấy khóa học Triết học Mác – Lênin mặc định
    const defaultCourse = courses.find(c => c.title.includes('Triết học')) || courses[0];
    if (!defaultCourse) {
      showToast('Không tìm thấy khóa học mặc định. Vui lòng chạy seed database trước.', 'error');
      return;
    }

    setUploading(true);
    try {
      // 1. Upload to Supabase / Local Storage
      const uploadRes = await api.files.upload(pdfFile);

      // 2. Create document record linked to the default course
      await api.documents.create({
        courseId: defaultCourse.id,
        fileName: pdfFile.name,
        fileUrl: uploadRes.url,
        status: 'completed',
        title: title.trim() || pdfFile.name,
        description: description.trim() || undefined,
      });

      showToast('Tải lên và lưu tài liệu PDF thành công!', 'success');
      setModal({ isOpen: false });
      loadData();
    } catch (err) {
      showToast('Tải lên PDF thất bại: ' + err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu PDF này? Học viên sẽ không thể tải tài liệu này ở giao diện PDF Docs nữa.')) return;
    try {
      await api.documents.delete(id);
      showToast('Xóa tài liệu thành công!', 'success');
      loadData();
    } catch (err) {
      showToast('Xóa tài liệu thất bại: ' + err.message, 'error');
    }
  };

  return (
    <AdminPageShell activeKey="courses">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500 text-3xl">picture_as_pdf</span>
              Quản lý Tài liệu PDF
            </h1>
            <p className="text-slate-400 mt-1">Đăng tải sách giáo trình, tài liệu tham khảo PDF cho học viên tải về ở mục PDF Docs.</p>
          </div>
          <button onClick={openUploadModal} className="flex items-center gap-2 bg-red-800 hover:bg-red-900 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg transition-colors">
            <span className="material-symbols-outlined text-sm">cloud_upload</span> Tải lên PDF mới
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-red-500 text-5xl animate-spin">sync</span>
            <p className="text-slate-400 mt-4">Đang tải danh sách tài liệu...</p>
          </div>
        ) : (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/50 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-4">Tài liệu PDF</th>
                    <th className="p-4">Metadata (Tên & Mô tả)</th>
                    <th className="p-4">Khóa học liên kết</th>
                    <th className="p-4">Liên kết (URL)</th>
                    <th className="p-4 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {documents.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-500">Chưa có tài liệu PDF nào được tải lên hệ thống.</td>
                    </tr>
                  ) : (
                    documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-900/30">
                        <td className="p-4 font-bold text-slate-200">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-500">picture_as_pdf</span>
                            <span>{doc.fileName}</span>
                          </div>
                        </td>
                        <td className="p-4 max-w-xs">
                          {doc.title && <div className="font-bold text-slate-300">{doc.title}</div>}
                          {doc.description && <div className="text-xs text-slate-500 mt-1 line-clamp-2">{doc.description}</div>}
                          {!doc.title && !doc.description && <span className="text-slate-600 italic text-xs">Không có</span>}
                        </td>
                        <td className="p-4 text-slate-400">Triết học Mác – Lênin</td>
                        <td className="p-4 max-w-xs truncate text-slate-500 hover:text-slate-300 transition-colors">
                          <a href={doc.fileUrl.startsWith('http') ? doc.fileUrl : `http://localhost:3001${doc.fileUrl}`} target="_blank" rel="noopener noreferrer">
                            {doc.fileUrl}
                          </a>
                        </td>
                        <td className="p-4 flex justify-center gap-2">
                          <a
                            href={doc.fileUrl.startsWith('http') ? doc.fileUrl : `http://localhost:3001${doc.fileUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-slate-800 text-amber-400 rounded-lg transition-colors flex items-center"
                            title="Mở tài liệu"
                          >
                            <span className="material-symbols-outlined text-sm">open_in_new</span>
                          </a>
                          <button onClick={() => handleDelete(doc.id)} className="p-2 hover:bg-slate-800 text-red-400 rounded-lg transition-colors flex items-center" title="Xóa tài liệu">
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

        {/* Upload Modal */}
        {modal.isOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-950 rounded-2xl border border-slate-800 w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-6">
              <div className="flex justify-between items-center text-left">
                <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-500">cloud_upload</span>
                  Tải lên PDF giáo trình
                </h3>
                <button onClick={() => setModal({ isOpen: false })} className="text-slate-500 hover:text-slate-300">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <form onSubmit={handlePdfUpload} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Chọn tệp giáo trình PDF</label>
                  <input
                    type="file"
                    accept=".pdf"
                    required
                    onChange={(e) => setPdfFile(e.target.files[0])}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-650 focus:outline-none focus:border-red-500 transition-colors file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 file:cursor-pointer cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tên hiển thị tài liệu (Không bắt buộc)</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Giáo trình Triết học Mác - Lênin"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mô tả chi tiết tài liệu (Không bắt buộc)</label>
                  <textarea
                    rows="3"
                    placeholder="Nhập mô tả tóm tắt nội dung tài liệu..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-red-500 transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={uploading || !pdfFile}
                  className="w-full bg-red-850 hover:bg-red-900 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                      <span>Đang tải lên Supabase...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">done</span>
                      <span>Tải lên hệ thống</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminPageShell>
  );
}
