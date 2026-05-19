import React, { useState, useRef, useEffect } from 'react';

interface TranscriptSegment {
  time: number;
  speaker: string;
  text: string;
}

interface AudioTranscriptPlayerProps {
  audioUrl: string;
  transcript: TranscriptSegment[];
}

export default function AudioTranscriptPlayer({ audioUrl, transcript }: AudioTranscriptPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const transcriptContainerRef = useRef<HTMLDivElement | null>(null);

  // Initialize and sync audio ref
  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    setCurrentTime(cur);
    setProgress((cur / (audioRef.current.duration || 1)) * 100);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration || 0);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const clickPercent = clickX / width;
    
    audioRef.current.currentTime = clickPercent * duration;
    setProgress(clickPercent * 100);
  };

  // Jump audio directly to a transcript segment time index on click
  const handleSegmentClick = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
    setProgress((time / (duration || 1)) * 100);
    if (!isPlaying) {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Determine which sentence is active
  const activeSegmentIndex = (() => {
    let index = 0;
    for (let i = 0; i < transcript.length; i++) {
      if (currentTime >= transcript[i].time) {
        index = i;
      }
    }
    return index;
  })();

  // Autoscroll transcript container to keep active sentence visible
  useEffect(() => {
    const activeEl = document.getElementById(`segment-${activeSegmentIndex}`);
    if (activeEl && transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTo({
        top: activeEl.offsetTop - 80,
        behavior: 'smooth',
      });
    }
  }, [activeSegmentIndex]);

  // Render customizable audio soundwave lines
  const waveHeights = [12, 24, 16, 28, 20, 10, 26, 15, 32, 22, 18, 30, 25, 14, 20, 8, 22, 12, 16, 10];

  return (
    <div className="glass-card rounded-2xl p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute -top-10 -left-10 w-48 h-48 bg-purple-500/5 rounded-full blur-2xl pointer-events-none"></div>

      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Play control ring */}
        <div className="flex items-center gap-5">
          <button
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-secondary-container hover:bg-secondary text-white flex items-center justify-center transition-all hover:scale-[1.05] shadow-lg shadow-purple-500/20 shrink-0"
          >
            <span className="material-symbols-outlined text-3xl">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>
          
          <div>
            <span className="text-[10px] font-extrabold text-secondary uppercase tracking-widest block mb-1">AI Podcast Reading</span>
            <h4 className="font-bold text-base text-primary dark:text-white line-clamp-1">Philosophy Dialectic Conversation</h4>
          </div>
        </div>

        {/* Customized wave animation */}
        <div className="flex items-center gap-1 h-10 select-none">
          {waveHeights.map((h, i) => (
            <div
              key={i}
              className={`w-1 rounded-full wave-bar transition-all duration-300 ${
                isPlaying ? 'bg-purple-500 wave-active' : 'bg-surface-container dark:bg-slate-700'
              }`}
              style={{
                height: `${h}px`,
                animationDelay: isPlaying ? `${i * 0.05}s` : '0s',
                animationDuration: isPlaying ? `${0.6 + (i % 4) * 0.2}s` : '0s',
              }}
            />
          ))}
        </div>
      </div>

      {/* Progress track */}
      <div className="w-full flex items-center gap-3">
        <span className="text-[10px] font-bold text-on-surface-variant dark:text-outline-variant font-mono">
          {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60) + '').padStart(2, '0')}
        </span>
        
        <div
          onClick={handleSeek}
          className="flex-1 h-1.5 bg-surface-container dark:bg-slate-700 rounded-full cursor-pointer overflow-hidden relative"
        >
          <div
            className="h-full bg-purple-500 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="text-[10px] font-bold text-on-surface-variant dark:text-outline-variant font-mono">
          {Math.floor(duration / 60)}:{(Math.floor(duration % 60) + '').padStart(2, '0')}
        </span>
      </div>

      {/* Synced scrollable text transcripts panel */}
      <div className="border-t border-glass-stroke pt-5">
        <span className="text-xs font-bold text-on-surface-variant dark:text-outline-variant uppercase tracking-widest block mb-3">Live Transcript (Click line to skip)</span>
        
        <div
          ref={transcriptContainerRef}
          className="h-44 overflow-y-auto pr-3 flex flex-col gap-3.5 scroll-smooth"
        >
          {transcript.map((seg, idx) => {
            const isActive = idx === activeSegmentIndex;
            return (
              <div
                key={idx}
                id={`segment-${idx}`}
                onClick={() => handleSegmentClick(seg.time)}
                className={`py-2 px-3 rounded-xl cursor-pointer border-l-2 transition-all duration-300 ${
                  isActive
                    ? 'bg-purple-500/10 border-purple-500 scale-[1.01] font-semibold pl-4'
                    : 'border-transparent hover:bg-surface-container/40 pl-3 opacity-60 hover:opacity-100'
                }`}
              >
                <span className="font-extrabold uppercase tracking-wider text-[9px] text-purple-500 mr-2">
                  {seg.speaker}:
                </span>
                <span className="text-xs text-on-surface dark:text-slate-200 leading-relaxed">
                  {seg.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
