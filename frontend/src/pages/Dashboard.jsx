import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { useAuth } from '../context/AuthContext';
import { useJourney } from '../hooks/useJourney';
import { api } from '../services/api';

function getYouTubeId(url) {
  if (!url || typeof url !== 'string') return "Mzg-AdRrjGY";
  try {
    if (url.length === 11 && !url.includes('/') && !url.includes('.')) {
      return url;
    }
    const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[1] && match[1].length === 11) ? match[1] : "Mzg-AdRrjGY";
  } catch (error) {
    console.error("Failed to parse YouTube URL:", error);
    return "Mzg-AdRrjGY";
  }
}

function getSlugFromTitle(title) {
  if (!title) return '';
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export default function Dashboard() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { user } = useAuth();
  const [aiInput, setAiInput] = useState("");
  const [topicId, setTopicId] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Chào đồng chí! Hôm nay chúng ta sẽ tìm hiểu về khái niệm nào trong Triết học?' }
  ]);

  const { data, isLoading } = useJourney(user);
  const courses = data?.courses || [];
  const journey = data?.journey;

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const topics = await api.debates.topics.list();
        if (topics && topics.length > 0) {
          const mainTopic = topics.find(t => t.title.includes('Duy vật')) || topics[0];
          setTopicId(mainTopic.id);
        }
      } catch (err) {
        console.error("Failed to fetch debate topics:", err);
      }
    };
    if (user) {
      fetchTopics();
    }
  }, [user]);

  useEffect(() => {
    const loadChatHistory = async () => {
      if (isChatOpen && topicId && user) {
        try {
          const debate = await api.debates.topics.getTranscript(topicId, user.id);
          if (debate && debate.transcript && debate.transcript.length > 0) {
            const formatted = debate.transcript.map(t => ({
              role: t.speaker === 'User' ? 'user' : 'assistant',
              content: t.text
            }));
            setChatMessages(formatted);
          }
        } catch (err) {
          console.error("Failed to load chat history:", err);
        }
      }
    };
    loadChatHistory();
  }, [isChatOpen, topicId, user]);

  const stats = useMemo(() => {
    const list = journey || [];
    let lessonsCount = 0;
    list.forEach(chap => {
      lessonsCount += (chap.nodes || []).length;
    });
    return {
      chapters: list.length,
      sections: list.length * 3,
      lessons: lessonsCount
    };
  }, [journey]);

  const activeNodes = useMemo(() => {
    const list = journey || [];
    const nodesList = [];
    list.forEach(chap => {
      (chap.nodes || []).forEach(n => {
        nodesList.push({
          ...n,
          chapterTitle: chap.title
        });
      });
    });
    return nodesList.slice(0, 4);
  }, [journey]);


  const toggleChat = () => setIsChatOpen((prev) => !prev);

  const handleAiSend = async (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const userMsg = aiInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setAiInput("");

    try {
      if (topicId && user) {
        const updatedDebate = await api.debates.topics.sendMessage(topicId, user.id, userMsg);
        const formatted = updatedDebate.transcript.map(t => ({
          role: t.speaker === 'User' ? 'user' : 'assistant',
          content: t.text
        }));
        setChatMessages(formatted);
      } else {
        setTimeout(() => {
          setChatMessages(prev => [...prev, { role: 'assistant', content: 'Hệ thống AI đang khởi tạo, vui lòng thử lại sau.' }]);
        }, 1000);
      }
    } catch (err) {
      console.error("Failed to send debate message:", err);
      setChatMessages(prev => [...prev, { role: 'assistant', content: `Lỗi kết nối AI: ${err.message}` }]);
    }
  };

  const activeCourse = courses.find(c => c.title.includes('Triết học')) || {
    id: 'default',
    title: 'Triết học Mác – Lênin',
    description: 'Nghiên cứu các quy luật vận động chung nhất của tự nhiên, xã hội và tư duy thông qua phương pháp luận biện chứng duy vật.'
  };


  return (
    <PageShell activeKey="dashboard">
      <>
        {/* Hero Section */}
        <section className="w-full bg-red-800 py-16 px-12 relative overflow-hidden">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="font-bold text-5xl text-white mb-6">{activeCourse.title}</h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              {activeCourse.description || "Nghiên cứu các quy luật vận động chung nhất của tự nhiên, xã hội và tư duy thông qua phương pháp luận biện chứng duy vật."}
            </p>

            <div className="relative max-w-2xl mx-auto">
              <input
                className="w-full bg-white/10 border-white/30 border text-white placeholder:text-white/50 rounded-full px-6 py-4 focus:ring-2 focus:ring-white focus:border-transparent outline-none backdrop-blur-sm transition-all"
                placeholder="Tìm kiếm khái niệm, luận điểm hoặc bài học..."
                type="text"
              />
              <button aria-label="Tìm kiếm AI" className="absolute right-3 top-2 bottom-2 bg-white text-red-800 px-6 rounded-full font-bold flex items-center gap-2 hover:bg-gray-100 transition-colors">
                <span className="material-symbols-outlined text-sm">bolt</span>
                AI Search
              </button>
            </div>
          </div>
        </section>

        <div className="px-12 py-12 max-w-6xl mx-auto">
          {/* Main layout grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Motivation Card */}
            <div className="md:col-span-2 bg-blue-50 p-8 rounded-xl shadow-md border-l-4 border-red-800 flex flex-col justify-center">
              <h3 className="font-bold text-2xl text-gray-900 mb-2">Chào mừng đồng chí!</h3>
              <p className="text-gray-700 leading-relaxed text-base">
                Chào mừng đồng chí đến với Học viện Triết học PhiloMind. Hãy tiếp tục hành trình nghiên cứu, rèn luyện tư duy biện chứng và giải quyết các bài tập thực hành hôm nay.
              </p>
            </div>

            {/* Mindmap Link Card */}
            <Link
              to="/lessons"
              className="bg-gradient-to-br from-red-700 to-red-900 p-6 rounded-xl shadow-md border border-red-900 flex flex-col justify-between text-white hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">Mindmap</h3>
                  <span className="material-symbols-outlined">account_tree</span>
                </div>
                <p className="text-sm text-white/80 mb-4">
                  Mở rộng mục lục học tập trực quan tương tác toàn khóa.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-white" />
                    <span>{stats.chapters} Chương</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-white/70" />
                    <span>{stats.sections} Đề mục</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-white/50" />
                    <span>{stats.lessons} Bài học liên kết</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">
                Khám phá sơ đồ
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </div>
            </Link>
          </div>

          {/* Active Curriculum */}
          <h3 className="font-bold text-3xl text-gray-900 mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-red-800">auto_stories</span>
            Active Curriculum
          </h3>

          {isLoading ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined animate-spin text-4xl text-red-800">sync</span>
              <p className="text-gray-500 mt-2 font-semibold">Đang tải giáo trình...</p>
            </div>
          ) : activeNodes.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300 mb-12">
              <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">folder_open</span>
              <p className="text-gray-500 text-sm">Chưa có bài học nào được khởi tạo. Vui lòng tải tài liệu giáo trình ở Admin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">

              {activeNodes.map((node) => (
                <Link
                  key={node.id}
                  to={`/lessons?lesson=${getSlugFromTitle(node.title)}`}
                  className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200 block text-left hover:-translate-y-1"
                >
                  <div className="aspect-video bg-gray-350 rounded-lg mb-4 overflow-hidden relative">
                    {node.videoUrl ? (
                      <img
                        className="w-full h-full object-cover"
                        src={`https://img.youtube.com/vi/${getYouTubeId(node.videoUrl)}/mqdefault.jpg`}
                        alt={node.title}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-850 font-bold text-xs uppercase p-3 text-center">
                        {node.title}
                      </div>
                    )}
                  </div>
                  <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded uppercase mb-2">
                    {node.chapterTitle ? node.chapterTitle.split(":")[0] : "Bài học"}
                  </span>
                  <h4 className="font-bold text-base text-gray-900 mb-2 truncate" title={node.title}>
                    {node.title}
                  </h4>
                  <p className="text-gray-600 text-xs line-clamp-2 mb-4">
                    {node.summary}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">schedule</span> {node.timeToRead || "10 min"}
                    </span>
                    <span className="p-2 bg-gray-50 text-red-800 rounded-lg group-hover:bg-red-800 group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Timeline & Mind Map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Timeline */}
            <div className="bg-blue-50 p-8 rounded-xl shadow-md border border-gray-200 text-left">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-bold text-lg text-gray-900">Mốc lịch sử triết học</h3>
                <button className="text-red-800 font-semibold text-sm">Xem dòng lịch sử</button>
              </div>
              <div className="relative pl-8 space-y-10 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-300">
                <div className="relative">
                  <div className="absolute -left-10 top-1 w-6 h-6 rounded-full bg-red-800 border-4 border-blue-50 z-10" />
                  <span className="text-xs text-red-800 font-bold">1848</span>
                  <h4 className="font-bold text-gray-900 mt-1">Tuyên ngôn của Đảng Cộng sản</h4>
                  <p className="text-gray-600 text-sm">Văn kiện chính trị bất hủ do Karl Marx và Friedrich Engels soạn thảo.</p>
                </div>
                <div className="relative opacity-60">
                  <div className="absolute -left-10 top-1 w-6 h-6 rounded-full bg-gray-400 border-4 border-blue-50 z-10" />
                  <span className="text-xs text-gray-500 font-bold">1867</span>
                  <h4 className="font-bold text-gray-900 mt-1">Bộ Tư bản (Tập 1)</h4>
                  <p className="text-gray-600 text-sm">Phân tích sâu sắc giá trị thặng dư, phương thức sản xuất tư bản chủ nghĩa.</p>
                </div>
              </div>
            </div>

            {/* Knowledge Map */}
            <Link to="/lessons" className="bg-blue-50 p-8 rounded-xl shadow-md border border-gray-200 cursor-pointer block hover:shadow-lg transition-all text-left">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-900">Bản đồ tri thức</h3>
                <span className="material-symbols-outlined text-gray-600">open_in_full</span>
              </div>
              <div className="h-48 rounded-lg bg-white flex items-center justify-center relative border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <span className="material-symbols-outlined text-6xl text-red-800/20">schema</span>
                  <p className="text-gray-500 text-sm mt-2">Bản đồ trực quan tương tác hệ thống các khái niệm triết học</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* AI Chat Bubble */}
        <div className="fixed bottom-8 right-8 z-50">
          {isChatOpen && (
            <div className="absolute bottom-20 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden mb-4">
              <div className="bg-red-800 p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm">smart_toy</span>
                  </div>
                  <div>
                    <p className="font-bold text-sm">Dialectic AI</p>
                    <p className="text-xs opacity-70">Trợ lý đồng chí luôn sẵn sàng</p>
                  </div>
                </div>
                <button aria-label="Đóng chat" className="text-white/60 hover:text-white" onClick={toggleChat}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="h-64 p-4 overflow-y-auto bg-gray-50 text-sm space-y-3 flex flex-col">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg shadow-sm border text-xs max-w-[85%] ${
                      msg.role === 'user'
                        ? 'bg-red-800 text-white self-end border-red-900'
                        : 'bg-white text-gray-800 self-start border-gray-200'
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}
              </div>
              <form onSubmit={handleAiSend} className="p-4 bg-white border-t border-gray-200 flex gap-2">
                <input
                  className="flex-1 bg-gray-100 border-none rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-red-800 outline-none text-gray-800"
                  placeholder="Hỏi về duy vật..."
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                />
                <button aria-label="Gửi tin nhắn" type="submit" className="bg-red-800 text-white p-2 rounded-lg hover:bg-red-900">
                  <span className="material-symbols-outlined text-sm">send</span>
                </button>
              </form>
            </div>
          )}

          <button
            onClick={toggleChat}
            aria-label="Mở khung trò chuyện AI"
            className="h-16 w-16 bg-red-800 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all relative"
          >
            <span className="material-symbols-outlined text-3xl">psychology</span>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-400" />
            </span>
          </button>
        </div>
      </>
    </PageShell>
  );
}
