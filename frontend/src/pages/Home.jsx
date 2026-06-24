import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import OnboardingGuide from '../components/OnboardingGuide';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { user } = useAuth();
  const [aiInput, setAiInput] = useState("");
  const [topicId, setTopicId] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Chào đồng chí! Hôm nay chúng ta sẽ tìm hiểu về khái niệm nào trong Triết học?' }
  ]);

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
    fetchTopics();
  }, []);

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
        // Mock response if guest or no topic
        setTimeout(() => {
          setChatMessages(prev => [
            ...prev,
            { role: 'assistant', content: 'Chào đồng chí! Để sử dụng tính năng thảo luận AI lưu lịch sử đầy đủ, vui lòng đăng nhập tài khoản.' }
          ]);
        }, 1000);
      }
    } catch (err) {
      console.error("Failed to send debate message:", err);
      setChatMessages(prev => [...prev, { role: 'assistant', content: `Lỗi kết nối AI: ${err.message}` }]);
    }
  };

  return (
    <PageShell activeKey="home">
      <OnboardingGuide
        tabKey="home"
        steps={[
          "Chào mừng đồng chí đến với PhiloMind! Đây là không gian học tập Triết học Mác - Lênin thế hệ mới.",
          "Khám phá Sơ đồ giáo trình: Hãy bắt đầu bằng cách nhấp vào \"Sơ đồ bài học\" để xem sơ đồ tư duy tương tác của giáo trình.",
          "Trợ lý Dialectic AI (Bong bóng chat góc dưới phải): Bạn gặp khó khăn với các thuật ngữ khó như \"Biện chứng\", \"Phủ định của phủ định\"? Hãy click vào bong bóng để hỏi trực tiếp trợ lý AI.",
          "Mốc lịch sử triết học: Nhìn qua trục thời gian hoặc tiến trình học ở trang chủ để nhanh chóng nắm bắt lộ trình học tập của bạn."
        ]}
      />
      
      <div className="min-h-screen bg-slate-50 dark:bg-[#001F28] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
        {/* Premium Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary-850 via-primary-750 to-primary-900 text-white py-24 px-6 md:px-12 text-center rounded-b-[3rem] shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(76,214,255,0.15),transparent)] pointer-events-none" />
          <div className="max-w-4xl mx-auto space-y-6 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary-100/10 border border-primary-150 text-primary-100 font-bold text-xs uppercase tracking-wider animate-pulse">
              <span className="material-symbols-outlined text-xs">bolt</span> Sanctuary Học Thuật AI
            </span>
            <h1 className="font-extrabold text-5xl md:text-6xl tracking-tight leading-tight" style={{ fontFamily: '"Libre Caslon Text", serif' }}>
              PhiloMind
            </h1>
            <p className="text-xl md:text-2xl text-primary-100/90 font-light max-w-2xl mx-auto leading-relaxed">
              Trải nghiệm học tập triết học duy vật biện chứng tương tác trực quan với sự hỗ trợ của trí tuệ nhân tạo.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-6">
              <Link
                to="/lessons"
                className="bg-white text-primary-800 font-bold px-8 py-4 rounded-3xl shadow-lg hover:bg-primary-50 hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                Khám phá Sơ đồ giáo trình
              </Link>
              <Link
                to="/practice"
                className="bg-primary-900/40 text-white border border-white/20 font-bold px-8 py-4 rounded-3xl hover:bg-primary-900/60 transition-all shadow-md"
              >
                Khu luyện tập (Practice)
              </Link>
            </div>
          </div>
        </section>

        {/* Features Showcase Section */}
        <section className="py-20 px-6 md:px-12 max-w-6xl mx-auto text-left w-full">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-primary-100">Tính năng cốt lõi</h2>
            <p className="text-slate-500 dark:text-primary-300 text-lg">Chuyển đổi giáo trình Triết học Mác - Lênin khô khan thành trải nghiệm học tập đa giác quan.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature 1: Mindmap */}
            <div className="bg-white dark:bg-[#002b37] p-8 rounded-3xl border border-slate-200 dark:border-primary-850 shadow-sm hover:shadow-md transition-all flex gap-5">
              <div className="h-12 w-12 bg-primary-50 dark:bg-primary-900/35 text-primary-800 dark:text-primary-300 rounded-3xl flex items-center justify-center shrink-0 shadow-inner">
                <span className="material-symbols-outlined text-2xl">account_tree</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-xl text-slate-900 dark:text-primary-100">Sơ đồ tri thức trực quan</h3>
                <p className="text-slate-650 dark:text-primary-200 text-sm leading-relaxed">
                  Trực quan hóa cấu trúc giáo trình bằng mindmap thu phóng động (React Flow). Dễ dàng nắm bắt mối quan hệ biện chứng giữa các quy luật, phạm trù.
                </p>
                <Link to="/lessons" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-750 dark:text-primary-300 dark:hover:text-primary-100 pt-2">
                  Xem bài học <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* Feature 2: Podcasts */}
            <div className="bg-white dark:bg-[#002b37] p-8 rounded-3xl border border-slate-200 dark:border-primary-850 shadow-sm hover:shadow-md transition-all flex gap-5">
              <div className="h-12 w-12 bg-primary-50 dark:bg-primary-900/35 text-primary-800 dark:text-primary-300 rounded-3xl flex items-center justify-center shrink-0 shadow-inner">
                <span className="material-symbols-outlined text-2xl">podcasts</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-xl text-slate-900 dark:text-primary-100">Conversational Podcasts</h3>
                <p className="text-slate-650 dark:text-primary-200 text-sm leading-relaxed">
                  Nghe các cuộc đối thoại triết học sống động giữa các học giả do AI tổng hợp nội dung và đọc bằng giọng nói tự nhiên của Kokoro ONNX TTS.
                </p>
                <Link to="/lessons" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-750 dark:text-primary-300 dark:hover:text-primary-100 pt-2">
                  Nghe Podcast <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* Feature 3: Debate */}
            <div className="bg-white dark:bg-[#002b37] p-8 rounded-3xl border border-slate-200 dark:border-primary-850 shadow-sm hover:shadow-md transition-all flex gap-5">
              <div className="h-12 w-12 bg-primary-50 dark:bg-primary-900/35 text-primary-800 dark:text-primary-300 rounded-3xl flex items-center justify-center shrink-0 shadow-inner">
                <span className="material-symbols-outlined text-2xl">diversity_3</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-xl text-slate-900 dark:text-primary-100">Đấu trường Socratic</h3>
                <p className="text-slate-650 dark:text-primary-200 text-sm leading-relaxed">
                  Tranh luận trực tiếp với AI đóng vai nhà tư tưởng. Rèn luyện tư duy phản biện bằng cách phản hồi các câu hỏi dẫn dắt mang tính Socratic.
                </p>
                <Link to="/debate" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-750 dark:text-primary-300 dark:hover:text-primary-100 pt-2">
                  Tranh luận ngay <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* Feature 4: Flashcards */}
            <div className="bg-white dark:bg-[#002b37] p-8 rounded-3xl border border-slate-200 dark:border-primary-850 shadow-sm hover:shadow-md transition-all flex gap-5">
              <div className="h-12 w-12 bg-primary-50 dark:bg-primary-900/35 text-primary-800 dark:text-primary-300 rounded-3xl flex items-center justify-center shrink-0 shadow-inner">
                <span className="material-symbols-outlined text-2xl">auto_stories</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-xl text-slate-900 dark:text-primary-100">Thẻ nhớ thông minh SM-2</h3>
                <p className="text-slate-650 dark:text-primary-200 text-sm leading-relaxed">
                  Hệ thống ôn tập lặp lại ngắt quãng (Spaced Repetition) tự động tính toán thời điểm học lại tối ưu để củng cố kiến thức vào trí nhớ dài hạn.
                </p>
                <Link to="/practice" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-750 dark:text-primary-300 dark:hover:text-primary-100 pt-2">
                  Luyện Flashcards <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Philosophical Context & Timeline */}
        <section className="bg-primary-50/20 dark:bg-primary-900/10 border-t border-b border-primary-100 dark:border-primary-850 py-20 px-6 md:px-12 w-full font-sans">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 text-left">
            <div className="space-y-6 flex flex-col justify-center">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-primary-100 leading-tight">
                Khoa học của những Quy luật Phổ biến
              </h2>
              <p className="text-slate-650 dark:text-primary-250 leading-relaxed">
                Triết học Mác - Lênin là hệ thống lý luận khoa học cung cấp thế giới quan duy vật biện chứng và phương pháp luận khoa học sắc bén để nhận thức và cải tạo thế giới. PhiloMind giúp bạn tiếp cận kho tàng tri thức này một cách tự nhiên, chủ động.
              </p>
              <div>
                <Link to="/lessons" className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-750 text-white px-6 py-3 rounded-3xl font-bold shadow-md hover:shadow-lg transition-all font-sans">
                  Bắt đầu Bài học đầu tiên
                </Link>
              </div>
            </div>

            {/* Timeline Widget */}
            <div className="bg-white dark:bg-[#002b37] p-8 rounded-3xl border border-slate-200 dark:border-primary-850 shadow-sm">
              <h3 className="font-bold text-lg text-slate-905 dark:text-primary-100 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-600 dark:text-primary-300">schedule</span>
                Mốc Lịch Sử Triết Học Quan Trọng
              </h3>
              <div className="relative pl-6 space-y-8 before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-primary-850">
                <div className="relative">
                  <div className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-primary-600 border-2 border-white dark:border-[#002b37] shadow-sm z-10" />
                  <span className="text-xs text-primary-600 dark:text-primary-350 font-bold">1848</span>
                  <h4 className="font-bold text-slate-900 dark:text-primary-100 mt-0.5">Tuyên ngôn của Đảng Cộng sản</h4>
                  <p className="text-slate-500 dark:text-primary-300 text-xs mt-1">Tác phẩm kinh điển đặt nền móng lý luận cho chủ nghĩa Mác, do Karl Marx và Friedrich Engels soạn thảo.</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-primary-600 border-2 border-white dark:border-[#002b37] shadow-sm z-10" />
                  <span className="text-xs text-primary-600 dark:text-primary-350 font-bold">1867</span>
                  <h4 className="font-bold text-slate-900 dark:text-primary-100 mt-0.5">Bộ Tư bản (Tập 1)</h4>
                  <p className="text-slate-500 dark:text-primary-300 text-xs mt-1">Karl Marx công bố tập đầu tiên của tác phẩm kinh tế - triết học vĩ đại nhất, phân tích bản chất phương thức sản xuất tư bản.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* AI Chat Bubble */}
      <div className="fixed bottom-8 right-8 z-50 animate-bounce-slow">
        {isChatOpen && (
          <div className="absolute bottom-20 right-0 w-80 bg-white dark:bg-[#002b37] rounded-3xl shadow-2xl border border-slate-200 dark:border-primary-850 overflow-hidden mb-4 animate-fadeIn">
            <div className="bg-primary-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-3xl bg-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">smart_toy</span>
                </div>
                <div>
                  <p className="font-bold text-sm">Dialectic AI</p>
                  <p className="text-xs opacity-70">Trợ lý học tập luôn sẵn sàng</p>
                </div>
              </div>
              <button aria-label="Đóng chat" className="text-white/60 hover:text-white" onClick={toggleChat}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="h-64 p-4 overflow-y-auto bg-slate-50 dark:bg-[#001F28] text-sm space-y-3 flex flex-col">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-3xl shadow-sm border text-xs max-w-[85%] ${
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white self-end border-primary-750'
                      : 'bg-white dark:bg-[#002b37] text-slate-800 dark:text-slate-100 self-start border-slate-200 dark:border-primary-850'
                  }`}
                >
                  {msg.content}
                </div>
              ))}
            </div>
            <form onSubmit={handleAiSend} className="p-4 bg-white dark:bg-[#002b37] border-t border-slate-200 dark:border-primary-850 flex gap-2">
              <input
                className="flex-1 bg-slate-100 dark:bg-primary-900/30 border-none rounded-3xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary-600 outline-none text-slate-800 dark:text-slate-100"
                placeholder="Hỏi về duy vật..."
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
              />
              <button aria-label="Gửi tin nhắn" type="submit" className="bg-primary-600 text-white p-2 rounded-3xl hover:bg-primary-750 flex items-center justify-center">
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </form>
          </div>
        )}

        <button
          onClick={toggleChat}
          aria-label="Mở khung trò chuyện AI"
          className="h-16 w-16 bg-primary-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all relative"
        >
          <span className="material-symbols-outlined text-3xl">psychology</span>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-400" />
          </span>
        </button>
      </div>
    </PageShell>
  );
}
