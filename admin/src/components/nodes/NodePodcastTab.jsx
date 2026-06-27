import React from 'react';

export default function NodePodcastTab({
  nodePodcast,
  podcastScript,
  setPodcastScript,
  podcastAudioUrl,
  setPodcastAudioUrl,
  podcastTranscript,
  setPodcastTranscript,
  synthesizingPodcast,
  handlePodcastDelete,
  handlePodcastSynthesize,
  handlePodcastSubmit,
}) {
  return (
    <div className="space-y-6">
      <h4 className="text-base font-semibold text-purple-400 flex items-center gap-2">
        <span className="material-symbols-outlined">mic</span> Tích hợp Audio Podcast
      </h4>

      {nodePodcast ? (
        <div className="bg-slate-900/40 p-4 border border-slate-800 rounded-xl space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-green-400 font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              Đã phát hành Podcast cho bài học này
            </span>
            <button
              type="button"
              onClick={handlePodcastDelete}
              className="bg-red-950 hover:bg-red-900 text-red-400 px-2.5 py-1 rounded text-2xs font-semibold border border-red-900/40 flex items-center gap-0.5"
            >
              <span className="material-symbols-outlined text-xs">delete</span> Xóa Podcast
            </button>
          </div>
          <audio src={nodePodcast.audioUrl} controls className="w-full h-9 accent-purple-600" />
        </div>
      ) : (
        <div className="bg-purple-950/10 p-4 border border-purple-900/30 rounded-xl text-center text-xs text-slate-400 space-y-2">
          <span className="material-symbols-outlined text-3xl text-purple-500">volume_up</span>
          <p>Bài học này hiện chưa được cấu hình Podcast audio. Nhập kịch bản để tạo giọng nói AI ở dưới.</p>
        </div>
      )}

      {/* Podcast Create/Edit Form */}
      <form onSubmit={handlePodcastSubmit} className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-4 text-xs">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-purple-400 uppercase block mb-1">Kịch bản đàm thoại để Sinh TTS (Tiếng Việt)</label>
          <textarea
            rows="3"
            placeholder="Nhập kịch bản thoại để tự động sinh file âm thanh bài học..."
            value={podcastScript}
            onChange={(e) => setPodcastScript(e.target.value)}
            className="w-full bg-slate-955 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 resize-none focus:outline-none"
          />
          <button
            type="button"
            disabled={synthesizingPodcast}
            onClick={handlePodcastSynthesize}
            className="w-full bg-purple-800 hover:bg-purple-900 disabled:bg-slate-850 text-white font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1 mt-1 shadow-md"
          >
            {synthesizingPodcast ? "Đang sinh audio..." : "Chạy giọng nói TTS AI & Preview"}
          </button>
        </div>

        {podcastAudioUrl && (
          <div className="space-y-2 bg-purple-950/20 border border-purple-900/30 p-3 rounded-lg">
            <p className="text-[10px] font-bold uppercase text-purple-400">Nghe thử bản Preview:</p>
            <audio src={podcastAudioUrl} controls className="w-full h-8" />
          </div>
        )}

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Đường dẫn tệp âm thanh (Audio URL)</label>
            <input
              type="text"
              required
              placeholder="Điền tự động từ TTS hoặc nhập URL thủ công..."
              value={podcastAudioUrl}
              onChange={(e) => setPodcastAudioUrl(e.target.value)}
              className="w-full bg-slate-955 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Phân cảnh đàm thoại JSON (Transcript)</label>
            <textarea
              rows="4"
              required
              value={podcastTranscript}
              onChange={(e) => setPodcastTranscript(e.target.value)}
              className="w-full bg-slate-955 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono resize-none focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!podcastAudioUrl}
          className="w-full bg-purple-800 hover:bg-purple-900 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg text-xs transition-all shadow"
        >
          {!nodePodcast ? "Tạo và Phát hành Podcast" : "Cập nhật Podcast"}
        </button>
      </form>
    </div>
  );
}
