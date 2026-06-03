import React, { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import PageShell, { PageHero } from "../components/PageShell";
import { useToast } from "../components/Toast";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

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
  const { user } = useAuth();
  const { showToast } = useToast();

  const [dbFlashcards, setDbFlashcards] = useState([]);
  const [chapterDetails, setChapterDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const [round, setRound] = useState(0); // tăng lên để xáo lại khi chơi lại
  const [flippedKeys, setFlippedKeys] = useState([]); // các thẻ đang lật (tối đa 2)
  const [matchedPairs, setMatchedPairs] = useState([]); // pairId đã ghép đúng
  const [moves, setMoves] = useState(0);

  // Fetch dynamic flashcards and chapter title
  useEffect(() => {
    if (!user) return;
    const fetchGameData = async () => {
      setLoading(true);
      try {
        // Fetch course list and journey to get chapter details
        const courses = await api.courses.list();
        const mainCourse = courses.find(c => c.title.includes('Triết học'));
        let foundChapter = null;
        if (mainCourse) {
          const journey = await api.courses.getJourney(mainCourse.id, user.id);
          foundChapter = journey.find(c => c.id === id);
          setChapterDetails(foundChapter);
        }

        // Fetch all flashcards from backend
        const allCards = await api.flashcards.list();
        // Filter cards that belong to this chapter (node.chapterId === id)
        const chapterCards = allCards.filter(card => card.node && card.node.chapterId === id);
        setDbFlashcards(chapterCards);
      } catch (err) {
        console.error("Error loading flashcard detail data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGameData();
  }, [id, user]);

  // Convert dbFlashcards to game pairs
  const pairs = useMemo(() => {
    return dbFlashcards.map((fc, idx) => ({
      id: fc.id || `pair-${idx}`,
      term: fc.question,
      desc: fc.answer
    }));
  }, [dbFlashcards]);

  // Xáo trộn lại mỗi khi đổi chương hoặc bấm chơi lại
  // `round` cố ý nằm trong deps để ép tính lại (xáo bài) dù không dùng trực tiếp
  const tiles = useMemo(() => {
    void round; // force recalculation on reshuffle
    return pairs.length > 0 ? buildShuffledTiles(pairs) : [];
  }, [pairs, round]);

  const totalPairs = pairs.length;
  const isWon = totalPairs > 0 && matchedPairs.length === totalPairs;

  // Thông báo khi hoàn thành
  useEffect(() => {
    if (isWon) {
      showToast(`Hoàn thành! Bạn đã ghép xong với ${moves} lượt.`, "success");
    }
  }, [isWon, moves, showToast]);

  const restartGame = () => {
    setFlippedKeys([]);
    setMatchedPairs([]);
    setMoves(0);
    setRound((prev) => prev + 1);
  };

  const handleTileClick = (tile) => {
    if (matchedPairs.includes(tile.pairId)) return; // đã ghép xong
    if (flippedKeys.includes(tile.key)) return; // đang lật rồi

    // Nếu đang lật 2 thẻ chưa khớp, bấm thẻ thứ 3 sẽ úp 2 thẻ cũ lại và ngửa thẻ mới lên
    if (flippedKeys.length === 2) {
      setFlippedKeys([tile.key]);
      return;
    }

    // Nếu đã lật 1 thẻ
    if (flippedKeys.length === 1) {
      const firstKey = flippedKeys[0];
      const firstTile = tiles.find((t) => t.key === firstKey);
      
      setMoves((prev) => prev + 1);

      if (firstTile && firstTile.pairId === tile.pairId) {
        // KHỚP NHAU! Ghép cặp thành công
        setMatchedPairs((prev) => [...prev, tile.pairId]);
        setFlippedKeys([]);
      } else {
        // KHÔNG KHỚP! Giữ cả 2 ngửa mặt cho tới khi bấm thẻ thứ 3
        setFlippedKeys([firstKey, tile.key]);
      }
      return;
    }

    // Nếu chưa lật thẻ nào
    setFlippedKeys([tile.key]);
  };

  if (loading) {
    return (
      <PageShell activeKey="practice">
        <div className="text-center py-20">
          <span className="material-symbols-outlined animate-spin text-5xl text-red-800">sync</span>
          <p className="text-gray-500 mt-4 font-semibold">Đang chuẩn bị trò chơi học tập...</p>
        </div>
      </PageShell>
    );
  }

  if (!chapterDetails) {
    return (
      <PageShell activeKey="practice">
        <div className="px-12 py-16 max-w-3xl mx-auto text-center">
          <span className="material-symbols-outlined text-7xl text-gray-300">
            search_off
          </span>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">
            Không tìm thấy chương học
          </h1>
          <Link
            to="/practice"
            className="inline-block mt-6 bg-red-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-900"
          >
            ← Quay lại danh sách
          </Link>
        </div>
      </PageShell>
    );
  }

  if (totalPairs === 0) {
    return (
      <PageShell activeKey="practice">
        <PageHero
          eyebrow="Trò chơi lật thẻ ghi nhớ"
          icon="extension"
          title={chapterDetails.title}
          subtitle="Tìm và ghép cặp giữa khái niệm và mô tả tương ứng. Ghép đúng thì hai thẻ biến mất, ghép sai thì thẻ úp lại."
        />
        <div className="px-12 py-16 max-w-3xl mx-auto text-center">
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
            <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">
              layers_clear
            </span>
            <h3 className="font-bold text-gray-800 text-lg mb-1">Chưa có Flashcard nào</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              Chương này hiện chưa có dữ liệu thẻ ghi nhớ học thuật để bắt đầu trò chơi ghép cặp. Ban quản trị đang cập nhật bài tập.
            </p>
            <Link
              to="/practice"
              className="inline-block mt-6 bg-red-800 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-red-900 transition-colors"
            >
              ← Quay lại danh sách
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell activeKey="practice">
      <PageHero
        eyebrow="Trò chơi lật thẻ ghi nhớ"
        icon="extension"
        title={chapterDetails.title}
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
            to="/practice"
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
