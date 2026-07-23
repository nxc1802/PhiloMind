import React, { useEffect, useMemo, Suspense, lazy } from "react";
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

  const activeLessonLocked = isLessonContentLocked(activeLesson);

  // Node details query hook
  const { data: currentNodeDetails, isLoading: loadingNode } = useNodeDetails(
    activeLesson && !activeLessonLocked ? activeLesson.id : undefined,
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
        map[n.id] = status;
        map[getSlugFromTitle(n.title)] = status;
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
    const nodesToWarm = allJourneyNodes
      .slice(startIndex, startIndex + 5)
      .filter((node) => !isLessonContentLocked(node));

    nodesToWarm.forEach((node) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.courses.nodeDetails(node.id, user.id),
        queryFn: () => api.courses.getNodeDetails(node.id),
        staleTime: 1000 * 60 * 8,
      });
    });
  }, [activeLesson, allJourneyNodes, queryClient, user?.id]);

  // Helper to clean title prefixes like "I. ", "1. ", "a. ", "b. ", "a) ", "- "
  const cleanTitle = (title) => {
    if (!title) return "";
    return title
      .replace(/^(I|II|III|IV|V|VI|VII|VIII|IX|X)\.\s+/i, "")
      .replace(/^([0-9]+\.|[a-zđ]\.|\b[a-zđ]\))\s+/i, "")
      .replace(/^[-*•]\s+/, "")
      .trim();
  };

  // Helper to extract lower-level sub-topics from node
  const extractSubTopics = (node) => {
    if (!node) return [];
    if (node.subTopics && Array.isArray(node.subTopics) && node.subTopics.length > 0) {
      return node.subTopics.map(cleanTitle);
    }

    const subTopics = [];
    if (node.originalText) {
      const lines = node.originalText.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (/^[a-zđ]\)\s+/i.test(trimmed)) {
          subTopics.push(cleanTitle(trimmed));
        } else if (/^[-*•]\s+/.test(trimmed)) {
          subTopics.push(cleanTitle(trimmed));
        }
      }
    }

    if (subTopics.length === 0 && node.lessonFlow && Array.isArray(node.lessonFlow)) {
      node.lessonFlow.forEach((comp) => {
        if (
          comp.title &&
          comp.title !== node.title &&
          comp.type !== "final_summary" &&
          comp.type !== "markdown" &&
          !comp.title.includes("Mở đầu") &&
          !comp.title.includes("Thử thách") &&
          !comp.title.includes("Kiểm tra")
        ) {
          subTopics.push(cleanTitle(comp.title));
        }
      });
    }

    return subTopics;
  };

  // Transform dbJourney to hierarchical chapters/sections/groups/lessons for Mindmap
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
        .map((sub) => {
          const rawNodes = sub.nodes || [];
          
          // Group nodes into topics/subsections
          const groupsMap = new Map();
          
          rawNodes.forEach((node) => {
            let groupTitle = null; // No dummy "Bài học chi tiết" header!
            let lessonTitle = cleanTitle(node.title);
            let isSubItem = false;

            // Custom grouping rules for Chapter 1
            if (chap.orderIndex === 1 || chap.title.includes("Chương 1")) {
              if (
                node.title.includes("Nguồn gốc") ||
                node.title.includes("Khái niệm") ||
                node.title.includes("Đối tượng của triết học") ||
                node.title.includes("hạt nhân")
              ) {
                groupTitle = "Khái lược về triết học";
                isSubItem = true;
                if (node.title.includes("Nguồn gốc")) lessonTitle = "Nguồn gốc của triết học";
                else if (node.title.includes("Khái niệm")) lessonTitle = "Khái niệm triết học";
                else if (node.title.includes("Đối tượng")) lessonTitle = "Đối tượng của triết học trong lịch sử";
                else if (node.title.includes("hạt nhân")) lessonTitle = "Triết học - hạt nhân lý luận của thế giới quan";
              } else if (node.title.includes("Vấn đề cơ bản")) {
                groupTitle = null;
                lessonTitle = "Vấn đề cơ bản của triết học";
              } else if (node.title.includes("Biện chứng") || node.title.includes("siêu hình")) {
                groupTitle = null;
                lessonTitle = "Biện chứng và siêu hình";
              } else if (node.title.includes("ra đời") || node.title.includes("phát triển")) {
                groupTitle = null;
                lessonTitle = "Sự ra đời và phát triển của triết học Mác - Lênin";
              } else if (node.title.includes("Đối tượng và chức năng")) {
                groupTitle = null;
                lessonTitle = "Đối tượng và chức năng của triết học Mác - Lênin";
              } else if (node.title.includes("Vai trò")) {
                groupTitle = null;
                lessonTitle = "Vai trò của triết học Mác - Lênin trong đời sống xã hội";
              }
            }
            // Custom grouping rules for Chapter 2
            else if (chap.orderIndex === 2 || chap.title.includes("Chương 2")) {
              if (
                node.title.includes("Phạm trù vật chất") ||
                node.title.includes("Phương thức tồn tại")
              ) {
                groupTitle = "Vật chất và phương thức tồn tại của vật chất";
                isSubItem = true;
                lessonTitle = cleanTitle(node.title);
              } else if (node.title.includes("kết cấu của ý thức")) {
                groupTitle = "Nguồn gốc, bản chất và kết cấu của ý thức";
                isSubItem = true;
                lessonTitle = cleanTitle(node.title);
              } else if (node.title.includes("Mối quan hệ")) {
                groupTitle = "Mối quan hệ giữa vật chất và ý thức";
                isSubItem = true;
                lessonTitle = cleanTitle(node.title);
              } else if (node.title.includes("Hai loại hình biện chứng")) {
                groupTitle = "Hai loại hình biện chứng và phép biện chứng duy vật";
                isSubItem = true;
                lessonTitle = cleanTitle(node.title);
              } else if (
                node.title.includes("Hai nguyên lý") ||
                node.title.includes("phạm trù") ||
                node.title.includes("quy luật")
              ) {
                groupTitle = "Nội dung của phép biện chứng duy vật";
                isSubItem = true;
                lessonTitle = cleanTitle(node.title);
              } else if (node.title.includes("lịch sử triết học")) {
                groupTitle = "Quan niệm về nhận thức trong lịch sử triết học";
                isSubItem = true;
                lessonTitle = cleanTitle(node.title);
              } else if (
                node.title.includes("giai đoạn nhận thức") ||
                node.title.includes("Thực tiễn") ||
                node.title.includes("chân lý")
              ) {
                groupTitle = "Lý luận nhận thức duy vật biện chứng";
                isSubItem = true;
                lessonTitle = cleanTitle(node.title);
              } else {
                groupTitle = null;
                lessonTitle = cleanTitle(node.title);
              }
            }

            const mapKey = groupTitle || `single-${node.id}`;
            if (!groupsMap.has(mapKey)) {
              groupsMap.set(mapKey, { isMultiple: false, title: groupTitle, lessons: [] });
            }
            const grp = groupsMap.get(mapKey);
            
            const subTopics = extractSubTopics(node);
            if (isSubItem && subTopics && subTopics.length > 0) {
              grp.isMultiple = true;
              subTopics.forEach((subTitle, sIdx) => {
                grp.lessons.push({
                  id: `${node.id}-sub-${sIdx}`,
                  title: cleanTitle(subTitle),
                  originalTitle: subTitle,
                  slug: getSlugFromTitle(node.title),
                  subTopics: [],
                });
              });
            } else {
              if (isSubItem) grp.isMultiple = true;
              grp.lessons.push({
                id: node.id,
                title: lessonTitle,
                originalTitle: node.title,
                slug: getSlugFromTitle(node.title),
                subTopics: [],
              });
            }
          });

          const groups = Array.from(groupsMap.values()).map((gData) => ({
            title: gData.title,
            hasMultiple: gData.isMultiple || gData.lessons.length > 1,
            lessons: gData.lessons,
          }));

          return {
            id: sub.id,
            title: cleanTitle(sub.title),
            groups,
            lessons: rawNodes.map((node) => ({
              id: node.id,
              title: cleanTitle(node.title),
              slug: getSlugFromTitle(node.title),
              subTopics: extractSubTopics(node),
            })),
          };
        });

      if (sections.length === 0 && chap.nodes && chap.nodes.length > 0) {
        sections.push({
          id: `${chap.id}-default`,
          title: cleanTitle(chap.title),
          groups: [{
            title: null,
            hasMultiple: false,
            lessons: chap.nodes.map((node) => ({
              id: node.id,
              title: cleanTitle(node.title),
              slug: getSlugFromTitle(node.title),
              subTopics: extractSubTopics(node),
            })),
          }],
          lessons: chap.nodes.map((node) => ({
            id: node.id,
            title: cleanTitle(node.title),
            slug: getSlugFromTitle(node.title),
            subTopics: extractSubTopics(node),
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

  const handleOpenLesson = (slugOrId) => {
    const lessonNode =
      allJourneyNodes.find(
        (node) =>
          node.id === slugOrId || getSlugFromTitle(node.title) === slugOrId,
      ) || null;
    const slug = lessonNode ? getSlugFromTitle(lessonNode.title) : slugOrId;
    if (!slug) return;
    const status =
      (lessonNode && progressMap[lessonNode.id]) ||
      progressMap[slug] ||
      progressMap[getTitleFromSlug(slug)] ||
      "locked";

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
    <PageShell activeKey="lessons" hideFeedback={Boolean(lessonSlug)}>
      {!lessonSlug && !activeLesson && (
        <OnboardingGuide
          tabKey="lesson"
          steps={[
            "Tương tác với Sơ đồ (Mindmap): Giữ chuột trái và kéo để di chuyển bản đồ tư duy; cuộn chuột để thu phóng (zoom) phóng to/thu nhỏ các chương.",
            "Chọn Bài học (Concept Node): Click vào một ô trên sơ đồ bài học để mở bảng thông tin chi tiết ở cạnh phải màn hình.",
            'Bài học & Podcast AI: Trong bảng thông tin, bạn có thể chọn đọc lý thuyết tóm tắt, hoặc bật "Conversational Podcast" để nghe hai học giả thảo luận sinh động về chủ đề.',
            "Kiểm tra kiến thức: Hoàn thành các câu hỏi ôn tập nhanh cuối bài học để tích lũy điểm streak và mở khóa các bài học tiếp theo.",
          ]}
        />
      )}

      {!activeLesson && (
        <PageHero
          eyebrow="Khám phá Tri thức"
          icon="account_tree"
          title="Sơ đồ Bài học"
          subtitle="Hệ thống bài học Triết học Mác – Lênin được trực quan hóa bằng sơ đồ tư duy tương tác giúp bạn dễ dàng theo dõi và chinh phục lộ trình học tập."
        />
      )}

      <div
        className={`text-left transition-colors duration-300 ${
          activeLesson
            ? "h-[calc(100vh-64px)] overflow-hidden bg-slate-50 dark:bg-primary-950/10"
            : "mx-auto mt-6 min-h-screen max-w-6xl rounded-3xl bg-slate-50 px-6 py-8 dark:bg-primary-950/10 md:px-12"
        }`}
      >
        {!activeLesson && (
          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-primary-350">
            <span>Trang chủ</span>
            <span>›</span>
            <strong className="text-primary-800 dark:text-primary-300">
              Bài học
            </strong>
          </div>
        )}

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
        <div
          className={
            activeLesson
              ? "h-full min-h-0 min-w-0 overflow-hidden"
              : "scroll-mt-20"
          }
        >
          {activeLesson ? (
            <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden">
              <div className="flex h-12 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 dark:border-primary-850/50 dark:bg-[#0D1117]">
                <button
                  type="button"
                  onClick={handleBackToMindmap}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-primary-150 text-primary-650 transition-colors hover:bg-primary-50 hover:text-primary-850 dark:border-primary-850 dark:text-primary-300 dark:hover:bg-primary-900/30"
                  aria-label="Quay lại sơ đồ bài học"
                >
                  <span className="material-symbols-outlined text-base">
                    arrow_back
                  </span>
                </button>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-primary-900 dark:text-primary-100">
                    {activeLesson.title}
                  </p>
                </div>
              </div>

              {activeLessonLocked ? (
                <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-50 px-6 py-8 dark:bg-[#0D1117]">
                  <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-primary-850/60 dark:bg-surface-dark-elevated">
                    <span className="material-symbols-outlined text-4xl text-primary-500 dark:text-primary-300">
                      lock_clock
                    </span>
                    <h2 className="mt-3 text-lg font-bold text-primary-900 dark:text-primary-100">
                      Bài học đang được biên soạn
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-primary-200">
                      Nội dung này chưa được xuất bản chính thức. Hãy quay lại
                      sơ đồ bài học để chọn bài đã sẵn sàng.
                    </p>
                    <button
                      type="button"
                      onClick={handleBackToMindmap}
                      className="mt-5 inline-flex items-center gap-2 rounded-3xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-700"
                    >
                      <span className="material-symbols-outlined text-base">
                        account_tree
                      </span>
                      Quay lại sơ đồ
                    </button>
                  </div>
                </div>
              ) : loadingNode ? (
                <div className="min-h-0 flex-1 px-6 py-5">
                  <LessonSkeleton />
                </div>
              ) : (
                <div className="min-h-0 flex-1 overflow-hidden">
                  <Suspense
                    fallback={
                      <div className="px-6 py-5">
                        <LessonSkeleton />
                      </div>
                    }
                  >
                    <FlowLessonPlayer
                      nodeDetails={currentNodeDetails}
                      isRevisit={isRevisit}
                      onComplete={handleCompleteLesson}
                      flatSyllabusItems={flatSyllabusItems}
                      progressStats={progressStats}
                      lessonSlug={lessonSlug}
                      handleSyllabusClick={handleSyllabusClick}
                    />
                  </Suspense>
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
