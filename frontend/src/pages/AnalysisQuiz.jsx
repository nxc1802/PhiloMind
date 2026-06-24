import React from "react";
import PageShell, { PageHero } from "../components/PageShell";
import { Link } from "react-router-dom";

const AnalysisQuiz = () => {
  return (
    <PageShell activeKey="practice">
      <PageHero
        eyebrow="Chuyên đề 05"
        icon="menu_book"
        title="Phân tích Văn bản"
        subtitle=""
      />

      <div className="px-6 md:px-12 py-12 max-w-3xl mx-auto text-center">
        <div className="bg-white dark:bg-[#002b37] rounded-3xl p-12 text-center border border-dashed border-gray-300">
          <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">
            article
          </span>
          <h3 className="font-bold text-gray-800 dark:text-primary-150 text-xl mb-2">Chưa có văn bản phân tích</h3>
          <p className="text-gray-500 dark:text-primary-400 text-sm max-w-md mx-auto leading-relaxed mb-6">
            Hiện tại chuyên đề này chưa được cập nhật dữ liệu văn bản kinh điển thực tế từ cơ sở dữ liệu để phân tích.
          </p>
          <Link
            to="/practice"
            className="inline-block bg-primary-600 text-white px-6 py-2.5 rounded-3xl font-bold hover:bg-primary-700 transition-colors"
          >
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    </PageShell>
  );
};

export default AnalysisQuiz;
