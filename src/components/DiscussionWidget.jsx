import React, { useState, useRef, useEffect } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { DISCUSSION_SEED } from "../data/discussionSeed";

// Khu thảo luận nổi (floating) — cố định ở góc trái dưới, không bị ảnh hưởng khi cuộn trang
// Hiển thị trao đổi giữa người học và Admin; câu trả lời của Admin nổi bật hơn
// Tin nhắn người dùng gửi được lưu vào localStorage để không mất khi tải lại
export default function DiscussionWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [userMessages, setUserMessages] = useLocalStorage(
    "mln_discussion_messages",
    []
  );
  const [draft, setDraft] = useState("");
  const listEndRef = useRef(null);

  const allMessages = [...DISCUSSION_SEED, ...userMessages];

  // Cuộn xuống tin nhắn mới nhất mỗi khi mở panel hoặc có tin mới
  useEffect(() => {
    if (isOpen) {
      listEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, userMessages.length]);

  const handleSend = (e) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    const newMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      author: "Bạn",
      time: "Vừa xong",
      text: trimmed,
    };
    setUserMessages([...userMessages, newMessage]);
    setDraft("");
  };

  return (
    <div className="fixed bottom-8 left-8 z-50">
      {isOpen && (
        <div className="absolute bottom-20 left-0 w-[22rem] max-w-[calc(100vw-4rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden mb-2 flex flex-col">
          {/* Header */}
          <div className="bg-red-800 text-white px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">forum</span>
              </div>
              <div>
                <p className="font-bold text-sm">Thảo luận bài học</p>
                <p className="text-xs opacity-70">
                  {allMessages.length} trao đổi
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Đóng thảo luận"
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Danh sách tin nhắn */}
          <div className="h-80 overflow-y-auto bg-gray-50 p-4 space-y-3">
            {allMessages.map((message) => {
              const isAdmin = message.role === "admin";
              return (
                <div
                  key={message.id}
                  className={`p-3 rounded-xl border ${
                    isAdmin
                      ? "bg-red-50 border-red-200 shadow-sm"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`material-symbols-outlined text-base ${
                        isAdmin ? "text-red-800" : "text-gray-400"
                      }`}
                    >
                      {isAdmin ? "verified" : "account_circle"}
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        isAdmin ? "text-red-800" : "text-gray-800"
                      }`}
                    >
                      {message.author}
                    </span>
                    {isAdmin && (
                      <span className="text-[10px] uppercase tracking-wider bg-red-800 text-white px-1.5 py-0.5 rounded font-bold">
                        Admin
                      </span>
                    )}
                    <span className="text-xs text-gray-400 ml-auto">
                      {message.time}
                    </span>
                  </div>
                  <p
                    className={`text-sm leading-relaxed ${
                      isAdmin ? "text-red-900" : "text-gray-700"
                    }`}
                  >
                    {message.text}
                  </p>
                </div>
              );
            })}
            <div ref={listEndRef} />
          </div>

          {/* Ô nhập */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-white border-t border-gray-200 flex gap-2 shrink-0"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-red-800 outline-none"
              placeholder="Đặt câu hỏi cho cả lớp..."
            />
            <button
              type="submit"
              aria-label="Gửi"
              className="bg-red-800 text-white p-2 rounded-lg hover:bg-red-900 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">send</span>
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        aria-label="Mở khu thảo luận"
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-14 w-14 bg-red-800 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
      >
        <span className="material-symbols-outlined text-2xl">
          {isOpen ? "close" : "forum"}
        </span>
      </button>
    </div>
  );
}
