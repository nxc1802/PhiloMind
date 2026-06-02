import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function HomePages() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ chapters: 3, sections: 9, lessons: 24 });
  const [aiInput, setAiInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Chào đồng chí! Hôm nay chúng ta sẽ tìm hiểu về khái niệm nào trong Triết học?' }
  ]);

  const toggleChat = () => setIsChatOpen((prev) => !prev);

  useEffect(() => {
    api.courses.list()
      .then(async (res) => {
        setCourses(res);
        const mainCourse = res.find(c => c.title.includes('Triết học'));
        if (mainCourse && user) {
          try {
            const journey = await api.courses.getJourney(mainCourse.id, user.id);
            let lessonsCount = 0;
            journey.forEach(chap => {
              lessonsCount += chap.nodes.length;
            });
            setStats({
              chapters: journey.length,
              sections: journey.length * 3,
              lessons: lessonsCount
            });
          } catch (e) {
            console.error("Error loading journey details:", e);
          }
        }
      })
      .catch((err) => {
        console.error("Error loading courses:", err);
      });
  }, [user]);

  const handleAiSend = (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const userMsg = aiInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setAiInput("");

    // Simple auto mock reply from AI
    setTimeout(() => {
      let reply = "Đây là một câu hỏi rất sâu sắc về phương pháp luận duy vật biện chứng. ";
      if (userMsg.toLowerCase().includes("vật chất")) {
        reply += "Vật chất là thực tại khách quan tồn tại độc lập với ý thức con người. Theo Lênin, cảm giác chỉ phản ánh vật chất.";
      } else if (userMsg.toLowerCase().includes("ý thức")) {
        reply += "Ý thức là sự phản ánh năng động, sáng tạo thế giới khách quan vào bộ não người, có nguồn gốc tự nhiên và xã hội.";
      } else {
        reply += "Mời đồng chí tìm hiểu kỹ hơn trong phần Sơ đồ tư duy bài học ở mục 'Lessons' hoặc tham gia Tranh biện AI Socratic để làm rõ vấn đề.";
      }
      setChatMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    }, 1000);
  };

  const activeCourse = courses.find(c => c.title.includes('Triết học')) || {
    id: 'default',
    title: 'Triết học Mác – Lênin',
    description: 'Nghiên cứu các quy luật vận động chung nhất của tự nhiên, xã hội và tư duy thông qua phương pháp luận biện chứng duy vật.'
  };

  return (
    <PageShell activeKey="home">
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
              <button className="absolute right-3 top-2 bottom-2 bg-white text-red-800 px-6 rounded-full font-bold flex items-center gap-2 hover:bg-gray-100 transition-colors">
                <span className="material-symbols-outlined text-sm">bolt</span>
                AI Search
              </button>
            </div>
          </div>
        </section>

        <div className="px-12 py-12 max-w-6xl mx-auto">
          {/* Quotes Section & Progress */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="md:col-span-2 bg-blue-50 p-8 rounded-xl shadow-md border-l-4 border-red-800 relative">
              <span className="material-symbols-outlined absolute right-6 top-6 text-red-800/10 text-6xl select-none">
                format_quote
              </span>
              <div className="relative z-10">
                <p className="italic text-2xl text-gray-900 mb-6 leading-relaxed">
                  "Các nhà triết học đã chỉ giải thích thế giới bằng nhiều cách khác nhau, song vấn đề là cải tạo thế giới."
                </p>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gray-300 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900">Karl Marx</p>
                    <p className="text-sm text-gray-500">Luận cương về Feuerbach, 1845</p>
                  </div>
                </div>
              </div>
            </div>

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
                  Mục lục tổng dạng sơ đồ tư duy: Chương → Đề mục → Bài học.
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

          {/* Lesson Cards */}
          <h3 className="font-bold text-3xl text-gray-900 mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-red-800">auto_stories</span>
            Active Curriculum
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Lesson Card 1 */}
            <Link
              to="/lessons?lesson=nguon-goc-triet-hoc"
              className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200 block text-left"
            >
              <div className="aspect-video bg-gray-300 rounded-lg mb-4 overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFZ0OqhZipKgNxHDuY4HHUm9woW3yDmnvo_N9R9yjd-V41eeguFVIw5joENdzlRIsM5p64jEEbymNdtxTR9boXOQn35TB9daqtITtSZvEKeh0bmEFmiTr9Zxu3CP30H97CTh9IP3tgdKwLv5wGC2lccTyzv9kVnfPn8E7L6_Ox1pKkoeWxka9c5k96YuiQ946LWknyevKUN6SMi4QISaxUKBmgvBNPqZb5MOYboZCnzB0nw_nYctPaSlnYRJJDi8eVFGG_Ms-Oa2A"
                  alt="Nhập môn Triết học"
                />
              </div>
              <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded uppercase mb-2">
                Chương 1
              </span>
              <h4 className="font-bold text-lg text-gray-900 mb-2">Nguồn gốc của triết học</h4>
              <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                Triết học ra đời từ nguồn gốc nhận thức và nguồn gốc xã hội từ thời cổ đại.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">schedule</span> 8 min
                </span>
                <span className="p-2 bg-gray-100 text-red-800 rounded-lg group-hover:bg-red-800 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">chevron_right</span>
                </span>
              </div>
            </Link>

            {/* Lesson Card 2 */}
            <Link
              to="/lessons?lesson=pham-tru-vat-chat"
              className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200 block text-left"
            >
              <div className="aspect-video bg-gray-300 rounded-lg mb-4 overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuEjyZhdAAPzo_EoSvQvU-VL27N83gvp2pPiQWOBvmyC4zd-IHksUnB2I-IDse7t0rpnwGCvO_HrQ18DwfAaAVOQO4ACbb3wkWuRtQpgXC2eGLVSsjJTqq06JDFWPEKCgJtQX2pCqQdcv2G9AfwgGkYr1GQ7fiQfZAD_JKjHsjCo1FSFg6HyJhNtsAYzK_JaPmNq4ZkaGhfQPNqzCshnu_S7ZzZl4bMdanNyxEGLqf-5RAMR60u2gn-61z6PoJ8TloxTVxe_9X09w"
                  alt="Duy vật biện chứng"
                />
              </div>
              <span className="inline-block px-2 py-0.5 bg-green-100 text-green-800 text-xs font-bold rounded uppercase mb-2">
                Chương 2
              </span>
              <h4 className="font-bold text-lg text-gray-900 mb-2">Phạm trù vật chất</h4>
              <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                Vật chất là thực tại khách quan tồn tại độc lập với ý thức, được đem lại cho con người trong cảm giác.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">schedule</span> 15 min
                </span>
                <span className="p-2 bg-gray-100 text-red-800 rounded-lg group-hover:bg-red-800 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">chevron_right</span>
                </span>
              </div>
            </Link>

            {/* Featured Lesson Card */}
            <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200 flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2 bg-gray-300 rounded-lg overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQwIbsnOJP7Zz1CFHXZ0TQzEKNqH3FMF6Qysz93VttyINK220t3VeVGBxAs5xDJsPDVTQn1djfkWNoMVGY9Nm63DeoFXQD4lu5s-cO8cphVQdTyMFPPDRxbAc_gSV7ipbG9j6izohMcZls-FMrOStKvU0euXQo2foTb9G3GHUD_jaR2bfn3yTdjDyYivtP-lOxMZqkIBZ6VZfMqPGOwKHuiL47IEu13AXYCQWGTe9qlrx9oL86Vx1HZgRY1FBTFEuZja0KI3z4yiY"
                  alt="Duy vật lịch sử"
                />
              </div>
              <div className="md:w-1/2 flex flex-col justify-center">
                <span className="inline-block w-fit px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-bold rounded uppercase mb-2">
                  Chương 3
                </span>
                <h4 className="font-bold text-2xl text-gray-900 mb-3">Biện chứng LLSX – QHSX</h4>
                <p className="text-gray-600 mb-6">
                  Tìm hiểu quy luật quan hệ sản xuất phù hợp với trình độ phát triển của lực lượng sản xuất.
                </p>
                <div className="flex items-center gap-4">
                  <Link to="/lessons?lesson=llsx-qhsx" className="bg-red-800 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-900 transition-all">
                    Bắt đầu học
                  </Link>
                  <button className="text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <span className="material-symbols-outlined">bookmark</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline & Mind Map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Timeline */}
            <div className="bg-blue-50 p-8 rounded-xl shadow-md border border-gray-200">
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
            <Link to="/lessons" className="bg-blue-50 p-8 rounded-xl shadow-md border border-gray-200 cursor-pointer block hover:shadow-lg transition-all">
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
                <button className="text-white/60 hover:text-white" onClick={toggleChat}>
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
                <button type="submit" className="bg-red-800 text-white p-2 rounded-lg hover:bg-red-900">
                  <span className="material-symbols-outlined text-sm">send</span>
                </button>
              </form>
            </div>
          )}

          <button
            onClick={toggleChat}
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
