import React from "react";
import PageShell, { PageHero } from "../components/PageShell";
import { Link } from "react-router-dom";

const MCQQuiz = () => {
  return (
    <PageShell activeKey="quiz">
      <PageHero
        eyebrow="Chuyên đề 03"
        icon="quiz"
        title="Trắc nghiệm Tổng hợp"
        subtitle='"Không có lý luận cách mạng thì không có phong trào cách mạng." — V.I. Lenin'
      />

      <div className="px-6 md:px-12 py-12 max-w-3xl mx-auto text-center">
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
          <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">
            quiz
          </span>
          <h3 className="font-bold text-gray-800 text-xl mb-2">Chưa có bộ câu hỏi trắc nghiệm</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed mb-6">
            Hiện tại chưa có bộ câu hỏi trắc nghiệm chính thức nào trong cơ sở dữ liệu thực tế cho chuyên đề này.
          </p>
          <Link
            to="/quiz"
            className="inline-block bg-red-800 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-red-900 transition-colors"
          >
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    </PageShell>
  );
};

export default MCQQuiz;
