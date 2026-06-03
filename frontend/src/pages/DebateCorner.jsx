import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import PageShell, { PageHero } from "../components/PageShell";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

const DebateCorner = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // Dual Debate Mode: 'topic' (Socratic topics) or 'concept' (lesson nodes)
  const [debateType, setDebateType] = useState("topic"); 
  const [activeDebate, setActiveDebate] = useState(null); // { type: 'topic' | 'concept', id: string } | null
  
  // Data States
  const [nodes, setNodes] = useState([]);
  const [topics, setTopics] = useState([]);
  
  const [selectedNodeId, setSelectedNodeId] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  
  const [loadingLists, setLoadingLists] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);

  const chatEndRef = useRef(null);

  // Fetch both Topics and Nodes list on mount
  useEffect(() => {
    if (!user) return;
    const loadDebateResources = async () => {
      setLoadingLists(true);
      try {
        // Fetch Topics
        const topicsList = await api.debates.topics.list();
        setTopics(topicsList);
        if (topicsList.length > 0) {
          setSelectedTopicId(topicsList[0].id);
        }

        // Fetch Nodes
        const res = await api.courses.list();
        const mainCourse = res.find(c => c.title.includes('Triết học'));
        if (mainCourse) {
          const journey = await api.courses.getJourney(mainCourse.id, user.id);
          const allNodes = journey.flatMap(c => c.nodes);
          setNodes(allNodes);
          if (allNodes.length > 0) {
            const materialNode = allNodes.find(n => n.title.includes('vật chất'));
            setSelectedNodeId(materialNode ? materialNode.id : allNodes[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load debate list resources:", err);
      } finally {
        setLoadingLists(false);
      }
    };
    loadDebateResources();
  }, [user]);

  // Fetch transcript depending on active debate type
  const fetchDebateTranscript = useCallback(async () => {
    if (!user) return;
    setLoadingChat(true);
    try {
      if (debateType === "topic") {
        if (!selectedTopicId) return;
        const res = await api.debates.topics.getTranscript(selectedTopicId, user.id);
        setMessages(Array.isArray(res.transcript) ? res.transcript : []);
      } else {
        if (!selectedNodeId) return;
        const res = await api.debates.getTranscript(selectedNodeId, user.id);
        setMessages(Array.isArray(res.transcript) ? res.transcript : []);
      }
    } catch (err) {
      console.error("Failed to load transcript:", err);
      showToast("Tải đối thoại phản biện thất bại: " + err.message, "error");
    } finally {
      setLoadingChat(false);
    }
  }, [user, debateType, selectedTopicId, selectedNodeId, showToast]);

  useEffect(() => {
    fetchDebateTranscript();
  }, [fetchDebateTranscript]);

  // Scroll to bottom smoothly
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sendingMsg]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !user || sendingMsg) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setSendingMsg(true);

    // Optimistic local update
    setMessages(prev => [...prev, { speaker: "User", text: userMessage, time: Date.now() }]);

    try {
      if (debateType === "topic") {
        const res = await api.debates.topics.sendMessage(selectedTopicId, user.id, userMessage);
        setMessages(Array.isArray(res.transcript) ? res.transcript : []);
      } else {
        const res = await api.debates.sendMessage(selectedNodeId, user.id, userMessage);
        setMessages(Array.isArray(res.transcript) ? res.transcript : []);
      }
      showToast("Gửi phản biện biện chứng thành công!", "success");
    } catch (err) {
      console.error("Failed to post argument:", err);
      showToast("Lỗi gửi lập luận: " + err.message, "error");
    } finally {
      setSendingMsg(false);
    }
  };

  // Compute currently selected information
  const activeTopic = useMemo(() => {
    return topics.find(t => t.id === selectedTopicId);
  }, [topics, selectedTopicId]);

  const activeNode = useMemo(() => {
    return nodes.find(n => n.id === selectedNodeId);
  }, [nodes, selectedNodeId]);

  return (
    <PageShell activeKey="debate">
      <PageHero
        eyebrow="Đấu trường Socratic AI phản biện liên tục"
        icon="diversity_3"
        title={
          <>
            Tranh biện Triết học Biện chứng
            {activeDebate && (
              <span className="block text-2xl md:text-3xl mt-2 opacity-95 text-amber-200">
                {activeDebate.type === "topic"
                  ? (activeTopic ? `Kịch bản: ${activeTopic.title}` : "Tranh luận Kịch bản")
                  : (activeNode ? `Khái niệm: ${activeNode.title}` : "Tranh luận Bài học")}
              </span>
            )}
          </>
        }
        subtitle=""
      />

      <div className="px-6 md:px-12 py-10 max-w-6xl mx-auto">
        {!activeDebate ? (
          // ==================== SELECTION GRID DASHBOARD ====================
          <div>
            <div className="flex justify-center mb-8">
              <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl border border-gray-200">
                <button
                  type="button"
                  onClick={() => setDebateType("topic")}
                  className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    debateType === "topic" ? "bg-white text-red-800 shadow-sm" : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  🎭 Kịch bản có sẵn
                </button>
                <button
                  type="button"
                  onClick={() => setDebateType("concept")}
                  className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    debateType === "concept" ? "bg-white text-red-800 shadow-sm" : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  📚 Khái niệm bài học
                </button>
              </div>
            </div>

            {loadingLists ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200 shadow-md">
                <span className="material-symbols-outlined animate-spin text-5xl text-red-800">sync</span>
                <p className="text-gray-500 mt-4 font-semibold">Đang tải danh sách đấu trường tranh biện...</p>
              </div>
            ) : debateType === "topic" ? (
              topics.length === 0 ? (
                <div className="bg-white p-12 text-center border border-dashed border-gray-300 rounded-2xl">
                  <span className="material-symbols-outlined text-5xl text-gray-300">chat_bubble_outline</span>
                  <p className="text-gray-500 mt-2 font-semibold">Chưa có kịch bản tranh luận nào trên DB.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {topics.map((t) => (
                    <div
                      key={t.id}
                      className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="material-symbols-outlined text-red-800">theater_comedy</span>
                          <span className="text-xs uppercase tracking-wider text-gray-500 font-bold">Kịch bản Socratic</span>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2 leading-snug">{t.title}</h3>
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">{t.description}</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedTopicId(t.id);
                          setActiveDebate({ type: "topic", id: t.id });
                        }}
                        className="w-full bg-red-800 hover:bg-red-950 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1 mt-2"
                      >
                        <span className="material-symbols-outlined text-sm font-bold">forum</span>
                        Bắt đầu phản biện
                      </button>
                    </div>
                  ))}
                </div>
              )
            ) : (
              nodes.length === 0 ? (
                <div className="bg-white p-12 text-center border border-dashed border-gray-300 rounded-2xl">
                  <span className="material-symbols-outlined text-5xl text-gray-300">menu_book</span>
                  <p className="text-gray-500 mt-2 font-semibold">Chưa có khái niệm bài học nào được upload.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nodes.map((n) => (
                    <div
                      key={n.id}
                      className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="material-symbols-outlined text-amber-600">menu_book</span>
                          <span className="text-xs uppercase tracking-wider text-gray-500 font-bold">Theo Bài Học</span>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2 leading-snug">{n.title}</h3>
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">{n.quickTake}</p>
                        <div className="inline-block bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase mb-4">
                          Độ khó: {n.difficulty || "Medium"}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedNodeId(n.id);
                          setActiveDebate({ type: "concept", id: n.id });
                        }}
                        className="w-full bg-red-800 hover:bg-red-950 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1 mt-2"
                      >
                        <span className="material-symbols-outlined text-sm font-bold">forum</span>
                        Tranh luận bài học
                      </button>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        ) : (
          // ==================== INTERACTIVE CHATBOT VIEW ====================
          <div>
            <div className="mb-6">
              <button
                type="button"
                onClick={() => setActiveDebate(null)}
                className="inline-flex items-center gap-1 text-sm font-bold text-red-800 hover:text-red-900 transition-colors"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Quay lại danh sách kịch bản
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Interactive Chat Panel */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-gray-200 p-6 flex flex-col h-[580px]">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-800">smart_toy</span>
                    <h3 className="font-bold text-base text-gray-900">
                      Đối thoại Socratic với AI triết học
                    </h3>
                  </div>
                  <span className="bg-red-50 text-red-800 text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1 uppercase tracking-wider">
                    <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
                    Live Session
                  </span>
                </div>

                {/* Chat Messages scroll area */}
                <div className="flex-1 overflow-y-auto py-4 px-2 space-y-4">
                  {loadingChat ? (
                    <div className="h-full flex items-center justify-center flex-col">
                      <span className="material-symbols-outlined animate-spin text-red-800 text-4xl">sync</span>
                      <p className="text-gray-500 mt-2 text-sm font-semibold">Đang tổng hợp lịch sử đối thoại phản biện...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                      Không có tin nhắn nào. Nhập lập luận bên dưới để bắt đầu.
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isAi = msg.speaker === "Host";
                      return (
                        <div
                          key={idx}
                          className={`flex gap-3 max-w-[85%] ${isAi ? "self-start text-left" : "self-end flex-row-reverse text-right ml-auto"}`}
                        >
                          <div
                            className={`h-9 w-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 ${
                              isAi ? "bg-red-800 shadow-sm" : "bg-indigo-900 shadow-sm"
                            }`}
                          >
                            {isAi ? "AI" : "SV"}
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 font-bold block mb-1">
                              {isAi ? "Socratic AI (Phản biện)" : (user?.name || "Sinh viên")}
                            </span>
                            <div
                              className={`p-3.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
                                isAi
                                  ? "bg-gray-100 text-gray-800 border border-gray-200 rounded-tl-sm"
                                  : "bg-red-800 text-white border border-red-900 rounded-tr-sm"
                              }`}
                            >
                              {msg.text}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}

                  {sendingMsg && (
                    <div className="flex gap-3 max-w-[85%] self-start text-left">
                      <div className="h-9 w-9 rounded-xl bg-red-800 text-white flex items-center justify-center font-bold text-xs animate-pulse">
                        AI
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold block mb-1">
                          Socratic AI (Phản biện)
                        </span>
                        <div className="bg-gray-100 text-gray-800 border border-gray-200 p-3.5 rounded-2xl shadow-sm text-sm flex items-center gap-2">
                          <span className="material-symbols-outlined animate-spin text-sm text-red-800">sync</span>
                          <span className="italic text-gray-500 text-xs">AI đang phân tích lập luận biện chứng của đồng chí để phản biện...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input form */}
                <form onSubmit={handleSendMessage} className="border-t border-gray-100 pt-4 flex items-center gap-3 shrink-0">
                  <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 text-gray-600 flex items-center justify-center font-bold text-sm shrink-0 uppercase">
                    {user?.name ? user.name[0] : "U"}
                  </div>
                  <input
                    type="text"
                    placeholder={sendingMsg ? "AI đang suy nghĩ..." : "Nhập lập luận hoặc luận điểm bảo vệ ý kiến của đồng chí..."}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={sendingMsg || loadingChat}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:border-red-800 focus:ring-1 focus:ring-red-800 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={sendingMsg || loadingChat || !inputValue.trim()}
                    className="bg-red-800 hover:bg-red-950 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md shrink-0 flex items-center gap-1 disabled:opacity-50 font-bold"
                  >
                    <span className="material-symbols-outlined text-sm">send</span>
                    Tranh biện
                  </button>
                </form>
              </div>

              {/* Right sidebar info */}
              <div className="space-y-6">
                {/* Context analysis panel */}
                <div className="bg-blue-50/70 p-6 rounded-2xl shadow-md border-l-4 border-amber-500 text-left space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-650 font-bold">
                      psychology
                    </span>
                    <h3 className="font-bold text-base text-gray-900">
                      Lăng kính Socratic AI
                    </h3>
                  </div>

                  {debateType === "topic" ? (
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">
                          Kịch bản tranh luận
                        </h4>
                        <p className="text-gray-800 text-sm font-bold">
                          {activeTopic ? activeTopic.title : "Chủ đề Socratic"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">
                          Ý nghĩa cốt lõi
                        </h4>
                        <p className="text-gray-600 text-xs leading-relaxed">
                          {activeTopic ? activeTopic.description : "Đồng chí sẽ được AI thử thách các lập luận triết học."}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-blue-200/50">
                        <h4 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">
                          Lời khiêu chiến Socratic
                        </h4>
                        <p className="text-gray-755 italic text-xs leading-relaxed bg-white/60 p-2 rounded border border-blue-200">
                          "{activeTopic ? activeTopic.initialPrompt : "AI bắt đầu phản biện..."}"
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">
                          Bài lý thuyết học
                        </h4>
                        <p className="text-gray-800 text-sm font-bold">
                          {activeNode ? activeNode.title : "Khái niệm"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">
                          Định nghĩa nhanh (Quick Take)
                        </h4>
                        <p className="text-gray-600 text-xs leading-relaxed">
                          {activeNode ? activeNode.quickTake : "Quy luật biện chứng duy vật."}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-blue-200/50">
                        <h4 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">
                          Ý kiến tóm tắt cốt lõi
                        </h4>
                        <p className="text-gray-700 text-xs leading-relaxed">
                          {activeNode ? activeNode.summary : ""}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <h4 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2">
                      Lưu ý phản biện biện chứng
                    </h4>
                    <ul className="space-y-1.5 text-xs text-gray-700">
                      <li className="flex items-start gap-1">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>Hãy bám sát thực tiễn xã hội khách quan.</span>
                      </li>
                      <li className="flex items-start gap-1">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>Giải thích mối quan hệ biện chứng thay vì tuyệt đối hóa một mặt.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default DebateCorner;
