import React, { useState, useEffect, useRef } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "./Toast";

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const { user } = useAuth();
  const { showToast } = useToast();

  const containerRef = useRef(null);

  // Dragging States & Refs
  const [position, setPosition] = useState({ bottom: 32, right: 32 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, bottom: 0, right: 0 });
  const hasDragged = useRef(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || !user) return;
    
    setLoading(true);
    try {
      await api.feedbacks.create(user.id, content.trim());
      setSubmitted(true);
      setContent("");
      showToast("Cảm ơn đồng chí đã gửi ý kiến đóng góp quý báu!", "success");
    } catch (err) {
      showToast("Gửi góp ý thất bại: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSubmitted(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Handle Dragging
  const handleDragStart = (clientX, clientY) => {
    setIsDragging(true);
    hasDragged.current = false;
    dragStart.current = {
      x: clientX,
      y: clientY,
      bottom: position.bottom,
      right: position.right,
    };
  };

  const handleMouseDown = (e) => {
    // Only drag with left click
    if (e.button !== 0) return;
    handleDragStart(e.clientX, e.clientY);
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleDragMove = (clientX, clientY) => {
      const deltaX = clientX - dragStart.current.x;
      const deltaY = clientY - dragStart.current.y;
      
      const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (dist > 5) {
        hasDragged.current = true;
      }

      // Compute new right/bottom values (moving right deltaX > 0 reduces 'right' value)
      const newRight = Math.max(16, dragStart.current.right - deltaX);
      const newBottom = Math.max(16, dragStart.current.bottom - deltaY);

      // Boundaries (constrain within bottom/right quadrant or safely within window)
      // To satisfy "di chuyển quanh vùng dưới đáy và mép phải" -> we can allow dragging up to 400px from right/bottom
      const maxRight = window.innerWidth - 80;
      const maxBottom = window.innerHeight - 80;

      setPosition({
        right: Math.min(newRight, maxRight),
        bottom: Math.min(newBottom, maxBottom),
      });
    };

    const handleMouseMove = (e) => {
      handleDragMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e) => {
      const touch = e.touches[0];
      handleDragMove(touch.clientX, touch.clientY);
    };

    const handleDragEnd = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleDragEnd);
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleDragEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleDragEnd);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleDragEnd);
    };
  }, [isDragging]);

  const handleButtonClick = (e) => {
    e.preventDefault();
    if (hasDragged.current) {
      // Prevent click action if it was a drag
      hasDragged.current = false;
      return;
    }
    setIsOpen((prev) => !prev);
    if (!isOpen) setSubmitted(false);
  };

  return (
    <div 
      ref={containerRef}
      className="fixed z-50 transition-shadow select-none"
      style={{
        bottom: `${position.bottom}px`,
        right: `${position.right}px`,
        cursor: isDragging ? "grabbing" : "grab",
      }}
    >
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[22rem] max-w-[calc(100vw-4rem)] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-red-100 overflow-hidden mb-2 flex flex-col transition-all duration-300 select-text">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-800 to-red-950 text-white px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg font-bold">rate_review</span>
              </div>
              <div>
                <p className="font-bold text-sm">Góp ý & Báo lỗi</p>
                <p className="text-[10px] text-red-200 uppercase tracking-wider font-bold">Feedback Hub</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Đóng"
              onClick={() => {
                setIsOpen(false);
                setSubmitted(false);
              }}
              className="text-white/70 hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Form / Content area */}
          <div className="p-5 bg-gray-50/50">
            {submitted ? (
              <div className="text-center py-6">
                <span className="material-symbols-outlined text-green-600 text-5xl animate-bounce">recommend</span>
                <h4 className="font-bold text-gray-900 mt-3 text-base">Đã nhận phản hồi!</h4>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed px-4">
                  Ý kiến của đồng chí đã được lưu trực tiếp vào cơ sở dữ liệu quản trị để cải thiện chất lượng học liệu.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-xs font-bold text-red-850 underline hover:text-red-950"
                >
                  Gửi thêm góp ý khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Chúng tôi luôn lắng nghe ý kiến phản hồi biện chứng từ đồng chí để không ngừng cải tiến học viện số PhiloMind.
                </p>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={loading}
                  rows={4}
                  required
                  placeholder="Nhập nội dung góp ý, báo lỗi học cụ hoặc ý tưởng cải tiến..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:border-red-850 outline-none text-xs leading-relaxed text-gray-800 bg-white"
                />
                <button
                  type="submit"
                  disabled={loading || !content.trim() || !user}
                  className="w-full bg-red-800 hover:bg-red-950 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1 disabled:opacity-50 text-xs"
                >
                  {loading ? (
                    <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm font-bold">send</span>
                      <span>Gửi góp ý lên hệ thống</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Floating button toggle */}
      <button
        type="button"
        aria-label="Mở góp ý"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleButtonClick}
        className="h-14 w-14 bg-gradient-to-br from-red-800 to-red-950 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
        <span className="material-symbols-outlined text-2xl font-bold">
          {isOpen ? "close" : "rate_review"}
        </span>
      </button>
    </div>
  );
}
