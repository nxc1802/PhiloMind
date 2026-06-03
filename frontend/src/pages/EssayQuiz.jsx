import React from "react";
import PageShell, { PageHero } from "../components/PageShell";
import { Link } from "react-router-dom";

const EssayQuiz = () => {
  return (
    <PageShell activeKey="practice">
      <PageHero
        eyebrow="Chuyên đề 04"
        icon="edit_note"
        title="Tư duy Độc lập"
        subtitle=""
      />

      <div className="px-6 md:px-12 py-12 max-w-3xl mx-auto text-center">
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
          <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">
            edit_document
          </span>
          <h3 className="font-bold text-gray-800 text-xl mb-2">Chưa có đề tự luận nào</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed mb-6">
            Hiện tại chưa có đề thi tự luận chính thức nào được giao bởi Ban giảng huấn cho chuyên đề này.
          </p>
          <Link
            to="/practice"
            className="inline-block bg-red-800 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-red-900 transition-colors"
          >
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    </PageShell>
  );
};

export default EssayQuiz;
