import React, { useMemo, useState, useRef, useEffect } from "react";
import { PODCAST_SKIP_SECONDS } from "../../../constants";

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

export function PodcastPlayer({ dbPodcast }) {
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
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center text-gray-500 mt-8">
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
    <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900 rounded-2xl shadow-xl p-7 mt-8 text-white relative overflow-hidden text-left">
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
