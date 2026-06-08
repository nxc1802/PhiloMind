import React, { useMemo, useRef, Suspense, lazy } from "react";
import { useSearchParams } from "react-router-dom";
import PageShell from "../components/PageShell";
import LessonMindmap from "../components/LessonMindmap";
import { useToast } from "../components/Toast";
import { useAuth } from "../context/AuthContext";
import { useJourney } from "../hooks/useJourney";
import { useNodeDetails } from "../hooks/useNodeDetails";
import { useCompleteNodeMutation } from "../hooks/useMutations";

import { getTitleFromSlug, getSlugFromTitle } from "../utils/slug";
import { LessonSkeleton } from "./lesson/components/LessonSkeleton";
import { LessonSidebar } from "./lesson/components/LessonSidebar";

const ClassicLessonPlayer = lazy(() => import("./lesson/ClassicLessonPlayer"));
const AdventureLessonPlayer = lazy(() => import("./lesson/AdventureLessonPlayer"));

const Lesson = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const lessonSlug = searchParams.get("lesson");
  const { showToast } = useToast();
  const { user } = useAuth();

  const lessonContentRef = useRef(null);

  // Load course journey using query hook
  const { data: journeyData } = useJourney(user);
  const dbJourney = useMemo(() => journeyData?.journey || [], [journeyData]);


  // Match active lesson node
  const activeLesson = useMemo(() => {
    if (!lessonSlug || dbJourney.length === 0) return null;
    for (const chap of dbJourney) {
      if (chap.nodes) {
        const found = chap.nodes.find(n => getSlugFromTitle(n.title) === lessonSlug);
        if (found) return found;
      }
    }
    return null;
  }, [lessonSlug, dbJourney]);

  // Node details query hook
  const { data: currentNodeDetails, isLoading: loadingNode } = useNodeDetails(activeLesson?.id, user?.id);

  // Complete node mutation
  const completeNodeMutation = useCompleteNodeMutation();


  // Flattened syllabus list with real DB progress statuses
  const flatSyllabusItems = useMemo(() => {
    if (dbJourney.length === 0 || !activeLesson) {
      return [];
    }
    const currentChapterId = activeLesson.chapterId;
    const hasAnyProgress = dbJourney.some(chap =>
      (chap.nodes || []).some(n => n.progress && n.progress.length > 0 && n.progress[0]?.status)
    );
    let isFirstNode = true;
    const allItems = dbJourney.flatMap(chap => 
      (chap.nodes || []).map(n => {
        let status = 'locked';
        const progressStatus = n.progress && n.progress[0]?.status;
        if (progressStatus === 'completed') {
          status = 'completed';
        } else if (progressStatus === 'available' || progressStatus === 'in_progress') {
          status = 'active';
        } else if (!hasAnyProgress && isFirstNode) {
          status = 'active';
        }
        isFirstNode = false;
        return {
          id: n.id,
          chapterId: chap.id,
          title: n.title,
          status: status
        };
      })
    );
    return allItems.filter(item => item.chapterId === currentChapterId);
  }, [dbJourney, activeLesson]);

  // Real progress statistics
  const progressStats = useMemo(() => {
    const total = flatSyllabusItems.length;
    const completed = flatSyllabusItems.filter(item => item.status === 'completed').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  }, [flatSyllabusItems]);

  // Progress mapping for the Mindmap
  const progressMap = useMemo(() => {
    const map = {};
    const hasAnyProgress = dbJourney.some(chap =>
      (chap.nodes || []).some(n => n.progress && n.progress.length > 0 && n.progress[0]?.status)
    );
    let isFirstNode = true;
    dbJourney.forEach(chap => {
      (chap.nodes || []).forEach(n => {
        let status = (n.progress && n.progress[0]?.status) || 'locked';
        if (!hasAnyProgress && isFirstNode) {
          status = 'available';
        }
        map[n.title] = status;
        isFirstNode = false;
      });
    });
    return map;
  }, [dbJourney]);

  // Transform dbJourney to hierarchical chapters/sections/lessons for Mindmap
  const mindmapChapters = useMemo(() => {
    if (!dbJourney || dbJourney.length === 0) return [];
    
    const mainChapters = dbJourney.filter(chap => !chap.parentChapterId);
    const subChapters = dbJourney.filter(chap => chap.parentChapterId);
    
    const colors = [
      "from-red-700 to-red-900",
      "from-amber-700 to-amber-900",
      "from-emerald-700 to-emerald-900",
      "from-blue-700 to-blue-900",
      "from-purple-700 to-purple-900"
    ];

    return mainChapters.map((chap, idx) => {
      const sections = subChapters
        .filter(sub => sub.parentChapterId === chap.id)
        .map(sub => ({
          id: sub.id,
          title: sub.title,
          lessons: (sub.nodes || []).map(node => ({
            id: node.id,
            title: node.title,
            slug: getSlugFromTitle(node.title),
          }))
        }));
      
      if (sections.length === 0 && chap.nodes && chap.nodes.length > 0) {
        sections.push({
          id: `${chap.id}-default`,
          title: "Bài học chi tiết",
          lessons: chap.nodes.map(node => ({
            id: node.id,
            title: node.title,
            slug: getSlugFromTitle(node.title),
          }))
        });
      }

      return {
        id: chap.id,
        title: `Chương ${idx + 1}`,
        subtitle: chap.title,
        color: colors[idx % colors.length],
        sections
      };
    });
  }, [dbJourney]);

  const handleOpenLesson = (slug) => {
    if (!slug) return;
    const title = getTitleFromSlug(slug);
    const status = progressMap[title] || 'locked';
    
    if (status === 'locked') {
      showToast("Bài học này đang khóa. Đồng chí vui lòng hoàn thành bài học trước để tiếp tục!", "warning");
      return;
    }

    setSearchParams({ lesson: slug });
  };

  const handleSyllabusClick = (item) => {
    if (item.status === 'locked') {
      showToast("Bài học này đang bị khóa!", "warning");
      return;
    }
    const slug = getSlugFromTitle(item.title);
    handleOpenLesson(slug);
  };

  const handleBackToMindmap = () => setSearchParams({});

  // Unified server-side lesson complete / next lesson auto-unlocking
  const handleCompleteLesson = async () => {
    if (!user || !currentNodeDetails) return;

    completeNodeMutation.mutate(
      { nodeId: currentNodeDetails.id, userId: user.id },
      {
        onSuccess: (result) => {
          if (result && result.nextNodeTitle) {
            showToast(`Chúc mừng! Bạn đã hoàn thành bài học và mở khóa bài tiếp theo: "${result.nextNodeTitle}"`, "success");
          } else {
            showToast("Xuất sắc! Bạn đã hoàn thành tất cả các bài học trong khóa học này!", "success");
          }
        },
        onError: (err) => {
          console.error("Error completing lesson:", err);
          showToast("Có lỗi xảy ra khi cập nhật tiến độ bài học.", "error");
        }
      }
    );
  };

  const isRevisit = useMemo(() => {
    if (!currentNodeDetails || !currentNodeDetails.progress || currentNodeDetails.progress.length === 0) {
      return false;
    }
    const prog = currentNodeDetails.progress[0];
    return prog.status === 'completed' || prog.lessonCompleted === true;
  }, [currentNodeDetails]);

  return (
    <PageShell activeKey="lessons">
      <div className="px-6 md:px-12 py-8 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
          <span>Trang chủ</span>
          <span>›</span>
          <strong className={activeLesson ? "" : "text-red-800"}>
            Bài học
          </strong>
          {activeLesson && (
            <>
              <span>›</span>
              <strong className="text-red-800">{activeLesson.title}</strong>
            </>
          )}
        </div>

        {/* Mindmap view if no active lesson */}
        {!activeLesson && (
          <div className="mb-10">
            <LessonMindmap
              chapters={mindmapChapters}
              activeSlug={lessonSlug}
              onOpenLesson={handleOpenLesson}
              progressMap={progressMap}
            />
          </div>
        )}

        {/* Lesson player viewport */}
        <div ref={lessonContentRef} className="scroll-mt-20">
          {activeLesson ? (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleBackToMindmap}
                className="inline-flex items-center gap-1 text-sm font-semibold text-red-800 hover:text-red-900 mb-5"
              >
                <span className="material-symbols-outlined text-base">
                  arrow_back
                </span>
                Quay lại sơ đồ bài học
              </button>
              <header className="mb-8 text-left">
                <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-full text-xs font-bold mb-3">
                  <span className="material-symbols-outlined text-base">
                    bookmark
                  </span>
                  Đang học: {activeLesson.title}
                </div>
                <h1 className="font-bold text-3xl md:text-4xl text-red-900 mb-3">
                  {activeLesson.title}
                </h1>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold uppercase">
                    Triết học
                  </span>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      schedule
                    </span>
                    {currentNodeDetails?.timeToRead || "10 phút"}
                  </span>
                  <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold uppercase">
                    Độ khó: {currentNodeDetails?.difficulty || "Medium"}
                  </span>
                </div>
              </header>

              {loadingNode ? (
                <LessonSkeleton />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <Suspense fallback={<LessonSkeleton />}>
                      {currentNodeDetails?.lessonType === 'adventure' ? (
                        <AdventureLessonPlayer 
                          nodeDetails={currentNodeDetails} 
                          isRevisit={isRevisit}
                          onComplete={handleCompleteLesson} 
                          onBackToMindmap={handleBackToMindmap}
                        />
                      ) : (
                        <ClassicLessonPlayer 
                          nodeDetails={currentNodeDetails} 
                          isRevisit={isRevisit}
                          onComplete={handleCompleteLesson} 
                          onBackToMindmap={handleBackToMindmap}
                        />
                      )}
                    </Suspense>
                  </div>

                  <LessonSidebar 
                    flatSyllabusItems={flatSyllabusItems}
                    progressStats={progressStats}
                    lessonSlug={lessonSlug}
                    handleSyllabusClick={handleSyllabusClick}
                    currentNodeDetails={currentNodeDetails}
                  />
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </PageShell>
  );
};

export default Lesson;
