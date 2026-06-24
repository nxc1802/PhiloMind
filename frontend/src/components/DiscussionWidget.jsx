import React, { useState, useRef, useEffect } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { DISCUSSION_SEED } from "../data/discussionSeed";

// Khu thảo luận nổi (floating) — cố định ở góc trái dưới
export default function DiscussionWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [userMessages, setUserMessages] = useLocalStorage(
    "mln_discussion_messages",
    []
  );
  const [draft, setDraft] = useState("");
  const listEndRef = useRef(null);

  const allMessages = [...DISCUSSION_SEED, ...userMessages];

  // Cuộn xuống tin nhắn mới nhất
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
        <div className="absolute bottom-20 left-0 w-[22rem] max-w-[calc(100vw-4rem)] bg-white dark:bg-[#002b37] rounded-3xl shadow-2xl border border-slate-200 dark:border-primary-850 overflow-hidden mb-2 flex flex-col transition-all duration-300">
          {/* Header */}
          <div className="bg-primary-600 p-4 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-3xl bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">forum</span>
              </div>
              <div>
                <p className="font-bold text-sm">Thảo luận bài học</p>
                <p className="text-xs opacity-75">
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
          <div className="h-80 overflow-y-auto bg-slate-50 dark:bg-[#001F28] p-4 space-y-3">
            {allMessages.map((message) => {
              const isAdmin = message.role === "admin";
              return (
                <div
                  key={message.id}
                  className={`p-3 rounded-3xl border ${
                    isAdmin
                      ? "bg-primary-50 dark:bg-primary-900/35 border-primary-150 dark:border-primary-850 shadow-sm"
                      : "bg-white dark:bg-[#002b37] border-slate-200 dark:border-primary-850"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`material-symbols-outlined text-base ${
                        isAdmin ? "text-primary-600 dark:text-primary-300" : "text-slate-400 dark:text-primary-400"
                      }`}
                    >
                      {isAdmin ? "verified" : "account_circle"}
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        isAdmin ? "text-primary-800 dark:text-primary-200" : "text-slate-800 dark:text-slate-100"
                      }`}
                    >
                      {message.author}
                    </span>
                    {isAdmin && (
                      <span className="text-[10px] uppercase tracking-wider bg-primary-600 text-white px-1.5 py-0.5 rounded-md font-bold">
                        Admin
                      </span>
                    )}
                    <span className="text-2xs text-slate-400 dark:text-primary-355 ml-auto">
                      {message.time}
                    </span>
                  </div>
                  <p
                    className={`text-sm leading-relaxed text-left ${
                      isAdmin ? "text-primary-850 dark:text-primary-100" : "text-slate-650 dark:text-slate-200"
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
            className="p-3 bg-white dark:bg-[#002b37] border-t border-slate-200 dark:border-primary-850 flex gap-2 shrink-0 animate-fadeIn"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="flex-1 bg-slate-100 dark:bg-primary-900/10 rounded-3xl px-3 py-2 text-sm focus:ring-1 focus:ring-primary-600 outline-none text-slate-800 dark:text-slate-100"
              placeholder="Đặt câu hỏi cho cả lớp..."
            />
            <button
              type="submit"
              aria-label="Gửi"
              className="bg-primary-600 text-white p-2 rounded-3xl hover:bg-primary-750 transition-colors"
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
        className="h-14 w-14 bg-primary-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all relative overflow-hidden"
      >
        <span className="material-symbols-outlined text-2xl">
          {isOpen ? "close" : "forum"}
        </span>
      </button>
    </div>
  );
}
