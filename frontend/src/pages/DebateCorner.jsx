import React, { useState, useEffect, useRef, useMemo } from "react";
import PageShell, { PageHero } from "../components/PageShell";
import OnboardingGuide from "../components/OnboardingGuide";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { useQuery } from "@tanstack/react-query";
import { useJourney } from "../hooks/useJourney";
import { queryKeys } from "../services/queryKeys";
import {
  useSendDebateMessageMutation,
  useSendTopicDebateMessageMutation,
} from "../hooks/useMutations";

const DebateCorner = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Dual Debate Mode: 'topic' (Socratic topics) or 'concept' (lesson nodes)
  const [debateType, setDebateType] = useState("topic");
  const [activeDebate, setActiveDebate] = useState(null); // { type: 'topic' | 'concept', id: string } | null

  const [selectedNodeId, setSelectedNodeId] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");

  const [inputValue, setInputValue] = useState("");
  const chatEndRef = useRef(null);

  // Fetch course journey to get real nodes
  const { data: journeyData, isLoading: loadingJourney } = useJourney(user);
  const nodes = useMemo(() => {
    return journeyData?.journey.flatMap((c) => c.nodes || []) || [];
  }, [journeyData]);

  // Fetch Socratic debate topics
  const { data: topicsData, isLoading: loadingTopics } = useQuery({
    queryKey: queryKeys.debates.topics(),
    queryFn: () => api.debates.topics.list(),
    staleTime: 1000 * 60 * 10,
  });
  const topics = useMemo(() => topicsData || [], [topicsData]);

  const loadingLists = loadingJourney || loadingTopics;

  // Auto-select defaults
  useEffect(() => {
    if (topics.length > 0 && !selectedTopicId) {
      setSelectedTopicId(topics[0].id);
    }
  }, [topics, selectedTopicId]);

  useEffect(() => {
    if (nodes.length > 0 && !selectedNodeId) {
      const materialNode = nodes.find((n) => n.title.includes("vật chất"));
      setSelectedNodeId(materialNode ? materialNode.id : nodes[0].id);
    }
  }, [nodes, selectedNodeId]);

  // Fetch active debate session transcript
  const activeDebateId =
    debateType === "topic" ? selectedTopicId : selectedNodeId;

  const { data: debateSession, isLoading: loadingChat } = useQuery({
    queryKey: queryKeys.debates.transcript(
      activeDebateId,
      user?.id,
      debateType,
    ),
    queryFn: () => {
      if (debateType === "topic") {
        return api.debates.topics.getTranscript(selectedTopicId, user.id);
      } else {
        return api.debates.getTranscript(selectedNodeId, user.id);
      }
    },
    enabled: !!user?.id && !!activeDebateId,
    staleTime: 1000 * 60 * 5,
  });

  const messages = useMemo(
    () => debateSession?.transcript || [],
    [debateSession],
  );

  // Scroll to bottom smoothly
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message mutations
  const sendDebateMsgMutation = useSendDebateMessageMutation();
  const sendTopicDebateMsgMutation = useSendTopicDebateMessageMutation();
  const sendingMsg =
    sendDebateMsgMutation.isPending || sendTopicDebateMsgMutation.isPending;

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !user || sendingMsg) return;

    const userMessage = inputValue.trim();
    setInputValue("");

    if (debateType === "topic") {
      sendTopicDebateMsgMutation.mutate(
        { topicId: selectedTopicId, userId: user.id, message: userMessage },
        {
          onSuccess: () => {
            showToast("Gửi phản biện biện chứng thành công!", "success");
          },
          onError: (err) => {
            showToast("Lỗi gửi lập luận: " + err.message, "error");
          },
        },
      );
    } else {
      sendDebateMsgMutation.mutate(
        { nodeId: selectedNodeId, userId: user.id, message: userMessage },
        {
          onSuccess: () => {
            showToast("Gửi phản biện biện chứng thành công!", "success");
          },
          onError: (err) => {
            showToast("Lỗi gửi lập luận: " + err.message, "error");
          },
        },
      );
    }
  };

  // Compute currently selected information
  const activeTopic = useMemo(() => {
    return topics.find((t) => t.id === selectedTopicId);
  }, [topics, selectedTopicId]);

  const activeNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId);
  }, [nodes, selectedNodeId]);

  return (
    <PageShell activeKey="debate">
      <OnboardingGuide
        tabKey="debate"
        steps={[
          "Tranh biện Socratic: Nơi phản biện tư duy trực tiếp với AI. AI đóng vai trò người phản biện sắc bén để thử thách độ chặt chẽ trong luận điểm của bạn.",
          'Chọn chủ đề: Chọn một chủ đề tranh biện sẵn có như "Vấn đề cơ bản của triết học" hay "Ý thức quyết định vật chất?".',
          'Luận điểm phản hồi: Đưa ra câu trả lời chứa đựng lập trường, lý lẽ cá nhân rõ ràng thay vì chỉ hỏi đáp thông thường (ví dụ: "Tôi tin là vật chất quyết định ý thức vì...").',
          "Quy tắc: Cố gắng bảo vệ lập luận của bạn trước các câu hỏi truy vấn sâu mà không tự mâu thuẫn với chính mình.",
        ]}
      />
      <PageHero
        eyebrow="Đấu trường Socratic AI phản biện liên tục"
        icon="diversity_3"
        title={
          <>
            Tranh biện Triết học Biện chứng
            {activeDebate && (
              <span className="block text-2xl md:text-3xl mt-2 opacity-95 text-primary-100">
                {activeDebate.type === "topic"
                  ? activeTopic
                    ? `Kịch bản: ${activeTopic.title}`
                    : "Tranh luận Kịch bản"
                  : activeNode
                    ? `Khái niệm: ${activeNode.title}`
                    : "Tranh luận Bài học"}
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
              <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-primary-950/40 rounded-3xl border border-slate-200 dark:border-primary-800">
                <button
                  type="button"
                  onClick={() => setDebateType("topic")}
                  className={`px-5 py-2.5 rounded-3xl text-sm font-bold transition-all ${
                    debateType === "topic"
                      ? "bg-white text-primary-650 shadow-sm dark:bg-surface-dark-elevated dark:text-primary-200"
                      : "text-gray-600 hover:text-gray-800 dark:text-primary-350 dark:hover:text-primary-100"
                  }`}
                >
                  🎭 Kịch bản có sẵn
                </button>
                <button
                  type="button"
                  onClick={() => setDebateType("concept")}
                  className={`px-5 py-2.5 rounded-3xl text-sm font-bold transition-all ${
                    debateType === "concept"
                      ? "bg-white text-primary-650 shadow-sm dark:bg-surface-dark-elevated dark:text-primary-200"
                      : "text-gray-600 hover:text-gray-800 dark:text-primary-350 dark:hover:text-primary-100"
                  }`}
                >
                  📚 Khái niệm bài học
                </button>
              </div>
            </div>

            {loadingLists ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#002b37] rounded-3xl border border-slate-200 dark:border-primary-850 shadow-md">
                <span className="material-symbols-outlined animate-spin text-5xl text-primary-650 dark:text-primary-300">
                  sync
                </span>
                <p className="text-gray-500 mt-4 font-semibold dark:text-primary-250">
                  Đang tải danh sách đấu trường tranh biện...
                </p>
              </div>
            ) : debateType === "topic" ? (
              topics.length === 0 ? (
                <div className="bg-white p-12 text-center border border-dashed border-gray-300 rounded-3xl dark:border-primary-850 dark:bg-[#002b37]">
                  <span className="material-symbols-outlined text-5xl text-gray-300">
                    chat_bubble_outline
                  </span>
                  <p className="text-gray-500 mt-2 font-semibold dark:text-primary-250">
                    Chưa có kịch bản tranh luận nào trên DB.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {topics.map((t) => (
                    <div
                      key={t.id}
                      className="bg-white dark:bg-[#002b37] p-6 rounded-3xl shadow-md border border-slate-200 dark:border-primary-850 hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="material-symbols-outlined text-primary-650 dark:text-primary-300">
                            theater_comedy
                          </span>
                          <span className="text-xs uppercase tracking-wider text-gray-500 font-bold dark:text-primary-350">
                            Kịch bản Socratic
                          </span>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2 leading-snug dark:text-primary-100">
                          {t.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed dark:text-primary-250">
                          {t.description}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedTopicId(t.id);
                          setActiveDebate({ type: "topic", id: t.id });
                        }}
                        className="w-full bg-primary-600 hover:bg-primary-900 text-white font-bold py-3 rounded-3xl shadow-md transition-all flex items-center justify-center gap-1 mt-2"
                      >
                        <span className="material-symbols-outlined text-sm font-bold">
                          forum
                        </span>
                        Bắt đầu phản biện
                      </button>
                    </div>
                  ))}
                </div>
              )
            ) : nodes.length === 0 ? (
              <div className="bg-white p-12 text-center border border-dashed border-gray-300 rounded-3xl dark:border-primary-850 dark:bg-[#002b37]">
                <span className="material-symbols-outlined text-5xl text-gray-300">
                  menu_book
                </span>
                <p className="text-gray-500 mt-2 font-semibold dark:text-primary-250">
                  Chưa có khái niệm bài học nào được upload.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nodes.map((n) => (
                  <div
                    key={n.id}
                    className="bg-white dark:bg-[#002b37] p-6 rounded-3xl shadow-md border border-slate-200 dark:border-primary-850 hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-amber-600">
                          menu_book
                        </span>
                        <span className="text-xs uppercase tracking-wider text-gray-500 font-bold dark:text-primary-350">
                          Theo Bài Học
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 mb-2 leading-snug dark:text-primary-100">
                        {n.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed dark:text-primary-250">
                        {n.quickTake}
                      </p>
                      <div className="inline-block bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase mb-4 dark:bg-amber-950/35 dark:text-amber-100">
                        Độ khó: {n.difficulty || "Medium"}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedNodeId(n.id);
                        setActiveDebate({ type: "concept", id: n.id });
                      }}
                      className="w-full bg-primary-600 hover:bg-primary-900 text-white font-bold py-3 rounded-3xl shadow-md transition-all flex items-center justify-center gap-1 mt-2"
                    >
                      <span className="material-symbols-outlined text-sm font-bold">
                        forum
                      </span>
                      Tranh luận bài học
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // ==================== INTERACTIVE CHATBOT VIEW ====================
          <div>
            <div className="mb-6">
              <button
                type="button"
                onClick={() => setActiveDebate(null)}
                className="inline-flex items-center gap-1 text-sm font-bold text-primary-650 dark:text-primary-300 hover:text-primary-850 dark:text-primary-100 transition-colors"
              >
                <span className="material-symbols-outlined text-base">
                  arrow_back
                </span>
                Quay lại danh sách kịch bản
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Interactive Chat Panel */}
              <div className="lg:col-span-2 bg-white dark:bg-[#002b37] rounded-3xl shadow-md border border-gray-200 dark:border-primary-850 p-6 flex flex-col h-[580px]">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-primary-850 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-650 dark:text-primary-300">
                      smart_toy
                    </span>
                    <h3 className="font-bold text-base text-gray-900 dark:text-primary-100">
                      Đối thoại Socratic với AI triết học
                    </h3>
                  </div>
                  <span className="bg-primary-50 dark:bg-primary-900/35 text-primary-650 dark:text-primary-300 text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1 uppercase tracking-wider">
                    <span className="inline-block w-1.5 h-1.5 bg-primary-500 rounded-full animate-ping" />
                    Live Session
                  </span>
                </div>

                {/* Chat Messages scroll area */}
                <div className="flex-1 overflow-y-auto py-4 px-2 space-y-4">
                  {loadingChat ? (
                    <div className="h-full flex items-center justify-center flex-col">
                      <span className="material-symbols-outlined animate-spin text-primary-650 dark:text-primary-300 text-4xl">
                        sync
                      </span>
                      <p className="text-gray-500 dark:text-primary-250 mt-2 text-sm font-semibold">
                        Đang tổng hợp lịch sử đối thoại phản biện...
                      </p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400 dark:text-primary-350 text-sm italic">
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
                            className={`h-9 w-9 rounded-3xl flex items-center justify-center text-white font-bold text-xs shrink-0 ${
                              isAi
                                ? "bg-primary-600 shadow-sm"
                                : "bg-indigo-900 shadow-sm"
                            }`}
                          >
                            {isAi ? "AI" : "SV"}
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 dark:text-primary-400 font-bold block mb-1">
                              {isAi
                                ? "Socratic AI (Phản biện)"
                                : user?.name || "Sinh viên"}
                            </span>
                            <div
                              className={`p-3.5 rounded-3xl shadow-sm text-sm leading-relaxed ${
                                isAi
                                  ? "bg-gray-100 text-gray-800 border border-gray-200 rounded-tl-sm dark:border-primary-800 dark:bg-primary-950/40 dark:text-primary-100"
                                  : "bg-primary-600 text-white border border-primary-700 rounded-tr-sm"
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
                      <div className="h-9 w-9 rounded-3xl bg-primary-600 text-white flex items-center justify-center font-bold text-xs animate-pulse">
                        AI
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 dark:text-primary-400 font-bold block mb-1">
                          Socratic AI (Phản biện)
                        </span>
                        <div className="bg-gray-100 text-gray-800 border border-gray-200 p-3.5 rounded-3xl shadow-sm text-sm flex items-center gap-2 dark:border-primary-800 dark:bg-primary-950/40 dark:text-primary-100">
                          <span className="material-symbols-outlined animate-spin text-sm text-primary-650 dark:text-primary-300">
                            sync
                          </span>
                          <span className="italic text-gray-500 text-xs dark:text-primary-250">
                            AI đang phân tích lập luận biện chứng của đồng chí
                            để phản biện...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input form */}
                <form
                  onSubmit={handleSendMessage}
                  className="border-t border-gray-100 dark:border-primary-850 pt-4 flex items-center gap-2 sm:gap-3 shrink-0"
                >
                  <div className="hidden sm:flex h-10 w-10 rounded-full bg-slate-100 dark:bg-primary-950/50 border border-slate-200 dark:border-primary-850 text-gray-600 dark:text-primary-200 items-center justify-center font-bold text-sm shrink-0 uppercase">
                    {user?.name ? user.name[0] : "U"}
                  </div>
                  <input
                    type="text"
                    placeholder={
                      sendingMsg ? "AI đang suy nghĩ..." : "Nhập lập luận..."
                    }
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={sendingMsg || loadingChat}
                    className="flex-1 bg-slate-50 dark:bg-[#001F28] border border-slate-200 dark:border-primary-850 rounded-3xl px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-800 dark:text-primary-100 placeholder:text-gray-400 dark:placeholder:text-primary-500 focus:border-primary-800 focus:ring-1 focus:ring-primary-600 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={sendingMsg || loadingChat || !inputValue.trim()}
                    className="bg-primary-600 hover:bg-primary-900 text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-3xl transition-all shadow-md shrink-0 flex items-center gap-1 disabled:opacity-50 font-bold text-xs sm:text-sm"
                  >
                    <span className="material-symbols-outlined text-sm">
                      send
                    </span>
                    <span className="hidden sm:inline">Tranh biện</span>
                  </button>
                </form>
              </div>

              {/* Right sidebar info */}
              <div className="space-y-6">
                {/* Context analysis panel */}
                <div className="bg-blue-50/70 dark:bg-primary-950/35 p-6 rounded-3xl shadow-md border-l-4 border-amber-500 text-left space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-650 font-bold">
                      psychology
                    </span>
                    <h3 className="font-bold text-base text-gray-900 dark:text-primary-100">
                      Lăng kính Socratic AI
                    </h3>
                  </div>

                  {debateType === "topic" ? (
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-primary-350 font-bold mb-1">
                          Kịch bản tranh luận
                        </h4>
                        <p className="text-gray-800 dark:text-primary-100 text-sm font-bold">
                          {activeTopic ? activeTopic.title : "Chủ đề Socratic"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-primary-350 font-bold mb-1">
                          Ý nghĩa cốt lõi
                        </h4>
                        <p className="text-gray-600 dark:text-primary-250 text-xs leading-relaxed">
                          {activeTopic
                            ? activeTopic.description
                            : "Đồng chí sẽ được AI thử thách các lập luận triết học."}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-blue-200/50 dark:border-primary-850">
                        <h4 className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-primary-350 font-bold mb-1">
                          Lời khiêu chiến Socratic
                        </h4>
                        <p className="text-gray-755 dark:text-primary-150 italic text-xs leading-relaxed bg-white/60 dark:bg-primary-950/50 p-2 rounded border border-blue-200 dark:border-primary-800">
                          "
                          {activeTopic
                            ? activeTopic.initialPrompt
                            : "AI bắt đầu phản biện..."}
                          "
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-primary-350 font-bold mb-1">
                          Bài lý thuyết học
                        </h4>
                        <p className="text-gray-800 dark:text-primary-100 text-sm font-bold">
                          {activeNode ? activeNode.title : "Khái niệm"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-primary-350 font-bold mb-1">
                          Định nghĩa nhanh (Quick Take)
                        </h4>
                        <p className="text-gray-600 dark:text-primary-250 text-xs leading-relaxed">
                          {activeNode
                            ? activeNode.quickTake
                            : "Quy luật biện chứng duy vật."}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-blue-200/50 dark:border-primary-850">
                        <h4 className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-primary-350 font-bold mb-1">
                          Ý kiến tóm tắt cốt lõi
                        </h4>
                        <p className="text-gray-700 dark:text-primary-200 text-xs leading-relaxed">
                          {activeNode ? activeNode.summary : ""}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-blue-200 dark:border-primary-850">
                    <h4 className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-primary-350 font-bold mb-2">
                      Lưu ý phản biện biện chứng
                    </h4>
                    <ul className="space-y-1.5 text-xs text-gray-700 dark:text-primary-200">
                      <li className="flex items-start gap-1">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>Hãy bám sát thực tiễn xã hội khách quan.</span>
                      </li>
                      <li className="flex items-start gap-1">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>
                          Giải thích mối quan hệ biện chứng thay vì tuyệt đối
                          hóa một mặt.
                        </span>
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
