import React, { useEffect, useMemo, useRef, Suspense, lazy } from "react";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import PageShell, { PageHero } from "../components/PageShell";
import OnboardingGuide from "../components/OnboardingGuide";
import LessonMindmap from "../components/LessonMindmap";
import { useToast } from "../components/Toast";
import { useAuth } from "../context/AuthContext";
import { useJourney } from "../hooks/useJourney";
import { useNodeDetails } from "../hooks/useNodeDetails";
import { useCompleteNodeMutation } from "../hooks/useMutations";
import { api } from "../services/api";
import { queryKeys } from "../services/queryKeys";

import { getTitleFromSlug, getSlugFromTitle } from "../utils/slug";
import { loadSettings } from "../utils/settings";
import { LessonSkeleton } from "./lesson/components/LessonSkeleton";
import { LessonSidebar } from "./lesson/components/LessonSidebar";

const FlowLessonPlayer = lazy(() => import("./lesson/flow/FlowLessonPlayer"));

const isLessonContentLocked = (node) =>
  !node?.contentReady ||
  (node.lessonStatus && node.lessonStatus !== "published");

const Lesson = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const lessonSlug = searchParams.get("lesson");
  const { showToast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const lessonContentRef = useRef(null);

  // Load course journey using query hook
  const { data: journeyData } = useJourney(user);
  const dbJourney = useMemo(() => journeyData?.journey || [], [journeyData]);

  // Match active lesson node
  const activeLesson = useMemo(() => {
    if (!lessonSlug || dbJourney.length === 0) return null;
    for (const chap of dbJourney) {
      if (chap.nodes) {
        const found = chap.nodes.find(
          (n) => getSlugFromTitle(n.title) === lessonSlug,
        );
        if (found) return found;
      }
    }
    return null;
  }, [lessonSlug, dbJourney]);

  // Node details query hook
  const { data: currentNodeDetails, isLoading: loadingNode } = useNodeDetails(
    activeLesson?.id,
    user?.id,
  );

  // Complete node mutation
  const completeNodeMutation = useCompleteNodeMutation();

  // Flattened syllabus list with real DB progress statuses
  const flatSyllabusItems = useMemo(() => {
    if (dbJourney.length === 0 || !activeLesson) {
      return [];
    }
    const currentChapterId = activeLesson.chapterId;
    const hasAnyProgress = dbJourney.some((chap) =>
      (chap.nodes || []).some(
        (n) => n.progress && n.progress.length > 0 && n.progress[0]?.status,
      ),
    );
    const settings = loadSettings();
    const unlockAll = settings.unlockAllLessons;
    let isFirstNode = true;
    const allItems = dbJourney.flatMap((chap) =>
      (chap.nodes || []).map((n) => {
        let status = "locked";
        const progressStatus = n.progress && n.progress[0]?.status;
        if (isLessonContentLocked(n)) {
          status = "content_locked";
        } else if (unlockAll) {
          status = progressStatus === "completed" ? "completed" : "active";
        } else {
          if (progressStatus === "completed") {
            status = "completed";
          } else if (
            progressStatus === "available" ||
            progressStatus === "in_progress"
          ) {
            status = "active";
          } else if (!hasAnyProgress && isFirstNode) {
            status = "active";
          }
        }
        isFirstNode = false;
        return {
          id: n.id,
          chapterId: chap.id,
          title: n.title,
          status: status,
        };
      }),
    );
    return allItems.filter((item) => item.chapterId === currentChapterId);
  }, [dbJourney, activeLesson]);

  // Real progress statistics
  const progressStats = useMemo(() => {
    const total = flatSyllabusItems.length;
    const completed = flatSyllabusItems.filter(
      (item) => item.status === "completed",
    ).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  }, [flatSyllabusItems]);

  // Progress mapping for the Mindmap
  const progressMap = useMemo(() => {
    const map = {};
    const hasAnyProgress = dbJourney.some((chap) =>
      (chap.nodes || []).some(
        (n) => n.progress && n.progress.length > 0 && n.progress[0]?.status,
      ),
    );
    const settings = loadSettings();
    const unlockAll = settings.unlockAllLessons;
    let isFirstNode = true;
    dbJourney.forEach((chap) => {
      (chap.nodes || []).forEach((n) => {
        let status = (n.progress && n.progress[0]?.status) || "locked";
        if (isLessonContentLocked(n)) {
          status = "content_locked";
        } else if (unlockAll) {
          if (status !== "completed") {
            status = "available";
          }
        } else {
          if (!hasAnyProgress && isFirstNode) {
            status = "available";
          }
        }
        map[n.title] = status;
        isFirstNode = false;
      });
    });
    return map;
  }, [dbJourney]);

  const allJourneyNodes = useMemo(() => {
    const mainChapters = dbJourney
      .filter((chap) => !chap.parentChapterId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
    const subChapters = dbJourney.filter((chap) => chap.parentChapterId);

    return mainChapters.flatMap((chapter) => {
      const children = subChapters
        .filter((sub) => sub.parentChapterId === chapter.id)
        .sort((a, b) => a.orderIndex - b.orderIndex);

      if (children.length > 0) {
        return children.flatMap((sub) => sub.nodes || []);
      }

      return chapter.nodes || [];
    });
  }, [dbJourney]);

  const nextPlayableLesson = useMemo(() => {
    if (!activeLesson) return null;
    const currentIndex = allJourneyNodes.findIndex(
      (node) => node.id === activeLesson.id,
    );
    if (currentIndex < 0) return null;
    return (
      allJourneyNodes
        .slice(currentIndex + 1)
        .find((node) => !isLessonContentLocked(node)) || null
    );
  }, [activeLesson, allJourneyNodes]);

  useEffect(() => {
    if (!user?.id || allJourneyNodes.length === 0) return;

    const activeIndex = activeLesson
      ? allJourneyNodes.findIndex((node) => node.id === activeLesson.id)
      : 0;
    const startIndex = Math.max(0, activeIndex - 1);
    const nodesToWarm = allJourneyNodes.slice(startIndex, startIndex + 5);

    nodesToWarm.forEach((node) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.courses.nodeDetails(node.id, user.id),
        queryFn: () => api.courses.getNodeDetails(node.id),
        staleTime: 1000 * 60 * 8,
      });
    });
  }, [activeLesson, allJourneyNodes, queryClient, user?.id]);

  // Transform dbJourney to hierarchical chapters/sections/lessons for Mindmap
  const mindmapChapters = useMemo(() => {
    if (!dbJourney || dbJourney.length === 0) return [];

    const mainChapters = dbJourney
      .filter((chap) => !chap.parentChapterId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
    const subChapters = dbJourney
      .filter((chap) => chap.parentChapterId)
      .sort((a, b) => a.orderIndex - b.orderIndex);

    // Updated color gradients to use custom cyan/blue theme scale
    const colors = [
      "from-primary-750 to-primary-900",
      "from-[#00677F] to-[#003543]",
      "from-[#00829F] to-[#004E60]",
      "from-[#009DC1] to-[#00677F]",
      "from-[#00BAE3] to-[#00829F]",
    ];

    return mainChapters.map((chap, idx) => {
      const sections = subChapters
        .filter((sub) => sub.parentChapterId === chap.id)
        .map((sub) => ({
          id: sub.id,
          title: sub.title,
          lessons: (sub.nodes || []).map((node) => ({
            id: node.id,
            title: node.title,
            slug: getSlugFromTitle(node.title),
          })),
        }));

      if (sections.length === 0 && chap.nodes && chap.nodes.length > 0) {
        sections.push({
          id: `${chap.id}-default`,
          title: "Bài học chi tiết",
          lessons: chap.nodes.map((node) => ({
            id: node.id,
            title: node.title,
            slug: getSlugFromTitle(node.title),
          })),
        });
      }

      return {
        id: chap.id,
        title: `Chương ${idx + 1}`,
        subtitle: chap.title,
        color: colors[idx % colors.length],
        sections,
      };
    });
  }, [dbJourney]);

  const handleOpenLesson = (slug) => {
    if (!slug) return;
    const title = getTitleFromSlug(slug);
    const status = progressMap[title] || "locked";

    if (status === "content_locked") {
      showToast(
        "Bài học này chưa có nội dung chính thức, đang được biên soạn.",
        "warning",
      );
      return;
    }

    if (status === "locked") {
      showToast(
        "Bài học này đang khóa. Đồng chí vui lòng hoàn thành bài học trước để tiếp tục!",
        "warning",
      );
      return;
    }

    setSearchParams({ lesson: slug });
  };

  const handleSyllabusClick = (item) => {
    if (item.status === "content_locked") {
      showToast(
        "Bài học này chưa có nội dung chính thức, đang được biên soạn.",
        "warning",
      );
      return;
    }
    if (item.status === "locked") {
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
          const resultNode = result?.nextNodeId
            ? allJourneyNodes.find((node) => node.id === result.nextNodeId)
            : null;
          const nextNode =
            resultNode && !isLessonContentLocked(resultNode)
              ? resultNode
              : nextPlayableLesson;

          if (nextNode) {
            const nextSlug = getSlugFromTitle(nextNode.title);
            const nextNodeId = nextNode.id;
            if (nextNodeId) {
              queryClient.prefetchQuery({
                queryKey: queryKeys.courses.nodeDetails(nextNodeId, user.id),
                queryFn: () => api.courses.getNodeDetails(nextNodeId),
                staleTime: 1000 * 60 * 8,
              });
            }
            setSearchParams({ lesson: nextSlug });
            showToast(
              `Chúc mừng! Bạn đã hoàn thành bài học và mở khóa bài tiếp theo: "${nextNode.title}"`,
              "success",
            );
            return;
          }

          setSearchParams({});
          showToast(
            "Xuất sắc! Bạn đã hoàn thành tất cả các bài học đã được seed trong khóa học này!",
            "success",
          );
        },
        onError: (err) => {
          console.error("Error completing lesson:", err);
          showToast("Có lỗi xảy ra khi cập nhật tiến độ bài học.", "error");
        },
      },
    );
  };

  const isRevisit = useMemo(() => {
    if (
      !currentNodeDetails ||
      !currentNodeDetails.progress ||
      currentNodeDetails.progress.length === 0
    ) {
      return false;
    }
    const prog = currentNodeDetails.progress[0];
    return prog.status === "completed" || prog.lessonCompleted === true;
  }, [currentNodeDetails]);

  return (
    <PageShell activeKey="lessons">
      <OnboardingGuide
        tabKey="lesson"
        steps={[
          "Tương tác với Sơ đồ (Mindmap): Giữ chuột trái và kéo để di chuyển bản đồ tư duy; cuộn chuột để thu phóng (zoom) phóng to/thu nhỏ các chương.",
          "Chọn Bài học (Concept Node): Click vào một ô trên sơ đồ bài học để mở bảng thông tin chi tiết ở cạnh phải màn hình.",
          'Bài học & Podcast AI: Trong bảng thông tin, bạn có thể chọn đọc lý thuyết tóm tắt, hoặc bật "Conversational Podcast" để nghe hai học giả thảo luận sinh động về chủ đề.',
          "Kiểm tra kiến thức: Hoàn thành các câu hỏi ôn tập nhanh cuối bài học để tích lũy điểm streak và mở khóa các bài học tiếp theo.",
        ]}
      />

      {!activeLesson && (
        <PageHero
          eyebrow="Khám phá Tri thức"
          icon="account_tree"
          title="Sơ đồ Bài học"
          subtitle="Hệ thống bài học Triết học Mác – Lênin được trực quan hóa bằng sơ đồ tư duy tương tác giúp bạn dễ dàng theo dõi và chinh phục lộ trình học tập."
        />
      )}

      <div className="px-6 md:px-12 py-8 max-w-6xl mx-auto text-left transition-colors duration-300 bg-slate-50 dark:bg-primary-950/10 rounded-3xl min-h-screen mt-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-primary-350 mb-6 flex-wrap">
          <span>Trang chủ</span>
          <span>›</span>
          <strong
            className={
              activeLesson
                ? "text-slate-650 dark:text-primary-300"
                : "text-primary-800 dark:text-primary-300"
            }
          >
            Bài học
          </strong>
          {activeLesson && (
            <>
              <span>›</span>
              <strong className="text-primary-800 dark:text-primary-300">
                {activeLesson.title}
              </strong>
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
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-850 dark:text-primary-300 dark:hover:text-primary-100 mb-5"
              >
                <span className="material-symbols-outlined text-base">
                  arrow_back
                </span>
                Quay lại sơ đồ bài học
              </button>

              <header className="mb-8 text-left">
                <div className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-900/35 border border-primary-150 dark:border-primary-800 text-primary-800 dark:text-primary-250 px-4 py-2 rounded-full text-xs font-bold mb-3 shadow-sm">
                  <span className="material-symbols-outlined text-base text-primary-600 dark:text-primary-300">
                    bookmark
                  </span>
                  Đang học: {activeLesson.title}
                </div>
                <h1 className="font-bold text-3xl md:text-4xl text-primary-800 dark:text-primary-100 mb-3">
                  {activeLesson.title}
                </h1>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-primary-100 dark:bg-primary-900/35 text-primary-750 dark:text-primary-300 px-3 py-1 rounded-full text-xs font-bold uppercase shadow-sm">
                    Triết học
                  </span>
                  <span className="bg-slate-150 dark:bg-primary-900/10 text-slate-700 dark:text-primary-350 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-sm">
                    <span className="material-symbols-outlined text-sm">
                      schedule
                    </span>
                    {currentNodeDetails?.timeToRead || "10 phút"}
                  </span>
                  <span className="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-xs font-bold uppercase shadow-sm">
                    Độ khó: {currentNodeDetails?.difficulty || "Trung bình"}
                  </span>
                </div>
              </header>

              {loadingNode ? (
                <LessonSkeleton />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <Suspense fallback={<LessonSkeleton />}>
                      <FlowLessonPlayer
                        nodeDetails={currentNodeDetails}
                        isRevisit={isRevisit}
                        onComplete={handleCompleteLesson}
                      />
                    </Suspense>
                  </div>

                  <div className="lg:col-span-1 flex flex-col gap-6 lg:sticky lg:top-20">
                    <LessonSidebar
                      flatSyllabusItems={flatSyllabusItems}
                      progressStats={progressStats}
                      lessonSlug={lessonSlug}
                      handleSyllabusClick={handleSyllabusClick}
                      currentNodeDetails={currentNodeDetails}
                    />
                  </div>
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
