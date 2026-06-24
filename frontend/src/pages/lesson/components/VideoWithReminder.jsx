import React, { useState, useMemo } from "react";

function getYouTubeId(url) {
  if (!url) return "Mzg-AdRrjGY"; 
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : "Mzg-AdRrjGY";
}

export function VideoWithReminder({ dbVideoUrl, isRevisit, onWatched }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasWatched, setHasWatched] = useState(isRevisit || false);
  
  const videoId = useMemo(() => getYouTubeId(dbVideoUrl), [dbVideoUrl]);

  const handleWatchedClick = () => {
    setHasWatched(true);
    if (onWatched) {
      onWatched();
    }
  };

  return (
    <div className="text-left">
      <div className="relative rounded-3xl overflow-hidden shadow-md">
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
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-20 rounded-full bg-primary-600/90 hover:bg-primary-700 text-white flex items-center justify-center transition-transform hover:scale-110"
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
      {isPlaying && !hasWatched && !isRevisit && (
        <button
          onClick={handleWatchedClick}
          className="mt-3 bg-primary-600 text-white px-4 py-2 rounded-3xl font-semibold hover:bg-primary-700 text-sm flex items-center gap-1"
        >
          <span className="material-symbols-outlined align-middle text-base">
            check
          </span>
          Tôi đã xem xong video
        </button>
      )}
      {(hasWatched || isRevisit) && (
        <div className="mt-3 bg-green-50 border border-green-200 rounded-3xl p-4 text-green-800 flex items-center gap-2">
          <span className="material-symbols-outlined">check_circle</span>
          <span className="font-semibold text-sm">Tuyệt vời! Đồng chí đã hoàn thành việc xem video bài học bổ trợ này.</span>
        </div>
      )}
    </div>
  );
}
