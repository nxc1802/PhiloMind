import React, { useState, useEffect, useMemo } from "react";
import { useToast } from "../../components/Toast";
import "./adventure.css";

export default function AdventureLessonPlayer({ 
  nodeDetails, 
  isRevisit, 
  onComplete, 
  onBackToMindmap 
}) {
  const [phase, setPhase] = useState(isRevisit ? "final" : "intro"); // "intro" | "contents" | "minigame" | "final"
  const [introIndex, setIntroIndex] = useState(0);
  const [activeConceptIdx, setActiveConceptIdx] = useState(0);
  const [conceptStep, setConceptStep] = useState("media"); // "media" | "question" | "explanation" | "summary"
  
  // Concept Questions States
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Minigame States
  const [matchingPairs, setMatchingPairs] = useState({}); // { leftId: rightId }
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matchingError, setMatchingError] = useState({}); // { leftId: true, rightId: true }
  const [matchingSuccessCount, setMatchingSuccessCount] = useState(0);

  // Minigame Type 1 (Single column sorting) states
  const [sortItems, setSortItems] = useState([]);
  const [sortSuccess, setSortSuccess] = useState(false);

  // Minigame Type 3 (Mindmap tree) states
  const [treeAnswers, setTreeAnswers] = useState({}); // { nodeId: optionId }
  const [selectedTreeOption, setSelectedTreeOption] = useState(null);

  const { showToast } = useToast();

  const storyIntro = nodeDetails.storyIntro;
  const lessonContents = nodeDetails.lessonContents || [];
  const minigame = nodeDetails.minigame;
  const finalSummary = nodeDetails.finalSummary;

  useEffect(() => {
    setPhase(isRevisit ? "final" : "intro");
    setIntroIndex(0);
    setActiveConceptIdx(0);
    setConceptStep("media");
  }, [nodeDetails?.id, isRevisit]);

  // Initialize Minigames when phase changes to "minigame"
  useEffect(() => {
    if (phase !== "minigame" || !minigame?.enable) return;

    if (minigame.type === "single_column_sorting") {
      const items = minigame.config?.items || [];
      const shuffled = [...items].sort(() => Math.random() - 0.5);
      setSortItems(shuffled);
      setSortSuccess(false);
    } else if (minigame.type === "matching_2_columns") {
      setMatchingPairs({});
      setSelectedLeft(null);
      setSelectedRight(null);
      setMatchingSuccessCount(0);
    } else if (minigame.type === "mindmap_tree") {
      setTreeAnswers({});
      setSelectedTreeOption(null);
    }
  }, [phase, minigame]);

  const activeDialog = storyIntro?.dialogs?.[introIndex];
  
  const handleNextDialog = () => {
    if (!storyIntro?.dialogs) return;
    if (introIndex < storyIntro.dialogs.length - 1) {
      setIntroIndex(prev => prev + 1);
    } else {
      setPhase("contents");
    }
  };

  const handleConceptMediaNext = () => {
    const currentConcept = lessonContents[activeConceptIdx];
    if (currentConcept?.questions && currentConcept.questions.length > 0) {
      setConceptStep("question");
      setActiveQuestionIdx(0);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setConceptStep("summary");
    }
  };

  const handleAnswerSelect = (answer) => {
    if (showExplanation) return;
    setSelectedAnswer(answer);
    setShowExplanation(true);
    
    if (answer.isCorrect) {
      showToast("Chính xác! Lập luận rất vững chắc.", "success");
    } else {
      showToast("Chưa chính xác. Hãy chiêm nghiệm thêm gợi ý.", "error");
    }
  };

  const handleQuestionNext = () => {
    const currentConcept = lessonContents[activeConceptIdx];
    const totalQuestions = currentConcept?.questions?.length || 0;
    
    if (selectedAnswer?.isCorrect) {
      if (activeQuestionIdx < totalQuestions - 1) {
        setActiveQuestionIdx(prev => prev + 1);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setConceptStep("question");
      } else {
        setConceptStep("summary");
      }
    } else {
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const handleConceptSummaryNext = () => {
    if (activeConceptIdx < lessonContents.length - 1) {
      setActiveConceptIdx(prev => prev + 1);
      setConceptStep("media");
    } else {
      if (minigame?.enable) {
        setPhase("minigame");
      } else {
        setPhase("final");
        if (onComplete) onComplete();
      }
    }
  };

  // --- MINIGAME 1: Single Column Sorting ---
  const moveItem = (index, direction) => {
    const newItems = [...sortItems];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    setSortItems(newItems);
  };

  const checkSortOrder = () => {
    const correctOrder = minigame.config?.correctOrder || [];
    let isCorrect = true;
    for (let i = 0; i < sortItems.length; i++) {
      if (sortItems[i].id !== correctOrder[i]) {
        isCorrect = false;
        break;
      }
    }

    if (isCorrect) {
      setSortSuccess(true);
      showToast("Sắp xếp chính xác! Trình tự logic rất chuẩn xác.", "success");
    } else {
      showToast("Thứ tự chưa hợp lý. Hãy thử sắp xếp lại.", "warning");
    }
  };

  // --- MINIGAME 2: Matching 2 Columns ---
  const handleSelectLeft = (leftItem) => {
    if (matchingPairs[leftItem.id]) return;
    setSelectedLeft(leftItem);
    if (selectedRight) checkMatch(leftItem, selectedRight);
  };

  const handleSelectRight = (rightItem) => {
    const isMatched = Object.values(matchingPairs).includes(rightItem.id);
    if (isMatched) return;
    setSelectedRight(rightItem);
    if (selectedLeft) checkMatch(selectedLeft, rightItem);
  };

  const checkMatch = (left, right) => {
    const correctPairs = minigame.config?.correctPairs || [];
    const isCorrect = correctPairs.some(p => p.leftId === left.id && p.rightId === right.id);

    if (isCorrect) {
      setMatchingPairs(prev => ({ ...prev, [left.id]: right.id }));
      setMatchingSuccessCount(prev => prev + 1);
      setSelectedLeft(null);
      setSelectedRight(null);
      showToast("Ghép nối chính xác!", "success");
    } else {
      setMatchingError({ [left.id]: true, [right.id]: true });
      showToast("Ghép nối chưa chính xác.", "error");
      setTimeout(() => {
        setMatchingError({});
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 1000);
    }
  };

  const isMatchingGameFinished = useMemo(() => {
    const leftColumn = minigame?.config?.leftColumn || [];
    return matchingSuccessCount === leftColumn.length && leftColumn.length > 0;
  }, [matchingSuccessCount, minigame]);

  // --- MINIGAME 3: MindMap Tree ---
  const handleTreeDrop = (nodeId) => {
    if (!selectedTreeOption) return;
    if (selectedTreeOption.matchNodeId === nodeId) {
      setTreeAnswers(prev => ({ ...prev, [nodeId]: selectedTreeOption }));
      setSelectedTreeOption(null);
      showToast("Đặt đúng vị trí nhánh sơ đồ!", "success");
    } else {
      showToast("Khái niệm này không thuộc nhánh này. Hãy thử lại.", "error");
      setSelectedTreeOption(null);
    }
  };

  const isTreeGameFinished = useMemo(() => {
    const nodes = minigame?.config?.treeNodes || [];
    const totalRequired = nodes.filter(n => n.parentId !== null).length;
    return Object.keys(treeAnswers).length === totalRequired && totalRequired > 0;
  }, [treeAnswers, minigame]);

  const handleMinigameComplete = () => {
    setPhase("final");
    if (onComplete) onComplete();
  };

  const getYoutubeId = (url) => {
    if (!url) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : "";
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative w-full min-h-[500px] flex flex-col text-slate-100 font-sans transition-all duration-500">
      {/* Header Tiến trình của Adventure Player */}
      <div className="px-6 py-4 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between shrink-0">
        <span className="text-sm font-extrabold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-300">
          Hành trình biện chứng
        </span>
        <div className="flex gap-2">
          <span className={`h-2.5 w-8 rounded-full transition-all duration-300 ${phase === "intro" ? "bg-red-600 scale-105" : "bg-slate-800"}`} />
          <span className={`h-2.5 w-8 rounded-full transition-all duration-300 ${phase === "contents" ? "bg-amber-500 scale-105" : "bg-slate-800"}`} />
          <span className={`h-2.5 w-8 rounded-full transition-all duration-300 ${phase === "minigame" ? "bg-indigo-500 scale-105" : "bg-slate-800"}`} />
          <span className={`h-2.5 w-8 rounded-full transition-all duration-300 ${phase === "final" ? "bg-emerald-500 scale-105" : "bg-slate-800"}`} />
        </div>
      </div>

      {/* Vùng Content chính */}
      <div className="flex-1 p-6 md:p-8 flex flex-col items-center justify-center relative min-h-[380px]">
        {/* Phase 1: Intro */}
        {phase === "intro" && (
          <div className="w-full max-w-2xl text-center space-y-6 animate-fadeIn">
            {storyIntro?.background && (
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none transition-opacity duration-700" 
                style={{ backgroundImage: `url(${storyIntro.background})` }}
              />
            )}
            
            <div className="flex justify-center mb-4">
              <div className="relative h-40 w-40 bg-gradient-to-tr from-red-800/30 to-amber-500/20 rounded-full border border-red-500/30 flex items-center justify-center overflow-hidden shadow-lg">
                {storyIntro?.character?.avatar ? (
                  <img src={storyIntro.character.avatar} alt="Character" className="h-full w-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-6xl text-red-500 animate-pulse">account_circle</span>
                )}
                <div className="absolute bottom-2 bg-red-900/90 text-white font-bold text-2xs px-2.5 py-0.5 rounded-full border border-red-800">
                  {storyIntro?.character?.name || "Người dẫn chuyện"}
                </div>
              </div>
            </div>

            <div className="bg-slate-950/90 border border-slate-850 rounded-2xl p-6 md:p-8 shadow-xl relative min-h-[120px] flex items-center justify-center">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rotate-45 bg-slate-950 border-t border-l border-slate-855" />
              <p className="text-base md:text-lg text-slate-200 leading-relaxed font-serif">
                {activeDialog?.text || "..."}
              </p>
            </div>

            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={handleNextDialog}
                className="bg-red-800 hover:bg-red-900 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-1.5"
              >
                <span>{introIndex < (storyIntro?.dialogs?.length || 0) - 1 ? "Tiếp theo" : (storyIntro?.nextButton?.text || "Bắt đầu bài học")}</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* Phase 2: Contents */}
        {phase === "contents" && (
          <div className="w-full max-w-3xl space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center text-xs text-slate-400 uppercase font-bold tracking-wider mb-2 border-b border-slate-800/60 pb-3">
              <span>Khái niệm {activeConceptIdx + 1}/{lessonContents.length}: {lessonContents[activeConceptIdx]?.title}</span>
              <span className="text-amber-550 font-bold bg-amber-955/40 px-2 py-0.5 rounded-md border border-amber-900/40">
                {conceptStep === "media" ? "1. Tình huống" : conceptStep === "question" ? "2. Trả lời" : "3. Đúc kết"}
              </span>
            </div>

            {/* Step: Media */}
            {conceptStep === "media" && (
              <div className="space-y-6">
                <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-800 bg-slate-950 flex items-center justify-center min-h-[300px]">
                  {lessonContents[activeConceptIdx]?.media?.type === "video" ? (
                    getYoutubeId(lessonContents[activeConceptIdx]?.media?.url) ? (
                      <iframe
                        title="concept-video"
                        width="100%"
                        height="360"
                        src={`https://www.youtube.com/embed/${getYoutubeId(lessonContents[activeConceptIdx]?.media?.url)}?autoplay=${lessonContents[activeConceptIdx]?.media?.autoplay ? 1 : 0}`}
                        frameBorder="0"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        className="w-full"
                      />
                    ) : (
                      <div className="text-center p-8 text-slate-500">
                        <span className="material-symbols-outlined text-6xl mb-2 text-slate-700">video_camera_back</span>
                        <p>Video tình huống chưa cấu hình</p>
                      </div>
                    )
                  ) : (
                    lessonContents[activeConceptIdx]?.media?.url ? (
                      <img 
                        src={lessonContents[activeConceptIdx].media.url} 
                        alt="Concept Media" 
                        className="max-h-[360px] object-contain rounded-xl"
                      />
                    ) : (
                      <div className="text-center p-8 text-slate-500">
                        <span className="material-symbols-outlined text-6xl mb-2 text-slate-700">image</span>
                        <p>Hình ảnh minh họa chưa được thiết lập</p>
                      </div>
                    )
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleConceptMediaNext}
                    className="bg-red-800 hover:bg-red-900 text-white px-8 py-3 rounded-xl font-bold transition-transform hover:scale-105 active:scale-95 flex items-center gap-1.5 shadow-md"
                  >
                    <span>Tiếp tục kiểm tra lý luận</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step: Questions */}
            {(conceptStep === "question" || conceptStep === "explanation") && (
              <div className="space-y-6 text-left">
                {(() => {
                  const currentQ = lessonContents[activeConceptIdx]?.questions?.[activeQuestionIdx];
                  if (!currentQ) return null;
                  return (
                    <div className="space-y-6">
                      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 shadow-md">
                        <label className="text-2xs uppercase text-slate-500 font-bold tracking-wider block mb-1">Câu hỏi trắc nghiệm kiểm tra {activeQuestionIdx + 1}:</label>
                        <h4 className="text-base md:text-lg font-bold leading-relaxed text-slate-200">
                          {currentQ.question}
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {currentQ.answers?.map((ans) => {
                          const isSelected = selectedAnswer?.answerId === ans.answerId;
                          
                          let btnClass = "bg-slate-955 border-slate-850 hover:border-slate-700 hover:bg-slate-900/60 text-slate-300";
                          if (isSelected) {
                            btnClass = ans.isCorrect 
                              ? "bg-emerald-950/40 border-emerald-500 text-emerald-300"
                              : "bg-red-950/40 border-red-500 text-red-300";
                          }

                          return (
                            <button
                              key={ans.answerId}
                              type="button"
                              onClick={() => handleAnswerSelect(ans)}
                              disabled={showExplanation && selectedAnswer?.answerId !== ans.answerId}
                              className={`w-full text-left p-4 rounded-xl border text-sm font-semibold transition-all duration-300 ${btnClass} disabled:opacity-50 flex items-center justify-between`}
                            >
                              <span>{ans.text}</span>
                              {isSelected && (
                                <span className="material-symbols-outlined text-base">
                                  {ans.isCorrect ? "check_circle" : "cancel"}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {showExplanation && selectedAnswer && (
                        <div className={`p-5 rounded-2xl border text-xs leading-relaxed transition-all duration-300 ${
                          selectedAnswer.isCorrect 
                            ? "bg-emerald-950/20 border-emerald-900/50 text-slate-350" 
                            : "bg-red-950/20 border-red-900/50 text-slate-350"
                        }`}>
                          <div className="flex items-center gap-1.5 font-bold mb-2">
                            <span className="material-symbols-outlined text-sm">
                              {selectedAnswer.isCorrect ? "verified" : "info"}
                            </span>
                            <span>{selectedAnswer.isCorrect ? "Giải thích khoa học:" : "Gợi ý lý luận:"}</span>
                          </div>
                          <p>{selectedAnswer.explanation || "Không có giải thích bổ sung."}</p>
                          
                          <div className="flex justify-end mt-4">
                            <button
                              type="button"
                              onClick={handleQuestionNext}
                              className={`px-6 py-2 rounded-lg font-bold text-xs transition-all ${
                                selectedAnswer.isCorrect 
                                  ? "bg-emerald-800 hover:bg-emerald-700 text-white" 
                                  : "bg-red-800 hover:bg-red-700 text-white"
                              }`}
                            >
                              {selectedAnswer.isCorrect ? "Tiếp tục" : "Lập luận lại"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Step: Summary */}
            {conceptStep === "summary" && (
              <div className="space-y-6 text-left">
                {(() => {
                  const summary = lessonContents[activeConceptIdx]?.conceptSummary;
                  return (
                    <div className="bg-gradient-to-br from-amber-950/20 to-orange-950/10 rounded-2xl border border-amber-900/40 p-6 md:p-8 space-y-4 shadow-xl">
                      <div className="flex items-center gap-2 border-b border-amber-900/45 pb-3">
                        <span className="material-symbols-outlined text-amber-500 text-2xl">menu_book</span>
                        <h3 className="text-lg md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-300">
                          {summary?.title || "Đúc kết khái niệm"}
                        </h3>
                      </div>
                      
                      {summary?.content && Array.isArray(summary.content) && summary.content.length > 0 ? (
                        <ul className="space-y-3.5 text-slate-300 text-sm md:text-base">
                          {summary.content.map((point, idx) => (
                            <li key={idx} className="flex items-start gap-2 leading-relaxed">
                              <span className="material-symbols-outlined text-amber-500 text-base shrink-0 pt-0.5">check_circle</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-400 italic text-sm">Chưa cập nhật lý thuyết tóm tắt cho khái niệm này.</p>
                      )}
                    </div>
                  );
                })()}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleConceptSummaryNext}
                    className="bg-red-800 hover:bg-red-900 text-white px-8 py-3 rounded-xl font-bold transition-transform hover:scale-105 active:scale-95 flex items-center gap-1.5 shadow-md"
                  >
                    <span>{activeConceptIdx < lessonContents.length - 1 ? "Khái niệm tiếp theo" : "Bắt đầu Minigame củng cố"}</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Phase 3: Minigames */}
        {phase === "minigame" && minigame?.enable && (
          <div className="w-full max-w-3xl space-y-6 animate-fadeIn">
            <div className="text-center space-y-2 mb-4 border-b border-slate-800 pb-4">
              <span className="text-2xs uppercase text-slate-400 font-extrabold tracking-widest bg-slate-950 px-3 py-1 rounded-full border border-slate-850">
                Giai đoạn 3: Trò chơi củng cố
              </span>
              <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-300 mt-2">
                {minigame.config?.title || "Minigame Tương Tác"}
              </h3>
            </div>

            {/* Minigame Type 1: single_column_sorting */}
            {minigame.type === "single_column_sorting" && (
              <div className="space-y-6">
                <p className="text-xs text-slate-400 italic text-center">
                  Nhấp vào mũi tên lên xuống để di chuyển các thẻ tri thức sao cho đúng thứ tự logic biện chứng.
                </p>

                <div className="space-y-2 max-w-md mx-auto">
                  {sortItems.map((item, index) => (
                    <div 
                      key={item.id} 
                      className={`flex justify-between items-center p-4 bg-slate-955 border rounded-xl text-sm font-semibold transition-all duration-300 ${
                        sortSuccess ? "border-emerald-500 bg-emerald-950/20 text-emerald-300" : "border-slate-800 text-slate-300"
                      }`}
                    >
                      <span className="truncate pr-4">{item.text}</span>
                      
                      {!sortSuccess && (
                        <div className="flex gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => moveItem(index, -1)}
                            disabled={index === 0}
                            className="p-1 hover:bg-slate-900 text-slate-400 hover:text-slate-200 rounded disabled:opacity-30 flex items-center"
                          >
                            <span className="material-symbols-outlined text-base font-bold">arrow_upward</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => moveItem(index, 1)}
                            disabled={index === sortItems.length - 1}
                            className="p-1 hover:bg-slate-900 text-slate-400 hover:text-slate-200 rounded disabled:opacity-30 flex items-center"
                          >
                            <span className="material-symbols-outlined text-base font-bold">arrow_downward</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-center pt-2">
                  {!sortSuccess ? (
                    <button
                      type="button"
                      onClick={checkSortOrder}
                      className="bg-red-800 hover:bg-red-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-transform hover:scale-105 active:scale-95"
                    >
                      Xác nhận Thứ tự
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleMinigameComplete}
                      className="bg-emerald-800 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-transform hover:scale-105"
                    >
                      Tiến tới Đúc kết bài học →
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Minigame Type 2: matching_2_columns */}
            {minigame.type === "matching_2_columns" && (
              <div className="space-y-6">
                <p className="text-xs text-slate-400 italic text-center">
                  Nhấp vào một ô ở cột trái (khái niệm), sau đó chọn định nghĩa đúng ở cột phải để ghép nối.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                  <div className="space-y-3.5 text-left">
                    <h4 className="text-xs uppercase text-slate-400 font-bold border-b border-slate-800 pb-2 mb-3">Cột Trái: Khái niệm</h4>
                    {minigame.config?.leftColumn?.map((item) => {
                      const isMatched = !!matchingPairs[item.id];
                      const isSelected = selectedLeft?.id === item.id;
                      const hasError = !!matchingError[item.id];
                      
                      let cardClass = "border-slate-800 bg-slate-950/40 text-slate-350 hover:border-slate-700";
                      if (isMatched) cardClass = "border-emerald-600 bg-emerald-950/20 text-emerald-450";
                      else if (isSelected) cardClass = "border-indigo-500 bg-indigo-950/20 text-indigo-400 scale-102";
                      else if (hasError) cardClass = "border-red-600 bg-red-950/30 text-red-400 animate-shake";

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectLeft(item)}
                          disabled={isMatched}
                          className={`w-full text-left p-4 rounded-xl border text-sm font-semibold transition-all duration-300 ${cardClass}`}
                        >
                          {item.text}
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-3.5 text-left">
                    <h4 className="text-xs uppercase text-slate-400 font-bold border-b border-slate-800 pb-2 mb-3">Cột Phải: Định nghĩa</h4>
                    {minigame.config?.rightColumn?.map((item) => {
                      const isMatched = Object.values(matchingPairs).includes(item.id);
                      const isSelected = selectedRight?.id === item.id;
                      const hasError = !!matchingError[item.id];

                      let cardClass = "border-slate-800 bg-slate-955 text-slate-350 hover:border-slate-700";
                      if (isMatched) cardClass = "border-emerald-600 bg-emerald-950/10 text-emerald-500 opacity-60";
                      else if (isSelected) cardClass = "border-indigo-500 bg-indigo-950/20 text-indigo-400 scale-102";
                      else if (hasError) cardClass = "border-red-600 bg-red-950/30 text-red-400 animate-shake";

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectRight(item)}
                          disabled={isMatched}
                          className={`w-full text-left p-4 rounded-xl border text-xs leading-relaxed transition-all duration-300 ${cardClass}`}
                        >
                          {item.text}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {isMatchingGameFinished && (
                  <div className="flex justify-center pt-4">
                    <button
                      type="button"
                      onClick={handleMinigameComplete}
                      className="bg-emerald-800 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-transform hover:scale-105"
                    >
                      Tiến tới Đúc kết bài học →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Minigame Type 3: mindmap_tree */}
            {minigame.type === "mindmap_tree" && (
              <div className="space-y-6">
                <p className="text-xs text-slate-400 italic text-center">
                  Nhấp vào một nhãn từ khóa ở dưới, sau đó click vào ô trống tương ứng trên nhánh sơ đồ tư duy để ghép.
                </p>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-wrap gap-2.5 justify-center max-w-2xl mx-auto">
                  {minigame.config?.options?.map((opt) => {
                    const isUsed = Object.values(treeAnswers).some(val => val.id === opt.id);
                    if (isUsed) return null;
                    const isSelected = selectedTreeOption?.id === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedTreeOption(opt)}
                        className={`px-4 py-2.5 rounded-lg border text-xs font-bold transition-all ${
                          isSelected ? "bg-indigo-650 border-indigo-500 text-white scale-105" : "bg-slate-900 border-slate-800 text-slate-350 hover:text-slate-100"
                        }`}
                      >
                        {opt.text}
                      </button>
                    );
                  })}
                </div>

                <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-855 max-w-2xl mx-auto flex flex-col items-center">
                  {minigame.config?.treeNodes?.map((node) => {
                    const isRoot = node.parentId === null;
                    const answer = treeAnswers[node.id];
                    
                    if (isRoot) {
                      return (
                        <div key={node.id} className="bg-red-950/40 border border-red-900 px-6 py-3 rounded-xl font-bold text-sm text-red-200 shadow mb-6">
                          {node.label}
                        </div>
                      );
                    }

                    return (
                      <div key={node.id} className="flex items-center gap-2 mb-3.5 last:mb-0 w-full justify-center">
                        <span className="text-slate-650">└─</span>
                        <div className="text-xs text-slate-400 font-bold bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg shrink-0">
                          {node.label}
                        </div>
                        <span className="text-slate-500 font-serif">→</span>

                        {answer ? (
                          <div className="bg-emerald-950/20 border border-emerald-600 text-emerald-300 px-4 py-2 rounded-lg text-xs font-bold shadow-md">
                            {answer.text}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleTreeDrop(node.id)}
                            className="bg-amber-955 border border-dashed border-amber-600/80 hover:bg-amber-900/10 text-amber-500 px-4 py-2 rounded-lg text-xs font-bold transition-colors"
                          >
                            [Thả khái niệm vào đây]
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {isTreeGameFinished && (
                  <div className="flex justify-center pt-4">
                    <button
                      type="button"
                      onClick={handleMinigameComplete}
                      className="bg-emerald-800 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-transform hover:scale-105"
                    >
                      Tiến tới Đúc kết bài học →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Phase 4: Final Summary */}
        {phase === "final" && (
          <div className="w-full max-w-2xl text-center space-y-6 py-6 animate-fadeIn">
            <div className="inline-flex items-center justify-center h-20 w-20 bg-emerald-950/40 border border-emerald-500 rounded-full text-emerald-400 mb-2 shadow-lg">
              <span className="material-symbols-outlined text-5xl animate-bounce">emoji_events</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-300 font-serif">
                {finalSummary?.title || "Chúc mừng bạn đã hoàn thành!"}
              </h3>
              <p className="text-slate-450 text-sm max-w-md mx-auto leading-relaxed">
                {finalSummary?.description || "Chúc mừng đồng chí đã hoàn thành xuất sắc toàn bộ bài học và kiểm tra kiến thức lý luận."}
              </p>
            </div>

            {finalSummary?.keyTakeaways && Array.isArray(finalSummary.keyTakeaways) && finalSummary.keyTakeaways.length > 0 && (
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-850 text-left space-y-3.5 max-w-lg mx-auto">
                <h4 className="text-xs uppercase text-slate-500 font-bold tracking-wider border-b border-slate-850/80 pb-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">auto_awesome</span> Những điều cốt lõi cần nhớ
                </h4>
                <ul className="space-y-3 text-slate-300 text-xs md:text-sm">
                  {finalSummary.keyTakeaways.map((takeaway, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-emerald-500 font-bold shrink-0">•</span>
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {finalSummary?.rewards && (
              <div className="bg-gradient-to-r from-amber-950/20 to-orange-950/20 rounded-2xl border border-amber-900/40 p-5 max-w-sm mx-auto flex items-center justify-around shadow-md">
                <div className="text-center">
                  <span className="text-[10px] font-bold uppercase text-slate-450 tracking-wider">XP nhận được</span>
                  <p className="text-2xl font-black text-amber-500 mt-0.5">+{finalSummary.rewards.xp || 50} XP</p>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div className="text-center">
                  <span className="text-[10px] font-bold uppercase text-slate-450 tracking-wider">Huy hiệu</span>
                  <p className="text-sm font-bold text-slate-200 mt-1 flex items-center gap-0.5 justify-center">
                    <span className="material-symbols-outlined text-amber-500 text-sm animate-pulse">stars</span>
                    {finalSummary.rewards.badge || "Thành viên tích cực"}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-3 pt-4">
              {finalSummary?.actions?.retryButton !== false && (
                <button
                  type="button"
                  onClick={() => {
                    setPhase("intro");
                    setIntroIndex(0);
                    setActiveConceptIdx(0);
                    setConceptStep("media");
                  }}
                  className="px-6 py-3 border border-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-950 hover:text-white transition-all text-sm flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">replay</span>
                  Học lại
                </button>
              )}
              
              <button
                type="button"
                onClick={onBackToMindmap}
                className="bg-red-800 hover:bg-red-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-transform hover:scale-105 text-sm"
              >
                Hoàn thành & Quay lại sơ đồ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
