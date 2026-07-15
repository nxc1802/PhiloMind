import React, { useState, useMemo } from "react";

function getYouTubeId(url) {
  if (!url) return "Mzg-AdRrjGY"; 
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : "Mzg-AdRrjGY";
}

function getOptionClassName({ submitted, picked, isCorrect, base, sizing }) {
  let cls = `${base} ${sizing} transition-all `;
  if (!submitted) {
    cls += picked
      ? "border-primary-800 bg-primary-50 dark:bg-primary-900/35"
      : "border-gray-200 hover:border-red-300";
  } else if (isCorrect) {
    cls += "border-green-500 bg-green-50 text-green-900";
  } else if (picked) {
    cls += "border-red-400 bg-primary-50 dark:bg-primary-900/35 text-primary-850 dark:text-primary-100";
  } else {
    cls += "border-gray-200 opacity-60";
  }
  return cls;
}

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

function WorldviewFilterGame({ data, onDone }) {
  const situations = useMemo(() => {
    if (data?.options && Array.isArray(data.options) && data.options.length > 0) {
      return data.options;
    }
    return SITUATIONS;
  }, [data]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isWon, setIsWon] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [feedback, setFeedback] = useState(null);

  React.useEffect(() => {
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
    const currentQuestion = situations[currentIdx];
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
    if (currentIdx < situations.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setIsWon(true);
    }
  };

  if (!isPlaying) {
    return (
      <div className="bg-slate-900 text-white rounded-3xl p-8 border border-red-500/20 shadow-xl text-center space-y-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.1),transparent)] pointer-events-none" />
        <div className="inline-flex items-center justify-center h-16 w-16 bg-primary-600/20 rounded-3xl text-primary-500 border border-primary-800/30 mb-2">
          <span className="material-symbols-outlined text-4xl">travel_explore</span>
        </div>
        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-450 to-primary-200">
          TRÒ CHƠI: KÍNH LỌC CUỘC ĐỜI (The Worldview Filter)
        </h3>
        <p className="text-gray-300 text-sm max-w-xl mx-auto leading-relaxed">
          Đồng chí hãy nhập vai thành một nhà biện chứng thực tế! Nhiệm vụ của đồng chí là phân loại đúng <strong>5 tình huống/phát ngôn thực tế</strong> vào 3 nhóm thế giới quan khác nhau trong vòng <strong>60 giây</strong> để mở khóa danh hiệu huyền thoại:
        </p>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl py-3 px-6 text-amber-300 font-bold inline-block text-base tracking-wide">
          ✨ Bậc Thầy Nhìn Thấu Nhân Sinh ✨
        </div>
        <div>
          <button
            type="button"
            onClick={startGame}
            className="bg-gradient-to-r from-primary-700 to-primary-900 hover:from-red-800 hover:to-red-950 text-white font-bold px-8 py-3.5 rounded-3xl shadow-lg transition-transform hover:scale-105"
          >
            Bắt đầu thử thách →
          </button>
        </div>
      </div>
    );
  }

  if (isWon) {
    return (
      <div className="bg-gradient-to-br from-amber-950 via-slate-900 to-slate-900 text-white rounded-3xl p-8 border-2 border-amber-500 shadow-2xl text-center space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.15),transparent)] pointer-events-none" />
        <div className="animate-bounce inline-block text-6xl">🏆</div>
        <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 tracking-wider">
          CHÚC MỪNG CHIẾN THẮNG!
        </h3>
        <p className="text-gray-300 text-sm max-w-md mx-auto leading-relaxed">
          Đồng chí đã xuất sắc phân loại chính xác tất cả các tình huống thực tế và chứng minh năng lực tư duy biện chứng sắc bén của mình!
        </p>
        <div className="bg-slate-950/80 border-2 border-amber-400 rounded-3xl p-6 shadow-inner max-w-md mx-auto">
          <span className="text-xs uppercase tracking-[0.2em] text-amber-500 font-bold block mb-1">Chứng nhận danh hiệu</span>
          <h4 className="text-2xl font-black text-white tracking-wide">BẬC THẦY NHÌN THẤU NHÂN SINH</h4>
          <p className="text-[10px] text-gray-450 mt-2 font-mono">Được cấp bởi Ban giảng huấn học thuật PhiloMind</p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button
            type="button"
            onClick={startGame}
            className="border border-amber-500 text-amber-500 font-bold px-6 py-3 rounded-3xl hover:bg-amber-500 hover:text-slate-950 transition-colors"
          >
            Chơi lại
          </button>
          {onDone && (
            <button
              type="button"
              onClick={onDone}
              className="bg-gradient-to-r from-primary-600 to-primary-800 hover:from-red-700 hover:to-red-900 text-white font-bold px-8 py-3 rounded-3xl shadow-lg transition-transform hover:scale-105"
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
      <div className="bg-slate-950 text-white rounded-3xl p-8 border border-red-600/30 shadow-xl text-center space-y-5">
        <div className="text-primary-500 inline-block text-5xl">☠️</div>
        <h3 className="text-2xl font-bold text-primary-500">THỬ THÁCH THẤT BẠI!</h3>
        <p className="text-gray-350 text-sm max-w-md mx-auto">
          {feedback ? feedback.text : "Đồng chí đã hết thời gian hoặc lựa chọn nhầm thế giới quan cảm tính!"}
        </p>
        <div>
          <button
            type="button"
            onClick={startGame}
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-3 rounded-3xl shadow-md transition-all inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined">refresh</span>
            Thử lại lần nữa
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = situations[currentIdx];

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 border border-slate-800 shadow-xl space-y-6 text-left relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.05),transparent)] pointer-events-none" />
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-primary-500">Tình huống thực tế</span>
          <h4 className="font-extrabold text-lg text-amber-400">Kính Lọc Cuộc Đời</h4>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-950 px-3 py-1.5 rounded-3xl border border-slate-800 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-primary-500 animate-pulse">timer</span>
            <span className="font-mono text-sm font-bold text-red-400">{timeLeft}s</span>
          </div>
          <div className="bg-slate-950 px-3 py-1.5 rounded-3xl border border-slate-800 text-xs font-bold text-slate-350">
            {currentIdx + 1} / {situations.length} (Đúng: {score})
          </div>
        </div>
      </div>

      {/* Main card representation */}
      {feedback ? (
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-green-400">
            <span className="material-symbols-outlined text-2xl">check_circle</span>
            <h5 className="font-bold">Chính xác!</h5>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">{feedback.text}</p>
          <button
            type="button"
            onClick={nextQuestion}
            className="bg-primary-600 hover:bg-primary-900 text-white px-5 py-2.5 rounded-3xl text-sm font-bold transition-all flex items-center gap-1"
          >
            Tiếp tục <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="bg-slate-950 p-6 rounded-3xl border-l-4 border-red-500 shadow-inner">
            <p className="text-gray-200 text-base font-semibold leading-relaxed">
              {currentQuestion.text}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-gray-450 font-bold">Phân loại phát ngôn trên thuộc thế giới quan:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleChoose('myth')}
                className="bg-primary-900/40 hover:bg-primary-700/60 text-red-400 border border-red-900/50 py-3.5 px-4 rounded-3xl font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-primary-400 animate-ping" />
                Huyền thoại
              </button>
              <button
                type="button"
                onClick={() => handleChoose('religion')}
                className="bg-amber-950/40 hover:bg-amber-900/60 text-amber-400 border border-amber-900/50 py-3.5 px-4 rounded-3xl font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Tôn giáo
              </button>
              <button
                type="button"
                onClick={() => handleChoose('philosophy')}
                className="bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-900/50 py-3.5 px-4 rounded-3xl font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
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

function WarmupImageGuess({ data, onDone }) {
  const [input, setInput] = useState("");
  const [revealed, setRevealed] = useState(false);
  const isCorrect =
    revealed || input.trim().toLowerCase() === data.answer.toLowerCase();

  return (
    <div className="grid md:grid-cols-2 gap-6 text-left">
      <img
        src={data.image}
        alt="warmup"
        className="w-full h-64 object-cover rounded-3xl shadow-md border border-gray-150"
      />
      <div>
        <p className="text-sm text-gray-650 mb-2 font-medium">{data.hint}</p>
        <div className="font-mono text-3xl tracking-[0.4em] text-primary-650 dark:text-primary-300 mb-4 bg-primary-50 dark:bg-primary-900/35/70 px-4 py-3 rounded-3xl border border-primary-100 dark:border-primary-850/50 inline-block font-semibold">
          {data.blanks}
        </div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Gõ đáp án của bạn..."
          disabled={isCorrect}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-3xl focus:border-primary-800 outline-none mb-3 text-gray-800"
        />
        {isCorrect ? (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-3xl text-sm leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold mb-1.5">
              <span className="material-symbols-outlined text-green-600">
                check_circle
              </span>
              <span>Chính xác!</span>
            </div>
            {data.reveal}
            <button
              onClick={onDone}
              className="block mt-4 bg-primary-600 text-white px-5 py-2.5 rounded-3xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-md"
            >
              Bắt đầu bài học →
            </button>
          </div>
        ) : (
          <button
            onClick={() => setRevealed(true)}
            className="text-sm text-gray-500 hover:text-primary-650 dark:text-primary-300 underline transition-colors"
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
    <div className="text-left">
      <blockquote className="border-l-4 border-primary-800 bg-primary-50 dark:bg-primary-900/35/40 pl-5 pr-3 py-4 italic text-gray-800 mb-5 rounded-r-lg font-serif">
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
              base: "block w-full text-left rounded-3xl border-2 text-gray-700 dark:text-primary-100 bg-white dark:bg-surface-dark-elevated hover:bg-gray-50/50 dark:hover:bg-primary-900/10 border-gray-200 dark:border-primary-850/50 transition-colors",
              sizing: "px-4 py-3",
            })}
          >
            {option}
          </button>
        ))}
      </div>
      {submitted && (
        <div
          className={`p-4 rounded-3xl text-sm leading-relaxed border ${
            isCorrect
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-primary-50 dark:bg-primary-900/35 border-primary-200 dark:border-primary-800 text-primary-650 dark:text-primary-300"
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold mb-1.5">
            <span className="material-symbols-outlined text-base">
              {isCorrect ? "check_circle" : "cancel"}
            </span>
            <span>{isCorrect ? "Đáp án chính xác!" : "Chưa chính xác!"}</span>
          </div>
          {data.reveal}
          <button
            onClick={onDone}
            className="block mt-4 bg-primary-600 text-white px-5 py-2.5 rounded-3xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-md"
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
    <div className="text-left">
      <div className="relative rounded-3xl overflow-hidden shadow-md mb-5 aspect-video max-w-lg mx-auto">
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
              base: "block w-full text-left rounded-3xl border-2 text-gray-700 dark:text-primary-100 bg-white dark:bg-surface-dark-elevated hover:bg-gray-50/50 dark:hover:bg-primary-900/10 border-gray-200 dark:border-primary-850/50 transition-colors",
              sizing: "px-4 py-3",
            })}
          >
            {option}
          </button>
        ))}
      </div>
      {submitted && (
        <div
          className={`p-4 rounded-3xl text-sm leading-relaxed border ${
            isCorrect
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-amber-50 border-amber-200 text-amber-800"
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold mb-1.5">
            <span className="material-symbols-outlined text-base">
              {isCorrect ? "check_circle" : "lightbulb"}
            </span>
            <span>{isCorrect ? "Chính xác!" : "Kiến giải khoa học:"}</span>
          </div>
          {data.reveal}
          <button
            onClick={onDone}
            className="block mt-4 bg-primary-600 text-white px-5 py-2.5 rounded-3xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-md"
          >
            Bắt đầu bài học →
          </button>
        </div>
      )}
    </div>
  );
}

export function WarmupSection({ dbWarmups, onDone }) {
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
    <div className="bg-white dark:bg-[#002b37] rounded-3xl shadow-md border border-amber-200 p-7 mb-8 relative overflow-hidden">
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-100/50 rounded-full opacity-50" />
      <div className="relative text-left">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-amber-700">
            local_fire_department
          </span>
          <span className="text-xs uppercase tracking-wider text-amber-700 font-bold">
            Làm nóng / Đặt vấn đề
          </span>
        </div>
        <h2 className="text-2xl font-bold text-primary-850 dark:text-primary-100 mb-5">{normalizedWarmup.title}</h2>
        {normalizedWarmup.type === "image-guess" ? (
          <WarmupImageGuess data={normalizedWarmup} onDone={onDone} />
        ) : normalizedWarmup.type === "video" ? (
          <WarmupVideo data={normalizedWarmup} onDone={onDone} />
        ) : normalizedWarmup.type === "game" ? (
          <WorldviewFilterGame data={normalizedWarmup} onDone={onDone} />
        ) : (
          <WarmupStory data={normalizedWarmup} onDone={onDone} />
        )}
      </div>
    </div>
  );
}
