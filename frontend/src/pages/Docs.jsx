import React, { useState, useEffect } from "react";
import PageShell, { PageHero } from "../components/PageShell";
import { api } from "../services/api";

export default function Docs() {
  const [dbDocs, setDbDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await api.documents.list();
        setDbDocs(res || []);
      } catch (err) {
        console.error("Lỗi tải danh sách tài liệu từ backend:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const displayDocs = dbDocs.map(doc => ({
    id: doc.id,
    title: doc.title || doc.fileName,
    description: doc.description || "Tài liệu giáo trình học thuật thực tế được tải lên bởi Ban quản trị.",
    pages: 120, // default placeholder
    size: "Supabase Storage",
    fileUrl: doc.fileUrl.startsWith('http') ? doc.fileUrl : `http://localhost:3001${doc.fileUrl}`,
    isReal: true
  }));

  const handleDownload = (doc) => {
    if (doc.fileUrl && doc.fileUrl !== "#") {
      window.open(doc.fileUrl, "_blank");
    }
  };

  return (
    <PageShell activeKey="docs">
      <PageHero
        eyebrow="Thư viện tài liệu"
        icon="description"
        title="PDF Docs"
        subtitle=""
      />

      <div className="px-6 md:px-12 py-10 max-w-5xl mx-auto">
        {loading ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined animate-spin text-5xl text-red-800">sync</span>
            <p className="text-gray-500 mt-4 font-semibold">Đang tải tài liệu học tập...</p>
          </div>
        ) : displayDocs.length > 0 ? (
          <div className="grid gap-4">
            {displayDocs.map((doc) => (
              <article
                key={doc.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-start gap-5 hover:shadow-md transition-shadow text-left"
              >
                <div className="h-14 w-14 rounded-xl bg-red-50 text-red-800 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-3xl">
                    picture_as_pdf
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-lg text-gray-900 mb-1 truncate" title={doc.title}>
                    {doc.title}
                  </h2>
                  <p className="text-gray-600 text-sm mb-3">
                    {doc.description}
                  </p>

                </div>
                <button
                  type="button"
                  onClick={() => handleDownload(doc)}
                  className="bg-red-800 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-red-900 transition-colors flex items-center gap-2 shrink-0"
                >
                  <span className="material-symbols-outlined text-base">
                    download
                  </span>
                  Tải về
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
            <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">
              folder_off
            </span>
            <h3 className="font-bold text-gray-800 text-lg mb-1">Thư viện tài liệu trống</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Hiện chưa có tài liệu giáo trình PDF nào được Ban quản trị tải lên. Đồng chí vui lòng quay lại sau.
            </p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
