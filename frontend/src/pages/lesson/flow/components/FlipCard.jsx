import React from "react";

/**
 * CSS 3D Flip Card Component
 * @param {Object} props
 * @param {boolean} props.flipped Trạng thái lật của thẻ
 * @param {React.ReactNode} props.front Nội dung mặt trước
 * @param {React.ReactNode} props.back Nội dung mặt sau
 * @param {string} props.className Lớp CSS mở rộng cho container
 * @param {function} props.onClick Hàm xử lý click toàn bộ thẻ
 */
export function FlipCard({
  flipped,
  front,
  back,
  className = "",
  onClick,
}) {
  return (
    <div
      className={`relative w-full h-full ${className}`}
      style={{ perspective: "1000px" }}
      onClick={onClick}
    >
      <div
        className="w-full h-full transition-transform duration-700 cursor-pointer relative"
        style={{ 
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)"
        }}
      >
        {/* Front Face */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{ backfaceVisibility: "hidden" }}
        >
          {front}
        </div>

        {/* Back Face */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          {back}
        </div>
      </div>
    </div>
  );
}
