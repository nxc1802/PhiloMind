import React from "react";
import { Link, useLocation } from "react-router-dom";
import PageShell from "../components/PageShell";

// Trang 404 — hien khi URL khong khop bat ky route nao
export default function NotFound() {
  const location = useLocation();

  return (
    <PageShell activeKey="">
      <div className="px-6 md:px-12 py-16 max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center justify-center h-32 w-32 rounded-full bg-primary-50 dark:bg-primary-900/35 text-primary-650 dark:text-primary-300 mb-6">
          <span className="material-symbols-outlined text-7xl">
            sentiment_dissatisfied
          </span>
        </div>
        <h1 className="font-bold text-5xl text-primary-850 dark:text-primary-100 mb-3">404</h1>
        <h2 className="font-bold text-2xl text-gray-800 mb-3">
          Không tìm thấy trang
        </h2>
        <p className="text-gray-600 mb-2">
          Đường dẫn{" "}
          <code className="bg-gray-100 px-2 py-0.5 rounded text-primary-650 dark:text-primary-300 font-mono text-sm">
            {location.pathname}
          </code>{" "}
          không tồn tại trong hệ thống.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Có thể bạn đã gõ sai địa chỉ, hoặc trang này đã bị di chuyển.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/home"
            className="bg-primary-600 text-white px-6 py-3 rounded-3xl font-bold hover:bg-primary-700 transition-colors inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">home</span>
            Về trang chủ
          </Link>
          <Link
            to="/lessons"
            className="border-2 border-primary-800 text-primary-650 dark:text-primary-300 px-6 py-3 rounded-3xl font-bold hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">
              account_tree
            </span>
            Xem mục lục bài học
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
