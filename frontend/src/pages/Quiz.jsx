import React from "react";
import PageShell, { PageHero } from "../components/PageShell";

const Quiz = () => {
  return (
    <PageShell activeKey="quiz">
      <PageHero
        eyebrow="Quiz System"
        icon="quiz"
        title="Hệ thống Kiểm tra Kiến thức"
        subtitle='"Không có lý luận cách mạng thì không có phong trào cách mạng." — V.I. Lenin'
      />

      <div className="px-6 md:px-12 py-12 max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
          <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">
            quiz
          </span>
          <h3 className="font-bold text-gray-800 text-xl mb-2">Chưa có bài kiểm tra tự luyện</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
            Hệ thống hiện tại chưa ghi nhận bộ câu hỏi kiểm tra học thuật nào từ cơ sở dữ liệu thực tế. Đang chờ Ban quản lý cập nhật ngân hàng câu hỏi tự luận & trắc nghiệm chuẩn chỉnh của Bộ Giáo dục.
          </p>
        </div>
      </div>
    </PageShell>
  );
};

export default Quiz;
