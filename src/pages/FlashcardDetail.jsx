import React, { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import PageShell, { PageHero } from "../components/PageShell";
import { useToast } from "../components/Toast";
import { MEMORY_CHAPTERS } from "../data/flashcardData";
import { MEMORY_MATCH_DELAY_MS, MEMORY_FLIP_BACK_MS } from "../constants";

// Tạo danh sách thẻ đã xáo trộn từ các cặp term/desc của chương
// Mỗi cặp sinh ra 2 thẻ: 1 thẻ khái niệm, 1 thẻ mô tả — dùng chung pairId
function buildShuffledTiles(pairs) {
  const tiles = pairs.flatMap((pair) => [
    { key: `${pair.id}-term`, pairId: pair.id, kind: "term", text: pair.term },
    { key: `${pair.id}-desc`, pairId: pair.id, kind: "desc", text: pair.desc },
  ]);
  // Xáo trộn Fisher–Yates
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }
  return tiles;
}

const FlashcardDetail = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const chapter = MEMORY_CHAPTERS[id];

  const [round, setRound] = useState(0); // tăng lên để xáo lại khi chơi lại
  const [flippedKeys, setFlippedKeys] = useState([]); // các thẻ đang lật (tối đa 2)
  const [matchedPairs, setMatchedPairs] = useState([]); // pairId đã ghép đúng
  const [moves, setMoves] = useState(0);

  // Xáo trộn lại mỗi khi đổi chương hoặc bấm chơi lại
  // `round` cố ý nằm trong deps để ép tính lại (xáo bài) dù không dùng trực tiếp
  const tiles = useMemo(
    () => (chapter ? buildShuffledTiles(chapter.pairs) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chapter, round]
  );

  const totalPairs = chapter ? chapter.pairs.length : 0;
  const isComparing = flippedKeys.length === 2;
  const isWon = totalPairs > 0 && matchedPairs.length === totalPairs;

  // So khớp khi đã lật đủ 2 thẻ
  useEffect(() => {
    if (flippedKeys.length !== 2) return;
    const [first, second] = flippedKeys.map((key) =>
      tiles.find((tile) => tile.key === key)
    );
    const isMatch = first && second && first.pairId === second.pairId;
    const delay = isMatch ? MEMORY_MATCH_DELAY_MS : MEMORY_FLIP_BACK_MS;
    const timer = setTimeout(() => {
      if (isMatch) setMatchedPairs((prev) => [...prev, first.pairId]);
      setFlippedKeys([]);
    }, delay);
    return () => clearTimeout(timer);
  }, [flippedKeys, tiles]);

  // Thông báo khi hoàn thành
  useEffect(() => {
    if (isWon) {
      showToast(`Hoàn thành! Bạn đã ghép xong với ${moves} lượt.`, "success");
    }
    // Chỉ chạy khi trạng thái thắng thay đổi
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWon]);

  const restartGame = () => {
    setFlippedKeys([]);
    setMatchedPairs([]);
    setMoves(0);
    setRound((prev) => prev + 1);
  };

  const handleTileClick = (tile) => {
    if (isComparing) return; // đang so khớp, khóa thao tác
    if (matchedPairs.includes(tile.pairId)) return; // đã ghép xong
    if (flippedKeys.includes(tile.key)) return; // đang lật rồi
    const next = [...flippedKeys, tile.key];
    setFlippedKeys(next);
    if (next.length === 2) setMoves((prev) => prev + 1);
  };

  if (!chapter) {
    return (
      <PageShell activeKey="flashcards">
        <div className="px-12 py-16 max-w-3xl mx-auto text-center">
          <span className="material-symbols-outlined text-7xl text-gray-300">
            search_off
          </span>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">
            Không tìm thấy chương học
          </h1>
          <Link
            to="/flashcards"
            className="inline-block mt-6 bg-red-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-900"
          >
            ← Quay lại danh sách
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell activeKey="flashcards">
      <PageHero
        eyebrow="Trò chơi lật thẻ ghi nhớ"
        icon="extension"
        title={chapter.title}
        subtitle="Tìm và ghép cặp giữa khái niệm và mô tả tương ứng. Ghép đúng thì hai thẻ biến mất, ghép sai thì thẻ úp lại. Vừa học vừa chơi!"
      />

      <div className="px-6 md:px-12 py-10 max-w-5xl mx-auto">
        {/* Bảng điểm */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex gap-3">
            <div className="bg-white rounded-xl border border-gray-200 px-5 py-3 shadow-sm">
              <p className="text-xs uppercase tracking-wider text-gray-500">
                Số lượt
              </p>
              <p className="text-2xl font-bold text-red-800">{moves}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 px-5 py-3 shadow-sm">
              <p className="text-xs uppercase tracking-wider text-gray-500">
                Đã ghép
              </p>
              <p className="text-2xl font-bold text-red-800">
                {matchedPairs.length}/{totalPairs}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={restartGame}
            className="inline-flex items-center gap-2 border-2 border-red-800 text-red-800 px-5 py-2.5 rounded-lg font-bold hover:bg-red-800 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            Chơi lại / Xáo bài
          </button>
        </div>

        {/* Thông báo thắng */}
        {isWon && (
          <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-6 mb-6 text-center">
            <span className="material-symbols-outlined text-5xl text-green-600">
              celebration
            </span>
            <h2 className="text-2xl font-bold text-green-800 mt-2">
              Xuất sắc! Bạn đã ghép xong tất cả các cặp.
            </h2>
            <p className="text-green-700 mt-1">
              Hoàn thành trong {moves} lượt. Thử lại để cải thiện điểm nhé!
            </p>
          </div>
        )}

        {/* Lưới thẻ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {tiles.map((tile) => {
            const isMatched = matchedPairs.includes(tile.pairId);
            const isFlipped = isMatched || flippedKeys.includes(tile.key);
            const isTerm = tile.kind === "term";
            return (
              <button
                key={tile.key}
                type="button"
                onClick={() => handleTileClick(tile)}
                disabled={isMatched}
                className="relative h-32 md:h-36 w-full"
                style={{ perspective: "1000px" }}
                aria-label={isFlipped ? tile.text : "Thẻ úp"}
              >
                <div
                  className={`relative w-full h-full transition-transform duration-500 ${
                    isMatched ? "opacity-0 scale-90" : "opacity-100"
                  }`}
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* Mặt úp */}
                  <div
                    className="absolute inset-0 rounded-xl bg-gradient-to-br from-red-700 to-red-900 shadow-md flex items-center justify-center"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <span className="material-symbols-outlined text-white/80 text-4xl">
                      psychology_alt
                    </span>
                  </div>

                  {/* Mặt ngửa */}
                  <div
                    className={`absolute inset-0 rounded-xl shadow-md flex items-center justify-center p-3 text-center border-2 ${
                      isTerm
                        ? "bg-white border-red-300"
                        : "bg-blue-50 border-blue-200"
                    }`}
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <div>
                      <span
                        className={`block text-[10px] uppercase tracking-wider font-bold mb-1 ${
                          isTerm ? "text-red-800" : "text-blue-700"
                        }`}
                      >
                        {isTerm ? "Khái niệm" : "Mô tả"}
                      </span>
                      <span
                        className={`${
                          isTerm
                            ? "font-bold text-gray-900 text-sm md:text-base"
                            : "text-gray-700 text-xs md:text-sm leading-snug"
                        }`}
                      >
                        {tile.text}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/flashcards"
            className="text-sm text-gray-500 underline hover:text-red-800"
          >
            ← Quay lại danh sách chương
          </Link>
        </div>
      </div>
    </PageShell>
  );
};

export default FlashcardDetail;
