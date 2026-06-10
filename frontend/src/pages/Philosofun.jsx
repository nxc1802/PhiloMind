import React, { useState } from 'react';
import PageShell from '../components/PageShell';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { queryKeys } from '../services/queryKeys';

export default function Philosofun() {
  const [search, setSearch] = useState('');
  const [activeVideo, setActiveVideo] = useState(null); // popup video detail

  const { data: videosData, isLoading: loading } = useQuery({
    queryKey: queryKeys.philosofun.list(),
    queryFn: () => api.philosofun.list(),
    staleTime: 1000 * 60 * 10, // Videos change rarely
  });
  const videos = videosData || [];


  const getYoutubeId = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  };

  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(search.toLowerCase()) ||
    (v.description && v.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <PageShell activeKey="philosofun">
      {/* Hero Section */}
      <section className="bg-red-800 py-12 px-12 text-white text-left relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-3xl">smart_display</span>
            <span className="text-sm uppercase tracking-wider opacity-80">Góc Giải Trí Triết Học</span>
          </div>
          <h1 className="font-bold text-4xl md:text-5xl mb-4">PhilosoFUN</h1>
          <p className="text-white/80 max-w-2xl mb-6">
            Thư viện video tình huống triết học trực quan, sinh động giúp khơi dậy hứng thú học tập và tư duy phản biện xã hội sâu sắc.
          </p>
          
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Tìm video tình huống..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/10 border border-white/30 text-white placeholder:text-white/50 rounded-full pl-11 pr-4 py-2.5 focus:ring-2 focus:ring-white focus:border-transparent outline-none backdrop-blur-sm"
            />
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/70">
              search
            </span>
          </div>
        </div>
      </section>

      <div className="px-6 md:px-12 py-10 max-w-6xl mx-auto">
        {loading ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <span className="material-symbols-outlined animate-spin text-5xl text-red-800">sync</span>
            <p className="text-gray-500 mt-4 font-semibold">Đang chuẩn bị rạp chiếu phim triết học...</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-dashed border-gray-300">
            <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">video_library</span>
            <h3 className="font-bold text-gray-850 text-lg">Hộp phim trống</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mt-1">
              {search ? 'Không tìm thấy video nào khớp với bộ lọc tìm kiếm của đồng chí.' : 'Ban giảng huấn đang biên tập các video tình huống kịch tính thú vị. Hãy quay lại sau.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {filteredVideos.map((video) => {
              const ytId = getYoutubeId(video.videoUrl);
              return (
                <div
                  key={video.id}
                  onClick={() => setActiveVideo(video)}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
                >
                  <div className="aspect-video bg-gray-100 relative overflow-hidden group">
                    {ytId ? (
                      <img
                        src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200">
                        <span className="material-symbols-outlined text-4xl">play_circle</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="h-14 w-14 rounded-full bg-red-800 text-white flex items-center justify-center shadow-lg">
                        <span className="material-symbols-outlined text-2xl font-bold">play_arrow</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2" title={video.title}>
                        {video.title}
                      </h3>
                      <p className="text-gray-650 text-xs mt-2 line-clamp-3">
                        {video.description || 'Không có mô tả chi tiết.'}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-2xs text-gray-450 font-semibold">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">calendar_month</span>
                        {new Date(video.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                      <span className="text-red-800 flex items-center gap-0.5">
                        Xem ngay <span className="material-symbols-outlined text-xs font-bold">arrow_forward</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* POPUP WATCH VIDEO MODAL */}
      {activeVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setActiveVideo(null)}>
          <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl text-left flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-150 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-gray-900 text-lg leading-normal truncate pr-4">
                {activeVideo.title}
              </h3>
              <button
                onClick={() => setActiveVideo(null)}
                className="text-gray-500 hover:text-red-800 text-xl font-bold p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="aspect-video bg-black w-full">
              {getYoutubeId(activeVideo.videoUrl) ? (
                <iframe
                  title="youtube-player"
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${getYoutubeId(activeVideo.videoUrl)}?autoplay=1`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white bg-slate-900">
                  Liên kết video không khả dụng
                </div>
              )}
            </div>
            
            <div className="p-6 bg-gray-50 shrink-0 border-t border-gray-150">
              <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-1.5">Mô tả chi tiết & Câu hỏi định hướng:</h4>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                {activeVideo.description || 'Không có mô tả thêm.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
