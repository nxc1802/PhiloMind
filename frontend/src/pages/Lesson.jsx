import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import PageShell from "../components/PageShell";
import LessonMindmap from "../components/LessonMindmap";
import { useToast } from "../components/Toast";
import { PODCAST_SKIP_SECONDS } from "../constants";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { getTitleFromSlug, getSlugFromTitle } from "../utils/slug";

const QUIZ_PASS_THRESHOLD = 80;

// --- Custom Lightweight Markdown-to-JSX Parser ---
function parseInlineMarkdown(text) {
  if (!text) return "";
  const parts = [];
  let lastIndex = 0;
  const boldRegex = /\*\*(.*?)\*\*/g;
  let match;
  while ((match = boldRegex.exec(text)) !== null) {
    const matchIndex = match.index;
    if (matchIndex > lastIndex) {
      parts.push(text.slice(lastIndex, matchIndex));
    }
    parts.push(
      <strong key={matchIndex} className="font-bold text-red-950">
        {match[1]}
      </strong>
    );
    lastIndex = boldRegex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? parts : text;
}

function parseMarkdownToReact(text) {
  if (!text) return null;
  const lines = text.split("\n").map(line => line.trim());
  
  return lines.map((line, index) => {
    if (!line) {
      return <div key={index} className="h-2" />;
    }

    // 1. Heading 1 / Main title (# or 1.)
    if (line.startsWith("# ") || /^\d+\.\s+/.test(line)) {
      const cleanText = line.startsWith("# ") ? line.slice(2) : line;
      return (
        <h2 key={index} className="text-xl md:text-2xl font-bold text-red-950 border-b-2 border-red-200/60 pb-2 mt-8 mb-4 font-serif">
          {parseInlineMarkdown(cleanText)}
        </h2>
      );
    }

    // 2. Heading 2 / Sub-title (## or a) )
    if (line.startsWith("## ") || /^[a-z]\)\s+/.test(line)) {
      const cleanText = line.startsWith("## ") ? line.slice(3) : line;
      return (
        <h3 key={index} className="text-lg md:text-xl font-bold text-red-800 mt-6 mb-3 font-serif">
          {parseInlineMarkdown(cleanText)}
        </h3>
      );
    }

    // 3. Heading 3 / List bullet title (### or * )
    if (line.startsWith("### ") || line.startsWith("* ")) {
      const cleanText = line.startsWith("### ") ? line.slice(4) : line.slice(2).trim();
      return (
        <div key={index} className="flex items-start gap-2.5 mt-5 mb-3 pl-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-800 mt-2.5 shrink-0" />
          <span className="text-base font-bold text-red-900">
            {parseInlineMarkdown(cleanText)}
          </span>
        </div>
      );
    }

    // 4. Blockquotes (> )
    if (line.startsWith("> ")) {
      const cleanText = line.slice(2).trim();
      return (
        <blockquote key={index} className="border-l-4 border-red-800 bg-red-50/40 pl-5 pr-3 py-4 my-5 italic text-red-950 rounded-r-lg font-serif">
          {parseInlineMarkdown(cleanText)}
        </blockquote>
      );
    }

    // 5. Standard paragraph
    return (
      <p key={index} className="text-gray-700 leading-relaxed mb-4 text-justify text-sm md:text-base">
        {parseInlineMarkdown(line)}
      </p>
    );
  });
}

// --- Helper tạo className cho 1 đáp án trắc nghiệm dựa trên trạng thái ---
function getOptionClassName({ submitted, picked, isCorrect, base, sizing }) {
  let cls = `${base} ${sizing} transition-all `;
  if (!submitted) {
    cls += picked
      ? "border-red-800 bg-red-50"
      : "border-gray-200 hover:border-red-300";
  } else if (isCorrect) {
    cls += "border-green-500 bg-green-50 text-green-900";
  } else if (picked) {
    cls += "border-red-400 bg-red-50 text-red-900";
  } else {
    cls += "border-gray-200 opacity-60";
  }
  return cls;
}

// --- Tiện ích định dạng thời gian giây -> mm:ss ---
function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

/* ============================================================
   WARM-UP — chọn ngẫu nhiên 1 mục từ WARMUP_POOL mỗi lần mở bài
   ============================================================ */
function WarmupImageGuess({ data, onDone }) {
  const [input, setInput] = useState("");
  const [revealed, setRevealed] = useState(false);
  const isCorrect =
    revealed || input.trim().toLowerCase() === data.answer.toLowerCase();

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <img
        src={data.image}
        alt="warmup"
        className="w-full h-64 object-cover rounded-xl"
      />
      <div>
        <p className="text-sm text-gray-600 mb-2">{data.hint}</p>
        <div className="font-mono text-3xl tracking-[0.4em] text-red-800 mb-4 bg-red-50 px-4 py-3 rounded-lg inline-block">
          {data.blanks}
        </div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Gõ đáp án của bạn..."
          disabled={isCorrect}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-800 outline-none mb-3 text-gray-800"
        />
        {isCorrect ? (
          <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-lg text-sm">
            <span className="material-symbols-outlined align-middle text-base mr-1">
              check_circle
            </span>
            {data.reveal}
            <button
              onClick={onDone}
              className="block mt-3 bg-red-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-900"
            >
              Bắt đầu bài học →
            </button>
          </div>
        ) : (
          <button
            onClick={() => setRevealed(true)}
            className="text-sm text-gray-500 underline"
          >
            Bỏ qua / xem đáp án
          </button>
        )}
      </div>
    </div>
  );
}

function WarmupStory({ data, onDone }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const submitted = selectedIndex !== null;
  const isCorrect = selectedIndex === data.correctIndex;

  return (
    <div>
      <blockquote className="border-l-4 border-red-800 bg-red-50/40 pl-5 pr-3 py-4 italic text-gray-800 mb-5 rounded-r-lg">
        "{data.story}"
      </blockquote>
      <p className="font-semibold mb-3 text-gray-900">{data.question}</p>
      <div className="space-y-2 mb-4">
        {data.options.map((option, index) => (
          <button
            key={index}
            disabled={submitted}
            onClick={() => setSelectedIndex(index)}
            className={getOptionClassName({
              submitted,
              picked: index === selectedIndex,
              isCorrect: index === data.correctIndex,
              base: "block w-full text-left rounded-lg border-2 text-gray-800 bg-white",
              sizing: "px-4 py-3",
            })}
          >
            {option}
          </button>
        ))}
      </div>
      {submitted && (
        <div
          className={`p-3 rounded-lg text-sm ${
            isCorrect
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-amber-50 border border-amber-200 text-amber-800"
          }`}
        >
          <span className="material-symbols-outlined align-middle text-base mr-1">
            {isCorrect ? "check_circle" : "lightbulb"}
          </span>
          {data.reveal}
          <button
            onClick={onDone}
            className="block mt-3 bg-red-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-900"
          >
            Bắt đầu bài học →
          </button>
        </div>
      )}
    </div>
  );
}

function WarmupVideo({ data, onDone }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const submitted = selectedIndex !== null;
  const isCorrect = selectedIndex === data.correctIndex;
  const videoId = useMemo(() => getYouTubeId(data.image), [data.image]);

  return (
    <div>
      <div className="relative rounded-xl overflow-hidden shadow-md mb-5 aspect-video max-w-lg mx-auto">
        <iframe
          title="warmup-video"
          width="100%"
          height="300"
          src={`https://www.youtube.com/embed/${videoId}`}
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
          className="w-full h-full absolute inset-0"
        />
      </div>
      <p className="font-semibold mb-3 text-gray-900">{data.question}</p>
      <div className="space-y-2 mb-4">
        {data.options.map((option, index) => (
          <button
            key={index}
            disabled={submitted}
            onClick={() => setSelectedIndex(index)}
            className={getOptionClassName({
              submitted,
              picked: index === selectedIndex,
              isCorrect: index === data.correctIndex,
              base: "block w-full text-left rounded-lg border-2 text-gray-800 bg-white",
              sizing: "px-4 py-3",
            })}
          >
            {option}
          </button>
        ))}
      </div>
      {submitted && (
        <div
          className={`p-3 rounded-lg text-sm ${
            isCorrect
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-amber-50 border border-amber-200 text-amber-800"
          }`}
        >
          <span className="material-symbols-outlined align-middle text-base mr-1">
            {isCorrect ? "check_circle" : "lightbulb"}
          </span>
          {data.reveal}
          <button
            onClick={onDone}
            className="block mt-3 bg-red-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-900"
          >
            Bắt đầu bài học →
          </button>
        </div>
      )}
    </div>
  );
}

function WarmupSection({ dbWarmups, onDone }) {
  const warmup = useMemo(() => {
    if (dbWarmups && dbWarmups.length > 0) {
      return dbWarmups[Math.floor(Math.random() * dbWarmups.length)];
    }
    return null;
  }, [dbWarmups]);

  const normalizedWarmup = useMemo(() => {
    if (!warmup) return null;
    let options = warmup.options;
    if (typeof options === 'string') {
      try {
        options = JSON.parse(options);
      } catch (_) {}
    }
    return {
      ...warmup,
      options: Array.isArray(options) ? options : [],
      hint: warmup.type === 'image-guess' ? (warmup.hint || 'Nhìn hình đoán từ khóa ẩn dụ triết học dưới đây:') : undefined
    };
  }, [warmup]);

  if (!normalizedWarmup) return null;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-amber-200 p-7 mb-8 relative overflow-hidden">
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-100 rounded-full opacity-50" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-amber-700">
            local_fire_department
          </span>
          <span className="text-xs uppercase tracking-wider text-amber-700 font-bold">
            Làm nóng / Đặt vấn đề
          </span>
        </div>
        <h2 className="text-2xl font-bold text-red-900 mb-5">{normalizedWarmup.title}</h2>
        {normalizedWarmup.type === "image-guess" ? (
          <WarmupImageGuess data={normalizedWarmup} onDone={onDone} />
        ) : normalizedWarmup.type === "video" ? (
          <WarmupVideo data={normalizedWarmup} onDone={onDone} />
        ) : normalizedWarmup.type === "game" ? (
          <WorldviewFilterGame onDone={onDone} />
        ) : (
          <WarmupStory data={normalizedWarmup} onDone={onDone} />
        )}
      </div>
    </div>
  );
}

function getYouTubeId(url) {
  if (!url) return "Mzg-AdRrjGY"; // Fallback to original Marxist lecture video
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : "Mzg-AdRrjGY";
}

function VideoWithReminder({ dbVideoUrl }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasWatched, setHasWatched] = useState(false);
  
  const videoId = useMemo(() => getYouTubeId(dbVideoUrl), [dbVideoUrl]);

  return (
    <div>
      <div className="relative rounded-2xl overflow-hidden shadow-md">
        {!isPlaying ? (
          <>
            <img
              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
              onError={(e) => {
                e.target.src = "https://lh3.googleusercontent.com/aida-public/AB6AXuBH2B61U2pvTiqNDznECZTR6c23wIvgyi4J5Ll15gv5cUcLbGLXLY2OtCE2hK2emP701nZiEfixugjSnyoapb_RmWY-NgGH0sklSpAXr2EvHwZVYz6JBvtwA_f0tRCiz1elSBM6ODysHkj8mwpLevHY67mGVpWvpU039VV8EHDrHNt0H3Tcg2gcgIvvxsuLwQCsHTF96fzS8DDhE6laJCgSIaWW2_VIcfLKJ1SJho3Ef52utpQwgPAkP6TVWVvtmHTGHqsTHD68LJo";
              }}
              alt="Bia bai hoc"
              className="w-full block h-64 md:h-[430px] object-cover"
            />
            <button
              type="button"
              onClick={() => setIsPlaying(true)}
              aria-label="Phat video bai hoc"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-20 rounded-full bg-red-800/90 hover:bg-red-900 text-white flex items-center justify-center transition-transform hover:scale-110"
            >
              <span className="material-symbols-outlined text-4xl">
                play_arrow
              </span>
            </button>
          </>
        ) : (
          <iframe
            title="lesson-video"
            width="100%"
            height="430"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="block"
          />
        )}
      </div>
      {isPlaying && !hasWatched && (
        <button
          onClick={() => setHasWatched(true)}
          className="mt-3 bg-red-800 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-900 text-sm"
        >
          <span className="material-symbols-outlined align-middle text-base mr-1">
            check
          </span>
          Tôi đã xem xong video
        </button>
      )}
      {hasWatched && (
        <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-4 text-green-800 flex items-center gap-2">
          <span className="material-symbols-outlined">check_circle</span>
          <span className="font-semibold text-sm">Tuyệt vời! Đồng chí đã hoàn thành việc xem video bài học bổ trợ này.</span>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   HOÀN THÀNH BÀI HỌC — bài kiểm tra trắc nghiệm cuối bài để mở khóa bài tiếp theo
   ============================================================ */
function FinalQuiz({ dbFlashcards, onComplete }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizState, setQuizState] = useState("start"); // "start" | "quiz" | "result"

  const questions = useMemo(() => {
    if (!dbFlashcards || dbFlashcards.length === 0) return [];
    return dbFlashcards.map((fc) => {
      if (!fc.question) return null;
      const lines = fc.question.split("\n");
      const questionText = lines[0];
      const options = lines.slice(1).map(line => line.trim()).filter(Boolean);
      return {
        id: fc.id,
        question: questionText,
        options: options,
        answer: fc.answer ? fc.answer.trim() : ""
      };
    }).filter(Boolean);
  }, [dbFlashcards]);

  const handleStart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setCorrectCount(0);
    setQuizState("quiz");
  };

  const handleSelectOption = (option) => {
    if (isAnswered) return;
    setSelectedOption(option);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null || isAnswered) return;
    const currentQ = questions[currentIdx];
    const isCorrect = selectedOption === currentQ.answer;
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
    }
    setIsAnswered(true);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setQuizState("result");
      const scorePercent = Math.round((correctCount / questions.length) * 100);
      if (scorePercent >= QUIZ_PASS_THRESHOLD && onComplete) {
        onComplete(scorePercent, 100);
      }
    }
  };

  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 text-center space-y-4 mt-8">
        <h3 className="text-2xl font-bold text-red-900 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-red-800 text-3xl">task_alt</span>
          Hoàn thành bài học
        </h3>
        <p className="text-gray-600 text-sm max-w-md mx-auto">
          Bài học này không có câu hỏi kiểm tra cuối khóa. Đồng chí có thể xác nhận để mở khoá bài tiếp theo.
        </p>
        <button
          onClick={() => onComplete && onComplete(100, 100)}
          className="bg-red-800 hover:bg-red-950 text-white font-bold px-8 py-3.5 rounded-xl shadow-md transition-all inline-flex items-center gap-2"
        >
          <span className="material-symbols-outlined">verified</span>
          Xác nhận Hoàn thành
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const scorePercent = Math.round((correctCount / questions.length) * 100);
  const passed = scorePercent >= QUIZ_PASS_THRESHOLD;

  if (quizState === "start") {
    return (
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 text-center space-y-5 mt-8">
        <div className="inline-flex items-center justify-center h-16 w-16 bg-red-50 rounded-2xl text-red-800 border border-red-100 mb-2">
          <span className="material-symbols-outlined text-4xl">assignment</span>
        </div>
        <h3 className="text-2xl font-bold text-red-900">Bài kiểm tra Tổng kết</h3>
        <p className="text-gray-600 text-sm max-w-md mx-auto leading-relaxed">
          Đồng chí cần hoàn thành bài kiểm tra gồm <strong>{questions.length} câu hỏi</strong> trắc nghiệm để chứng minh độ thấu hiểu kiến thức. Điểm đạt tối thiểu là <strong>{QUIZ_PASS_THRESHOLD}%</strong> để mở khóa bài học tiếp theo.
        </p>
        <button
          onClick={handleStart}
          className="bg-red-800 hover:bg-red-900 text-white font-bold px-8 py-3.5 rounded-xl shadow-md transition-transform hover:scale-105 inline-flex items-center gap-2"
        >
          <span className="material-symbols-outlined">play_circle</span>
          Bắt đầu kiểm tra
        </button>
      </div>
    );
  }

  if (quizState === "result") {
    return (
      <div className={`rounded-2xl p-8 border text-center space-y-6 mt-8 shadow-lg transition-all ${
        passed
          ? "bg-gradient-to-br from-emerald-50 to-green-50/30 border-green-200 text-green-950"
          : "bg-gradient-to-br from-rose-50 to-red-50/30 border-red-200 text-red-950"
      }`}>
        <div className="text-5xl animate-bounce">
          {passed ? "🏆" : "❌"}
        </div>
        <h3 className="text-2xl font-extrabold tracking-wide">
          {passed ? "VƯỢT QUA KỲ KIỂM TRA!" : "KẾT QUẢ KHÔNG ĐẠT!"}
        </h3>
        <p className="text-sm max-w-md mx-auto leading-relaxed text-gray-700">
          {passed
            ? "Tuyệt vời! Đồng chí đã xuất sắc vượt qua kỳ kiểm tra tổng kết của bài học này và chính thức mở khóa bài học tiếp theo trên sơ đồ tư duy."
            : `Đồng chí chỉ đạt ${scorePercent}% câu trả lời đúng (yêu cầu tối thiểu ${QUIZ_PASS_THRESHOLD}%). Vui lòng nghiên cứu kỹ lại giáo trình và thử lại.`}
        </p>

        <div className="bg-white/80 backdrop-blur border border-gray-150 rounded-2xl p-5 shadow-inner max-w-xs mx-auto">
          <span className="text-xs uppercase tracking-wider text-gray-500 font-bold block mb-1">Kết quả đạt được</span>
          <h4 className="text-3xl font-black text-slate-800">
            {correctCount} / {questions.length}
          </h4>
          <span className={`text-xs font-bold px-2 py-0.5 rounded mt-2 inline-block ${
            passed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            {scorePercent}% - {passed ? "ĐẠT" : "CHƯA ĐẠT"}
          </span>
        </div>

        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={handleStart}
            className="border-2 border-red-800 text-red-800 font-bold px-6 py-3 rounded-xl hover:bg-red-850 hover:text-white transition-all shadow"
          >
            Làm lại
          </button>
        </div>
      </div>
    );
  }

  const isCurrentQCorrect = selectedOption === currentQ.answer;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 md:p-8 mt-8 space-y-5 text-left relative overflow-hidden">
      {/* Quiz progress */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-red-700">Bài kiểm tra tổng kết</span>
          <h4 className="font-extrabold text-lg text-slate-800">Câu hỏi trắc nghiệm</h4>
        </div>
        <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-gray-150 text-xs font-bold text-slate-600">
          Câu {currentIdx + 1} / {questions.length} (Đúng: {correctCount})
        </div>
      </div>

      <div className="space-y-4">
        {/* Question Text */}
        <div className="bg-slate-50 p-5 rounded-xl border-l-4 border-red-800 shadow-inner">
          <p className="text-slate-800 text-base font-semibold leading-relaxed">
            {currentQ.question}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-2">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            let optionCls = "w-full text-left rounded-xl border-2 px-4 py-3.5 text-sm font-semibold transition-all hover:scale-[1.01] block bg-white ";
            
            if (!isAnswered) {
              if (isSelected) {
                optionCls += "border-red-800 bg-red-50 text-red-950";
              } else {
                optionCls += "border-gray-200 text-gray-700 hover:border-red-300";
              }
            } else {
              const isCorrectAnswer = option === currentQ.answer;
              if (isCorrectAnswer) {
                optionCls += "border-green-500 bg-green-50 text-green-900";
              } else if (isSelected) {
                optionCls += "border-red-400 bg-red-50 text-red-900";
              } else {
                optionCls += "border-gray-100 opacity-60 text-gray-400";
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSelectOption(option)}
                className={optionCls}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
        {!isAnswered ? (
          <button
            type="button"
            disabled={selectedOption === null}
            onClick={handleCheckAnswer}
            className="bg-red-800 hover:bg-red-900 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-all shadow flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm font-bold">fact_check</span>
            Kiểm tra đáp án
          </button>
        ) : (
          <div className="flex items-center gap-3 w-full justify-between">
            <span className={`text-xs font-bold flex items-center gap-1 ${
              isCurrentQCorrect ? "text-green-700" : "text-red-700"
            }`}>
              <span className="material-symbols-outlined text-base">
                {isCurrentQCorrect ? "check_circle" : "cancel"}
              </span>
              {isCurrentQCorrect ? "Chính xác!" : `Sai rồi! Đáp án đúng là: ${currentQ.answer}`}
            </span>
            <button
              type="button"
              onClick={handleNext}
              className="bg-red-800 hover:bg-red-900 text-white font-bold px-6 py-3 rounded-xl transition-all shadow flex items-center gap-1"
            >
              Tiếp tục
              <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   PODCAST PLAYER kiểu Spotify Lyrics — câu đang nói sẽ sáng lên
   ============================================================ */
function PodcastPlayer({ dbPodcast }) {
  const audioRef = useRef(null);
  const lineRefs = useRef([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Normalize DB podcast
  const episode = useMemo(() => {
    if (!dbPodcast) {
      return {
        id: "",
        title: "",
        host: "",
        cover: "",
        src: "",
        transcript: []
      };
    }
    // Normalize transcript line times
    const rawTranscript = Array.isArray(dbPodcast.transcript) ? dbPodcast.transcript : [];
    const normalizedLines = rawTranscript.map(line => ({
      t: line.t !== undefined ? line.t : (line.time !== undefined ? line.time : 0),
      text: line.text || ""
    }));

    return {
      id: dbPodcast.id,
      title: "Podcast Tập Âm Thanh Học Liệu",
      host: "Ban biên tập PhiloMind",
      cover: "https://images.unsplash.com/photo-1485579149621-3123dd979885?w=600&auto=format&fit=crop",
      src: dbPodcast.audioUrl || "",
      transcript: normalizedLines
    };
  }, [dbPodcast]);

  // Tìm dòng đang phát
  const activeLineIndex = useMemo(() => {
    if (!episode || !episode.transcript) return -1;
    let foundIndex = -1;
    for (let i = 0; i < episode.transcript.length; i++) {
      if (episode.transcript[i].t <= currentTime) foundIndex = i;
      else break;
    }
    return foundIndex;
  }, [currentTime, episode]);

  // Tự động cuộn dòng đang phát vào giữa
  useEffect(() => {
    const lineElement = lineRefs.current[activeLineIndex];
    if (lineElement) {
      lineElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeLineIndex]);

  if (!dbPodcast) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center text-gray-500">
        <div className="flex flex-col items-center py-6">
          <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">
            podcasts
          </span>
          <h4 className="font-bold text-gray-800 mb-1">Chưa có Podcast thuyết minh</h4>
          <p className="text-gray-500 text-sm max-w-sm">
            Bài học này chưa có bản AI Podcast thuyết minh học thuật chính thức. Ban quản trị sẽ cập nhật nội dung âm thanh trong thời gian sớm nhất.
          </p>
        </div>
      </div>
    );
  }

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const seekTo = (timeInSeconds) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = timeInSeconds;
    setCurrentTime(timeInSeconds);
    if (!isPlaying) audio.play();
  };

  const handleSeekBarChange = (e) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const getLineClassName = (lineIndex) => {
    const isActive = lineIndex === activeLineIndex;
    const isPast = lineIndex < activeLineIndex;
    if (isActive) {
      return "block w-full text-left text-white text-xl font-bold scale-[1.02] origin-left transition-all duration-300 leading-snug";
    }
    if (isPast) {
      return "block w-full text-left text-white/40 text-base hover:text-white/70 transition-all duration-300 leading-snug";
    }
    return "block w-full text-left text-white/55 text-base hover:text-white/80 transition-all duration-300 leading-snug";
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900 rounded-2xl shadow-xl p-7 mt-8 text-white relative overflow-hidden">
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-3xl" />
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-indigo-200">
            headphones
          </span>
          <span className="text-xs uppercase tracking-wider text-indigo-200 font-bold">
            Podcast bài học {dbPodcast ? "(Dữ liệu thực tế)" : "(Bản Demo)"}
          </span>
        </div>

        {/* Header: cover + tiêu đề */}
        <div className="flex items-center gap-4 mb-5">
          <img
            src={episode.cover}
            alt="cover"
            className="h-20 w-20 rounded-xl object-cover shadow-lg shrink-0"
          />
          <div className="min-w-0">
            <h2 className="text-2xl font-bold truncate">{episode.title}</h2>
            <p className="text-indigo-200 text-sm">{episode.host}</p>
          </div>
        </div>

        {/* Transcript đồng bộ */}
        <div className="bg-black/30 backdrop-blur rounded-xl p-5 mb-5 max-h-72 overflow-y-auto scroll-smooth">
          <div className="space-y-3">
            {episode.transcript.map((line, index) => (
              <button
                key={index}
                ref={(el) => (lineRefs.current[index] = el)}
                onClick={() => seekTo(line.t)}
                className={getLineClassName(index)}
              >
                {line.text}
              </button>
            ))}
          </div>
        </div>

        {/* Thanh điều khiển */}
        <div className="bg-white/10 backdrop-blur rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2 text-xs text-indigo-200">
            <span className="tabular-nums">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={handleSeekBarChange}
              className="flex-1 accent-white"
            />
            <span className="tabular-nums">{formatTime(duration)}</span>
          </div>
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() =>
                seekTo(Math.max(0, currentTime - PODCAST_SKIP_SECONDS))
              }
              className="text-white/80 hover:text-white"
              title={`Lùi ${PODCAST_SKIP_SECONDS}s`}
            >
              <span className="material-symbols-outlined">fast_rewind</span>
            </button>
            <button
              onClick={togglePlay}
              className="h-14 w-14 rounded-full bg-white text-indigo-900 flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
            >
              <span className="material-symbols-outlined text-3xl">
                {isPlaying ? "pause" : "play_arrow"}
              </span>
            </button>
            <button
              onClick={() =>
                seekTo(Math.min(duration, currentTime + PODCAST_SKIP_SECONDS))
              }
              className="text-white/80 hover:text-white"
              title={`Tiến ${PODCAST_SKIP_SECONDS}s`}
            >
              <span className="material-symbols-outlined">fast_forward</span>
            </button>
          </div>
          <audio
            key={episode.src} // Force reload when src changes
            ref={audioRef}
            src={episode.src}
            onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.target.duration)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            preload="metadata"
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MAP trạng thái syllabus -> material icon + Tailwind class
   ============================================================ */
const SYLLABUS_STATUS_CONFIG = {
  completed: {
    icon: "check_circle",
    className: "bg-green-50 text-green-800 border-green-200 cursor-pointer hover:bg-green-100",
  },
  active: {
    icon: "play_circle",
    className: "bg-red-50 text-red-800 border-red-300 font-semibold cursor-pointer hover:bg-red-100",
  },
  locked: {
    icon: "lock",
    className: "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-60",
  },
};

/* ============================================================
   DISCUSSION / COMMENTS - Thảo luận riêng cho từng bài học
   ============================================================ */
function LessonDiscussion({ nodeId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const fetchComments = useCallback(async () => {
    try {
      const res = await api.courses.comments.list(nodeId);
      setComments(res);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  }, [nodeId]);

  useEffect(() => {
    if (nodeId) {
      fetchComments();
    }
  }, [nodeId, fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      await api.courses.comments.create(nodeId, user.id, newComment.trim(), user.role || 'student');
      setNewComment("");
      showToast("Đã gửi bình luận thảo luận thành công!", "success");
      await fetchComments();
    } catch (err) {
      showToast("Gửi bình luận thất bại: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-7 mt-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-red-800">
          forum
        </span>
        <h3 className="text-xl font-bold text-red-900">Diễn đàn Thảo luận</h3>
      </div>
      
      <p className="text-sm text-gray-500 mb-6">
        Chia sẻ suy nghĩ, đặt câu hỏi học thuật và thảo luận cùng các học viên khác hoặc Admin về bài học này.
      </p>

      {/* Danh sách bình luận */}
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 mb-6">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <span className="material-symbols-outlined text-4xl block mb-2 opacity-50">chat_bubble_outline</span>
            Chưa có thảo luận nào. Hãy là người đầu tiên đưa ra quan điểm!
          </div>
        ) : (
          comments.map((comment) => {
            const isAdmin = comment.role === 'admin';
            return (
              <div 
                key={comment.id} 
                className={`p-4 rounded-xl border transition-all ${
                  isAdmin 
                    ? "bg-red-50/70 border-red-200" 
                    : "bg-gray-50 border-gray-100"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-gray-600">
                      {isAdmin ? "shield_person" : "account_circle"}
                    </span>
                    <span className={`text-sm font-bold ${isAdmin ? "text-red-900" : "text-gray-800"}`}>
                      {comment.userName || "Học viên"}
                    </span>
                    {isAdmin && (
                      <span className="bg-red-800 text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">
                        Triết gia / Admin
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(comment.createdAt).toLocaleDateString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="text-gray-750 text-sm whitespace-pre-line pl-7 leading-relaxed">
                  {comment.content}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Form nhập bình luận */}
      <form onSubmit={handleSubmit} className="border-t border-gray-100 pt-4">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Chia sẻ quan điểm biện chứng của đồng chí..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={loading}
            className="flex-grow px-4 py-3 border border-gray-300 rounded-xl focus:border-red-800 outline-none text-sm text-gray-850 bg-gray-50/50"
          />
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="bg-red-800 text-white px-5 py-3 rounded-xl font-bold hover:bg-red-900 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-lg">sync</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-base font-bold">send</span>
                <span>Gửi</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ============================================================
   TRÒ CHƠI TƯƠNG TÁC CAO CẤP: KÍNH LỌC CUỘC ĐỜI (The Worldview Filter)
   ============================================================ */
const SITUATIONS = [
  {
    text: 'Bạn vừa trượt môn Triết học Mác - Lênin. Phản ứng: "Chắc do hôm đi thi bước chân trái ra đường, vũ trụ đang gửi tín hiệu từ chối mình rồi!"',
    category: 'myth',
    label: 'Huyền thoại',
    explanation: 'Đúng vậy! Đổ lỗi cho vũ trụ hay việc đi chân trái ra đường là đặc trưng của tư duy huyền thoại, giải thích thế giới bằng niềm tin cảm tính và các liên hệ siêu nhiên không có thật.'
  },
  {
    text: 'Bạn vừa trượt môn Triết học Mác - Lênin. Phản ứng: "Do mình chưa đi thắp hương cầu may đầu tháng, để mai đi hóa vàng giải hạn xem sao."',
    category: 'religion',
    label: 'Tôn giáo',
    explanation: 'Đúng vậy! Việc tin rằng thắp hương cầu may, hóa vàng giải hạn sẽ giải quyết được việc thi cử phản ánh thế giới quan tôn giáo, dựa vào sự cứu rỗi từ đấng siêu nhiên hay thần linh.'
  },
  {
    text: 'Bạn vừa trượt môn Triết học Mác - Lênin. Phản ứng: "Học tài thi phận cái gì, do lười cày MCQ chứ đâu. Bản chất vấn đề là phương pháp học sai, để lập lại thời gian biểu!"',
    category: 'philosophy',
    label: 'Triết học',
    explanation: 'Xuất sắc! Đây chính là thế giới quan triết học duy vật biện chứng, nhìn nhận bản chất vấn đề từ nguyên nhân thực tiễn và nỗ lực hành động thực tế của con người.'
  },
  {
    text: 'Lập trình viên nhìn AI viết code nhanh gấp 10 lần mình và phán: "Chắc kiếp trước mình tạo nghiệp nhiều quá nên kiếp này số trời định đoạt mình bị AI cướp công việc rồi!"',
    category: 'religion',
    label: 'Tôn giáo',
    explanation: 'Chính xác! Đổ lỗi cho kiếp trước, nghiệp hay định mệnh tiền định là thế giới quan tôn giáo/số mệnh.'
  },
  {
    text: 'Hiện tượng sấm sét giông bão đùng đùng giận dữ được giải thích: "Là do Thần Sét Thiên Lôi đang nổi giận lôi đình gõ búa xuống trần gian trừng phạt kẻ xấu!"',
    category: 'myth',
    label: 'Huyền thoại',
    explanation: 'Đúng vậy! Nhân cách hóa tự nhiên thành thần linh (như Thiên Lôi) để giải thích sấm sét là biểu hiện kinh điển của thế giới quan huyền thoại cổ đại.'
  }
];

function WorldviewFilterGame({ onDone }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isWon, setIsWon] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    let timer;
    if (isPlaying && !isWon && !isGameOver) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsGameOver(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isWon, isGameOver]);

  const startGame = () => {
    setIsPlaying(true);
    setCurrentIdx(0);
    setScore(0);
    setTimeLeft(60);
    setIsWon(false);
    setIsGameOver(false);
    setFeedback(null);
  };

  const handleChoose = (category) => {
    const currentQuestion = SITUATIONS[currentIdx];
    if (category === currentQuestion.category) {
      setFeedback({
        isCorrect: true,
        text: currentQuestion.explanation
      });
      setScore((prev) => prev + 1);
    } else {
      setFeedback({
        isCorrect: false,
        text: `Sai rồi! Lựa chọn đó không phản ánh đúng tư duy của phát ngôn này. Hãy thử lại!`
      });
      setIsGameOver(true);
    }
  };

  const nextQuestion = () => {
    setFeedback(null);
    if (currentIdx < SITUATIONS.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setIsWon(true);
    }
  };

  if (!isPlaying) {
    return (
      <div className="bg-slate-900 text-white rounded-2xl p-8 border border-red-500/20 shadow-xl text-center space-y-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.1),transparent)] pointer-events-none" />
        <div className="inline-flex items-center justify-center h-16 w-16 bg-red-800/20 rounded-2xl text-red-500 border border-red-800/30 mb-2">
          <span className="material-symbols-outlined text-4xl">travel_explore</span>
        </div>
        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-300">
          TRÒ CHƠI: KÍNH LỌC CUỘC ĐỜI (The Worldview Filter)
        </h3>
        <p className="text-gray-300 text-sm max-w-xl mx-auto leading-relaxed">
          Đồng chí hãy nhập vai thành một nhà biện chứng thực tế! Nhiệm vụ của đồng chí là phân loại đúng <strong>5 tình huống/phát ngôn thực tế</strong> vào 3 nhóm thế giới quan khác nhau trong vòng <strong>60 giây</strong> để mở khóa danh hiệu huyền thoại:
        </p>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl py-3 px-6 text-amber-300 font-bold inline-block text-base tracking-wide">
          ✨ Bậc Thầy Nhìn Thấu Nhân Sinh ✨
        </div>
        <div>
          <button
            type="button"
            onClick={startGame}
            className="bg-gradient-to-r from-red-700 to-red-900 hover:from-red-800 hover:to-red-950 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition-transform hover:scale-105"
          >
            Bắt đầu thử thách →
          </button>
        </div>
      </div>
    );
  }

  if (isWon) {
    return (
      <div className="bg-gradient-to-br from-amber-950 via-slate-900 to-slate-900 text-white rounded-2xl p-8 border-2 border-amber-500 shadow-2xl text-center space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.15),transparent)] pointer-events-none" />
        <div className="animate-bounce inline-block text-6xl">🏆</div>
        <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 tracking-wider">
          CHÚC MỪNG CHIẾN THẮNG!
        </h3>
        <p className="text-gray-300 text-sm max-w-md mx-auto leading-relaxed">
          Đồng chí đã xuất sắc phân loại chính xác tất cả các tình huống thực tế và chứng minh năng lực tư duy biện chứng sắc bén của mình!
        </p>
        <div className="bg-slate-950/80 border-2 border-amber-400 rounded-2xl p-6 shadow-inner max-w-md mx-auto">
          <span className="text-xs uppercase tracking-[0.2em] text-amber-500 font-bold block mb-1">Chứng nhận danh hiệu</span>
          <h4 className="text-2xl font-black text-white tracking-wide">BẬC THẦY NHÌN THẤU NHÂN SINH</h4>
          <p className="text-[10px] text-gray-500 mt-2 font-mono">Được cấp bởi Ban giảng huấn học thuật PhiloMind</p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button
            type="button"
            onClick={startGame}
            className="border border-amber-500 text-amber-500 font-bold px-6 py-3 rounded-xl hover:bg-amber-500 hover:text-slate-950 transition-colors"
          >
            Chơi lại
          </button>
          {onDone && (
            <button
              type="button"
              onClick={onDone}
              className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition-transform hover:scale-105"
            >
              Bắt đầu bài học →
            </button>
          )}
        </div>
      </div>
    );
  }

  if (isGameOver) {
    return (
      <div className="bg-slate-950 text-white rounded-2xl p-8 border border-red-600/30 shadow-xl text-center space-y-5">
        <div className="text-red-500 inline-block text-5xl">☠️</div>
        <h3 className="text-2xl font-bold text-red-500">THỬ THÁCH THẤT BẠI!</h3>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          {feedback ? feedback.text : "Đồng chí đã hết thời gian hoặc lựa chọn nhầm thế giới quan cảm tính!"}
        </p>
        <div>
          <button
            type="button"
            onClick={startGame}
            className="bg-red-800 hover:bg-red-900 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined">refresh</span>
            Thử lại lần nữa
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = SITUATIONS[currentIdx];

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 border border-slate-800 shadow-xl space-y-6 text-left relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.05),transparent)] pointer-events-none" />
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-red-500">Tình huống thực tế</span>
          <h4 className="font-extrabold text-lg text-amber-400">Kính Lọc Cuộc Đời</h4>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-red-500 animate-pulse">timer</span>
            <span className="font-mono text-sm font-bold text-red-400">{timeLeft}s</span>
          </div>
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-bold text-slate-400">
            {currentIdx + 1} / {SITUATIONS.length} (Đúng: {score})
          </div>
        </div>
      </div>

      {/* Main card representation */}
      {feedback ? (
        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-green-400">
            <span className="material-symbols-outlined text-2xl">check_circle</span>
            <h5 className="font-bold">Chính xác!</h5>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">{feedback.text}</p>
          <button
            type="button"
            onClick={nextQuestion}
            className="bg-red-800 hover:bg-red-950 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-1"
          >
            Tiếp tục <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="bg-slate-950 p-6 rounded-xl border-l-4 border-red-500 shadow-inner">
            <p className="text-gray-200 text-base font-semibold leading-relaxed">
              {currentQuestion.text}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">Phân loại phát ngôn trên thuộc thế giới quan:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleChoose('myth')}
                className="bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/50 py-3.5 px-4 rounded-xl font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                Huyền thoại
              </button>
              <button
                type="button"
                onClick={() => handleChoose('religion')}
                className="bg-amber-950/40 hover:bg-amber-900/60 text-amber-400 border border-amber-900/50 py-3.5 px-4 rounded-xl font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Tôn giáo
              </button>
              <button
                type="button"
                onClick={() => handleChoose('philosophy')}
                className="bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-900/50 py-3.5 px-4 rounded-xl font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Triết học
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   PAGE chính — Mục lục tổng (mindmap) trước, nội dung bài học sau
   ============================================================ */
const Lesson = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const lessonSlug = searchParams.get("lesson");
  const { showToast } = useToast();

  const { user } = useAuth();
  const [dbJourney, setDbJourney] = useState([]);
  const [currentNodeDetails, setCurrentNodeDetails] = useState(null);
  const [loadingNode, setLoadingNode] = useState(false);

  const lessonContentRef = useRef(null);

  const [isWarmupDone, setIsWarmupDone] = useState(false);

  // Mark warmup completed in database permanently
  const handleWarmupComplete = async () => {
    setIsWarmupDone(true);
    if (user && currentNodeDetails) {
      try {
        await api.courses.updateProgress(currentNodeDetails.id, user.id, 'in_progress', { lessonCompleted: true });
        
        // Reload journey to get latest progress statuses
        const res = await api.courses.list();
        const mainCourse = res.find(c => c.title.includes('Triết học'));
        if (mainCourse) {
          const journey = await api.courses.getJourney(mainCourse.id, user.id);
          setDbJourney(journey);
        }
      } catch (err) {
        console.error("Failed to save warmup progress:", err);
      }
    }
  };

  useEffect(() => {
    setIsWarmupDone(false);
  }, [lessonSlug]);

  // Load courses & journey on mount/user change
  useEffect(() => {
    if (!user) return;
    const fetchJourney = async () => {
      try {
        const res = await api.courses.list();
        const mainCourse = res.find(c => c.title.includes('Triết học'));
        if (mainCourse) {
          const journey = await api.courses.getJourney(mainCourse.id, user.id);
          setDbJourney(journey);
        }
      } catch (err) {
        console.error("Failed to load course journey:", err);
      }
    };
    fetchJourney();
  }, [user]);

  const activeLesson = useMemo(() => {
    if (!lessonSlug || dbJourney.length === 0) return null;
    for (const chap of dbJourney) {
      if (chap.nodes) {
        const found = chap.nodes.find(n => getSlugFromTitle(n.title) === lessonSlug);
        if (found) return found;
      }
    }
    return null;
  }, [lessonSlug, dbJourney]);

  // Load node details when lesson selected
  useEffect(() => {
    if (!user || !lessonSlug || dbJourney.length === 0) return;
    
    let matchedNode = null;
    for (const chap of dbJourney) {
      if (chap.nodes) {
        const node = chap.nodes.find(n => getSlugFromTitle(n.title) === lessonSlug);
        if (node) {
          matchedNode = node;
          break;
        }
      }
    }

    if (matchedNode) {
      setLoadingNode(true);
      api.courses.getNodeDetails(matchedNode.id, user.id)
        .then((res) => {
          setCurrentNodeDetails(res);
          const hasPassed = res.progress && res.progress.length > 0 && (res.progress[0].lessonCompleted || res.progress[0].status === 'completed');
          setIsWarmupDone(!!hasPassed);
          setLoadingNode(false);
        })
        .catch((err) => {
          console.error("Error loading node details:", err);
          setLoadingNode(false);
        });
    } else {
      setCurrentNodeDetails(null);
    }
  }, [lessonSlug, dbJourney, user]);

  // Flattened syllabus list with real DB progress statuses
  const flatSyllabusItems = useMemo(() => {
    if (dbJourney.length === 0 || !activeLesson) {
      return [];
    }
    const currentChapterId = activeLesson.chapterId;
    const hasAnyProgress = dbJourney.some(chap =>
      (chap.nodes || []).some(n => n.progress && n.progress.length > 0 && n.progress[0]?.status)
    );
    let isFirstNode = true;
    const allItems = dbJourney.flatMap(chap => 
      (chap.nodes || []).map(n => {
        let status = 'locked';
        const progressStatus = n.progress && n.progress[0]?.status;
        if (progressStatus === 'completed') {
          status = 'completed';
        } else if (progressStatus === 'available' || progressStatus === 'in_progress') {
          status = 'active';
        } else if (!hasAnyProgress && isFirstNode) {
          status = 'active';
        }
        isFirstNode = false;
        return {
          id: n.id,
          chapterId: chap.id,
          title: n.title,
          status: status
        };
      })
    );
    return allItems.filter(item => item.chapterId === currentChapterId);
  }, [dbJourney, activeLesson]);

  // Real progress statistics
  const progressStats = useMemo(() => {
    const total = flatSyllabusItems.length;
    const completed = flatSyllabusItems.filter(item => item.status === 'completed').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  }, [flatSyllabusItems]);

  // Progress mapping for the Mindmap
  const progressMap = useMemo(() => {
    const map = {};
    const hasAnyProgress = dbJourney.some(chap =>
      (chap.nodes || []).some(n => n.progress && n.progress.length > 0 && n.progress[0]?.status)
    );
    let isFirstNode = true;
    dbJourney.forEach(chap => {
      (chap.nodes || []).forEach(n => {
        let status = (n.progress && n.progress[0]?.status) || 'locked';
        if (!hasAnyProgress && isFirstNode) {
          status = 'available';
        }
        map[n.title] = status;
        isFirstNode = false;
      });
    });
    return map;
  }, [dbJourney]);

  // Transform dbJourney to hierarchical chapters/sections/lessons for Mindmap
  const mindmapChapters = useMemo(() => {
    if (!dbJourney || dbJourney.length === 0) return [];
    
    // Separate main chapters and sub-chapters/sections
    const mainChapters = dbJourney.filter(chap => !chap.parentChapterId);
    const subChapters = dbJourney.filter(chap => chap.parentChapterId);
    
    const colors = [
      "from-red-700 to-red-900",
      "from-amber-700 to-amber-900",
      "from-emerald-700 to-emerald-900",
      "from-blue-700 to-blue-900",
      "from-purple-700 to-purple-900"
    ];

    return mainChapters.map((chap, idx) => {
      const sections = subChapters
        .filter(sub => sub.parentChapterId === chap.id)
        .map(sub => ({
          id: sub.id,
          title: sub.title,
          lessons: (sub.nodes || []).map(node => ({
            id: node.id,
            title: node.title,
            slug: getSlugFromTitle(node.title),
          }))
        }));
      
      if (sections.length === 0 && chap.nodes && chap.nodes.length > 0) {
        sections.push({
          id: `${chap.id}-default`,
          title: "Bài học chi tiết",
          lessons: chap.nodes.map(node => ({
            id: node.id,
            title: node.title,
            slug: getSlugFromTitle(node.title),
          }))
        });
      }

      return {
        id: chap.id,
        title: `Chương ${idx + 1}`,
        subtitle: chap.title,
        color: colors[idx % colors.length],
        sections
      };
    });
  }, [dbJourney]);

  // Bấm 1 bài học trên sơ đồ -> cập nhật URL và cuộn tới nội dung
  const handleOpenLesson = (slug) => {
    if (!slug) return;
    
    // Check if locked
    const title = getTitleFromSlug(slug);
    const status = progressMap[title] || 'locked';
    
    if (status === 'locked') {
      showToast("Bài học này đang khóa. Đồng chí vui lòng hoàn thành bài học trước để tiếp tục!", "warning");
      return;
    }

    setSearchParams({ lesson: slug });
  };

  const handleSyllabusClick = (item) => {
    if (item.status === 'locked') {
      showToast("Bài học này đang bị khóa!", "warning");
      return;
    }
    const slug = getSlugFromTitle(item.title);
    handleOpenLesson(slug);
  };

  const handleBackToMindmap = () => setSearchParams({});

  // Complete lesson & unlock next lesson in real-time
  const handleFinalQuizComplete = async (score, total) => {
    if (!user || !currentNodeDetails) return;
    const passed = score >= QUIZ_PASS_THRESHOLD;
    if (!passed) return;

    try {
      // 1. Mark current node as completed
      await api.courses.updateProgress(currentNodeDetails.id, user.id, 'completed', { lessonCompleted: true, quizCompleted: true });

      // 2. Find next node to unlock in DB
      let nextNode = null;
      let foundCurrent = false;
      for (const chap of dbJourney) {
        for (const n of chap.nodes) {
          if (foundCurrent) {
            nextNode = n;
            break;
          }
          if (n.id === currentNodeDetails.id) {
            foundCurrent = true;
          }
        }
        if (nextNode) break;
      }

      if (nextNode) {
        // Unlock next node
        await api.courses.updateProgress(nextNode.id, user.id, 'available');
        showToast(`Chúc mừng! Bạn đã hoàn thành bài học và mở khóa bài tiếp theo: "${nextNode.title}"`, "success");
      } else {
        showToast("Xuất sắc! Bạn đã hoàn thành tất cả các bài học trong khóa học này!", "success");
      }

      // 3. Reload journey
      const res = await api.courses.list();
      const mainCourse = res.find(c => c.title.includes('Triết học'));
      if (mainCourse) {
        const journey = await api.courses.getJourney(mainCourse.id, user.id);
        setDbJourney(journey);
      }
    } catch (err) {
      console.error("Error updating progress:", err);
    }
  };

  return (
    <PageShell activeKey="lessons">
      <div className="px-6 md:px-12 py-8 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
          <span>Trang chủ</span>
          <span>›</span>
          <strong className={activeLesson ? "" : "text-red-800"}>
            Bài học
          </strong>
          {activeLesson && (
            <>
              <span>›</span>
              <strong className="text-red-800">{activeLesson.title}</strong>
            </>
          )}
        </div>

        {/* MỤC LỤC TỔNG */}
        {!activeLesson && (
          <div className="mb-10">
            <LessonMindmap
              chapters={mindmapChapters}
              activeSlug={lessonSlug}
              onOpenLesson={handleOpenLesson}
              progressMap={progressMap}
            />
          </div>
        )}

        {/* ===== NỘI DUNG BÀI HỌC ===== */}
        <div ref={lessonContentRef} className="scroll-mt-20">
          {activeLesson ? (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleBackToMindmap}
                className="inline-flex items-center gap-1 text-sm font-semibold text-red-800 hover:text-red-900 mb-5"
              >
                <span className="material-symbols-outlined text-base">
                  arrow_back
                </span>
                Quay lại sơ đồ bài học
              </button>
              <header className="mb-8">
                <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-full text-xs font-bold mb-3">
                  <span className="material-symbols-outlined text-base">
                    bookmark
                  </span>
                  Đang học: {activeLesson.title}
                </div>
                <h1 className="font-bold text-3xl md:text-4xl text-red-900 mb-3">
                  {activeLesson.title}
                </h1>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold uppercase">
                    Triết học
                  </span>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      schedule
                    </span>
                    {currentNodeDetails?.timeToRead || "10 phút"}
                  </span>
                  <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold uppercase">
                    Độ khó: {currentNodeDetails?.difficulty || "Medium"}
                  </span>
                </div>
              </header>

              {loadingNode ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200 shadow-md">
                  <span className="material-symbols-outlined animate-spin text-5xl text-red-800">sync</span>
                  <p className="text-gray-500 mt-4 font-semibold">Đang tải học liệu học thuật thực tế...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    {/* Warm-up chỉ hiển thị khi chưa hoàn thành và có dữ liệu thực tế */}
                    {currentNodeDetails?.warmups && currentNodeDetails.warmups.length > 0 && !isWarmupDone ? (
                      <WarmupSection dbWarmups={currentNodeDetails.warmups} onDone={handleWarmupComplete} />
                    ) : (
                      <>
                        <VideoWithReminder dbVideoUrl={currentNodeDetails?.videoUrl} />

                        {/* Lesson body & Summary */}
                        <div className="space-y-6">
                          {/* Textbook reading card */}
                          <article className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 space-y-6">
                            <div className="flex items-center gap-2 mb-2 border-b border-gray-100 pb-3">
                              <span className="material-symbols-outlined text-red-800">menu_book</span>
                              <span className="text-xs uppercase tracking-wider text-red-800 font-bold">Giáo trình chính thức</span>
                            </div>
                            <div className="prose max-w-none text-gray-800">
                              {parseMarkdownToReact(currentNodeDetails?.originalText || "")}
                            </div>

                            <div className="bg-blue-50 rounded-xl p-6 text-center mt-8">
                              <h4 className="font-bold text-gray-900 mb-3">Sơ đồ tư duy minh họa</h4>
                              <img
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2T0oKzFgSs41_uPl7DH2lLOTYb3SxDZB_kd8GpeTjioOwrYtiKCHxMgA988xiG38bbJ6kHsbcaZ6NB5fwVhU-hX_fuk1yMDbzNQlf7hVZ55UPqUd7F8NC9JKADq4NeFoNN0S_dhU3TjhBNdbUIQGm28SveS2d-P7aiKpHJiufcGzd1wxH_9SoofRYAN_LDJsikyZtKm4WUEIn_R8NblvXegmi4LrZflrHd4Uz2wH7Y9W_TOWXBmiRAPWefJZFVQFDn-sJDNu7M6s"
                                alt="So do tu duy bai hoc"
                                className="w-full rounded-lg shadow-sm"
                              />
                            </div>
                          </article>

                          {/* Summary & Quick Take Card */}
                          <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-2xl shadow-md border border-amber-200 p-8 space-y-5">
                            <div className="flex items-center gap-2 mb-1 border-b border-amber-200/60 pb-3">
                              <span className="material-symbols-outlined text-amber-700">summarize</span>
                              <h3 className="text-xl font-bold text-red-950">Tóm tắt bài học (Summary & Quick Take)</h3>
                            </div>
                            
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-sm uppercase tracking-wider text-amber-800 font-bold mb-1">Nội dung cốt lõi:</h4>
                                <p className="text-gray-700 leading-relaxed text-sm md:text-base text-justify">
                                  {currentNodeDetails?.summary || "Đang tải dữ liệu tóm tắt..."}
                                </p>
                              </div>

                              <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm mt-2">
                                <strong className="text-red-900 block mb-1 text-sm md:text-base flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-amber-600 text-lg">lightbulb</span>
                                  💡 Quick Take / Ý chính rút ra:
                                </strong>
                                <p className="text-gray-750 text-sm md:text-base leading-relaxed italic">
                                  {currentNodeDetails?.quickTake || "Đang tải ý chính rút ra..."}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    <PodcastPlayer dbPodcast={currentNodeDetails?.podcast} />

                    <FinalQuiz dbFlashcards={currentNodeDetails?.flashcards} onComplete={handleFinalQuizComplete} />

                    {/* Diễn đàn Thảo luận nằm liền dưới Nội dung khóa học (sau Bài kiểm tra) */}
                    {currentNodeDetails?.id && <LessonDiscussion nodeId={currentNodeDetails.id} />}

                    {/* Bottom navigation */}
                    <div className="flex justify-between gap-3 mt-8">
                      <button
                        type="button"
                        onClick={handleBackToMindmap}
                        className="border-2 border-red-800 text-red-800 px-5 py-3 rounded-lg font-bold hover:bg-red-800 hover:text-white transition-colors"
                      >
                        ← Sơ đồ tư duy
                      </button>
                      <Link
                        to="/debate"
                        className="bg-red-800 text-white px-5 py-3 rounded-lg font-bold hover:bg-red-900 transition-colors flex items-center gap-1"
                      >
                        Phản biện AI Socratic →
                      </Link>
                    </div>
                  </div>

                  {/* Sidebar syllabus */}
                  <aside className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden sticky top-20">
                      <div className="bg-red-800 text-white p-5">
                        <h3 className="font-bold text-lg mb-3">Nội dung khóa học</h3>
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-white rounded-full transition-all duration-300"
                            style={{ width: `${progressStats.percentage}%` }}
                          />
                        </div>
                        <p className="text-sm text-white/80 mt-2">
                          Đã hoàn thành {progressStats.completed}/{progressStats.total} bài học ({progressStats.percentage}%)
                        </p>
                      </div>

                      <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
                        {flatSyllabusItems.map((item, index) => {
                          const config = SYLLABUS_STATUS_CONFIG[item.status];
                          const isActiveLesson = getSlugFromTitle(item.title) === lessonSlug;
                          return (
                            <button
                              key={index}
                              onClick={() => handleSyllabusClick(item)}
                              type="button"
                              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left text-sm ${config.className} ${
                                isActiveLesson ? "ring-2 ring-red-800 ring-offset-1 font-bold" : ""
                              }`}
                            >
                              <span className="material-symbols-outlined text-base">
                                {config.icon}
                              </span>
                              <span className="flex-1 truncate">{item.title}</span>
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        className="w-full bg-gray-700 text-white py-3 font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-base">
                          download
                        </span>
                        Tài liệu đi kèm (PDF)
                      </button>
                    </div>
                  </aside>
                </div>
              )}
            </div>
          ) : (
            <div className="border-t border-gray-200 pt-12 pb-16 text-center">
              <span className="material-symbols-outlined text-6xl text-red-800/30">
                touch_app
              </span>
              <h2 className="text-xl font-bold text-gray-800 mt-3">
                Chọn một bài học để bắt đầu
              </h2>
              <p className="text-gray-500 mt-1 max-w-md mx-auto">
                Bấm vào một đề mục hoặc bài học trên sơ đồ tư duy phía trên để mở
                nội dung bài học thực tế từ cơ sở dữ liệu.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
};

export default Lesson;
