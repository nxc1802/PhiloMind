import React from "react";
import PageShell, { PageHero } from "../components/PageShell";
import OnboardingGuide from "../components/OnboardingGuide";
import { api } from "../services/api";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../services/queryKeys";

export default function Docs() {
  const { data: dbDocsData, isLoading: loading } = useQuery({
    queryKey: queryKeys.documents.list(),
    queryFn: () => api.documents.list(),
    staleTime: 1000 * 60 * 10, // Documents change very rarely
  });
  const dbDocs = dbDocsData || [];


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
      <OnboardingGuide
        tabKey="docs"
        steps={[
          "Kho tài liệu riêng: Bạn có thể tải lên tài liệu học tập cá nhân (PDF, DOCX, TXT) như bài giảng, giáo trình trên lớp của bạn.",
          "Phân tích tự động: Hệ thống AI sẽ tự động phân tích cấu trúc tài liệu tải lên để sinh ra sơ đồ bài học tương tác cá nhân hóa.",
          "Lời khuyên định dạng: Hãy tải lên các tài liệu văn bản rõ ràng, có cấu trúc chương mục mạch lạc để AI nhận diện và phân tích chính xác nhất."
        ]}
      />
      <PageHero
        eyebrow="Thư viện tài liệu"
        icon="description"
        title="Tài liệu học tập"
        subtitle=""
      />

      <div className="px-6 md:px-12 py-10 max-w-5xl mx-auto">
        {loading ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined animate-spin text-5xl text-primary-650 dark:text-primary-300">sync</span>
            <p className="text-slate-500 dark:text-primary-350 mt-4 font-semibold">Đang tải tài liệu học tập...</p>
          </div>
        ) : displayDocs.length > 0 ? (
          <div className="grid gap-4">
            {displayDocs.map((doc) => (
              <article
                key={doc.id}
                className="bg-white dark:bg-[#002b37] rounded-3xl shadow-sm border border-slate-200 dark:border-primary-850 p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-5 hover:shadow-md transition-shadow text-left"
              >
                <div className="flex gap-4 items-start flex-1 min-w-0">
                  <div className="h-14 w-14 rounded-3xl bg-primary-50 dark:bg-primary-900/35 text-primary-650 dark:text-primary-300 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-3xl">
                      picture_as_pdf
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-lg text-slate-900 dark:text-primary-100 mb-1 truncate" title={doc.title}>
                      {doc.title}
                    </h2>
                    <p className="text-slate-600 dark:text-primary-250 text-sm">
                      {doc.description}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownload(doc)}
                  className="bg-primary-600 text-white px-5 py-2.5 rounded-3xl font-semibold hover:bg-primary-750 transition-colors flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto mt-2 sm:mt-0"
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
          <div className="bg-white dark:bg-[#002b37] rounded-3xl p-12 text-center border border-dashed border-slate-350 dark:border-primary-800">
            <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">
              folder_off
            </span>
            <h3 className="font-bold text-slate-800 dark:text-primary-100 text-lg mb-1">Thư viện tài liệu trống</h3>
            <p className="text-slate-500 dark:text-primary-350 text-sm max-w-md mx-auto">
              Hiện chưa có tài liệu giáo trình PDF nào được Ban quản trị tải lên. Đồng chí vui lòng quay lại sau.
            </p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
