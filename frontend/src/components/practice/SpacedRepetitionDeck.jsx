import React from 'react';

export default function SpacedRepetitionDeck({
  reviewTitle,
  currentReviewIndex,
  setCurrentReviewIndex,
  reviewCards,
  activeReviewCard,
  isFlipped,
  setIsFlipped,
  isSpacedRepetitionMode,
  handleReviewEase,
  showToast,
  onClose,
}) {
  if (!activeReviewCard) return null;

  return (
    <div className="bg-white dark:bg-[#1C2230] rounded-[2rem] border border-primary-100 dark:border-primary-800/30 p-8 shadow-2xl max-w-4xl mx-auto text-center animate-fadeIn relative overflow-hidden">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-100">
        <div 
          className="h-full bg-primary-600 transition-all duration-300"
          style={{ width: `${((currentReviewIndex + 1) / reviewCards.length) * 100}%` }}
        />
      </div>

      <div className="flex justify-between items-center mb-6 text-sm text-gray-500 mt-2 px-2">
        <span className="bg-primary-50 dark:bg-primary-900/20 text-primary-800 dark:text-primary-250 px-3 py-1 rounded-full font-bold uppercase tracking-wider text-xs">
          {reviewTitle}
        </span>
        <span className="font-bold text-gray-600">
          Thẻ thứ {currentReviewIndex + 1} / {reviewCards.length}
        </span>
      </div>

      <div className="relative flex flex-col sm:flex-row items-center justify-center gap-6">
        {/* Left Arrow (Desktop) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (currentReviewIndex > 0) {
              setIsFlipped(false);
              setCurrentReviewIndex(prev => prev - 1);
            }
          }}
          disabled={currentReviewIndex === 0}
          className="hidden sm:flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0 shadow-sm"
        >
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>

        {/* Flipping card container */}
        <div 
          onClick={() => setIsFlipped(!isFlipped)}
          className="w-full sm:flex-1 h-[340px] max-w-lg relative cursor-pointer select-none group" 
          style={{ perspective: "1000px" }}
          title="Click vào thẻ để lật mặt"
        >
          <div
            className="w-full h-full duration-500 absolute transition-transform"
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
            }}
          >
            {/* Front Face */}
            <div
              className={`absolute inset-0 bg-slate-900 text-white rounded-3xl p-8 flex flex-col justify-between items-center shadow-xl border border-slate-800 transition-opacity duration-300 ${
                isFlipped ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
              style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
            >
              <div className="w-full flex justify-between items-center opacity-75">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary-200">Câu hỏi / Thuật ngữ</span>
                <span className="material-symbols-outlined text-lg text-primary-200">help</span>
              </div>
              <div className="w-full overflow-y-auto max-h-[220px] pr-1 my-auto scrollbar-thin flex flex-col justify-center items-center">
                <p className="text-lg md:text-xl font-bold leading-relaxed font-serif text-center">{activeReviewCard.question}</p>
              </div>
              <div className="h-4"></div>
            </div>

            {/* Back Face */}
            <div
              className={`absolute inset-0 bg-gradient-to-br from-amber-50 to-stone-50 border-2 border-amber-300 text-gray-900 rounded-3xl p-8 flex flex-col justify-between items-center shadow-xl transition-opacity duration-300 ${
                isFlipped ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)"
              }}
            >
              <div className="w-full flex justify-between items-center border-b border-primary-200 dark:border-primary-800/50 pb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary-800 dark:text-primary-250">Giải nghĩa / Đáp án</span>
                <span className="material-symbols-outlined text-lg text-primary-650 dark:text-primary-300">menu_book</span>
              </div>
              <div className="w-full overflow-y-auto max-h-[220px] pr-1 my-auto scrollbar-thin text-left">
                <p className="text-base md:text-lg font-semibold leading-relaxed text-gray-800 font-serif">{activeReviewCard.answer}</p>
              </div>
              <div className="h-4"></div>
            </div>
          </div>
        </div>

        {/* Right Arrow (Desktop) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (currentReviewIndex < reviewCards.length - 1) {
              setIsFlipped(false);
              setCurrentReviewIndex(prev => prev + 1);
            } else {
              showToast("Đồng chí đã ở thẻ cuối cùng của phiên ôn tập này.", "info");
            }
          }}
          disabled={currentReviewIndex === reviewCards.length - 1}
          className="hidden sm:flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0 shadow-sm"
        >
          <span className="material-symbols-outlined">arrow_forward_ios</span>
        </button>

        {/* Mobile Navigation Arrows (visible only on small screens) */}
        <div className="flex w-full sm:hidden justify-between items-center max-w-lg mt-4 px-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (currentReviewIndex > 0) {
                setIsFlipped(false);
                setCurrentReviewIndex(prev => prev - 1);
              }
            }}
            disabled={currentReviewIndex === 0}
            className="flex items-center gap-1 px-4 py-2.5 text-sm font-bold rounded-3xl bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <span className="material-symbols-outlined text-sm">arrow_back_ios_new</span>
            Trước
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (currentReviewIndex < reviewCards.length - 1) {
                setIsFlipped(false);
                setCurrentReviewIndex(prev => prev + 1);
              } else {
                showToast("Đồng chí đã ở thẻ cuối cùng của phiên ôn tập này.", "info");
              }
            }}
            disabled={currentReviewIndex === reviewCards.length - 1}
            className="flex items-center gap-1 px-4 py-2.5 text-sm font-bold rounded-3xl bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Tiếp
            <span className="material-symbols-outlined text-sm">arrow_forward_ios</span>
          </button>
        </div>
      </div>

      {isSpacedRepetitionMode && isFlipped && (
        <div className="mt-8 animate-fadeIn">
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleReviewEase(2);
              }}
              className="bg-amber-55 hover:bg-amber-100 text-amber-900 border-2 border-amber-300 px-6 py-3 rounded-3xl text-sm font-bold transition-all shadow-sm flex flex-col items-center justify-center gap-0.5"
            >
              <span className="text-base flex items-center gap-1">🟡 Khó</span> 
              <span className="text-[10px] font-normal text-amber-800 uppercase tracking-wide">Học lại</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleReviewEase(4);
              }}
              className="bg-emerald-55 hover:bg-emerald-100 text-emerald-900 border-2 border-emerald-300 px-6 py-3 rounded-3xl text-sm font-bold transition-all shadow-sm flex flex-col items-center justify-center gap-0.5"
            >
              <span className="text-base flex items-center gap-1">🟢 Dễ</span> 
              <span className="text-[10px] font-normal text-emerald-800 uppercase tracking-wide">Thuộc bài</span>
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 pt-4 border-t border-gray-150 text-center">
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-primary-800 dark:text-primary-250 text-sm font-bold flex items-center justify-center gap-1 mx-auto transition-colors"
        >
          <span className="material-symbols-outlined text-lg">close</span>
          Dừng ôn tập và quay lại danh sách
        </button>
      </div>
    </div>
  );
}
