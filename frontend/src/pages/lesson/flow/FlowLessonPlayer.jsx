import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useAuth } from "../../../context/AuthContext";
import { useUpdateComponentProgressMutation } from "../../../hooks/useMutations";
import { normalizeFlow } from "./utils/normalizeFlow";
import { ProgressBar } from "../components/ProgressBar";
import { CenterMedia } from "../components/CenterMedia";
import { RightInteractive } from "../components/RightInteractive";

function getProgress(progress) {
  return Array.isArray(progress) && progress.length > 0 ? progress[0] : null;
}

import { MilestoneBar } from "../components/MilestoneBar";

function mediaFromComponent(component) {
  if (component?.type !== "media" || !component.config?.url) return null;

  return {
    id: component.id,
    type: component.config.mediaType || "video",
    url: component.config.url,
    title: component.config.title || component.title,
    subtitle: component.config.subtitle,
    alt: component.config.alt,
    description: component.config.description,
    badge: component.config.badge,
  };
}

function getLinkedMediaId(component) {
  return (
    component?.linkedMediaId ||
    component?.linked_media_id ||
    component?.config?.linkedMediaId ||
    component?.config?.linked_media_id ||
    null
  );
}

function findFlowIndexByComponentId(flow, componentId) {
  if (!componentId) return -1;
  return flow.findIndex((component) => {
    if (component.id === componentId) return true;
    const children = component.config?.components;
    return (
      component.type === "component_group" &&
      Array.isArray(children) &&
      children.some((child) => child?.id === componentId)
    );
  });
}

export default function FlowLessonPlayer({
  nodeDetails,
  isRevisit,
  onComplete,
  flatSyllabusItems,
  progressStats,
  lessonSlug,
  handleSyllabusClick,
}) {
  const { user } = useAuth();
  const progress = getProgress(nodeDetails?.progress);

  // 1. Flow Normalization
  const flow = useMemo(
    () => normalizeFlow(nodeDetails?.lessonFlow),
    [nodeDetails?.lessonFlow],
  );

  // 2. Media Extraction
  // lessonMedia drives the center column. Media components are still accepted
  // for backward-compatible seed data, but are not rendered in the right column.
  const flowMedia = useMemo(
    () => flow.map(mediaFromComponent).filter(Boolean),
    [flow],
  );

  const lessonMedia = useMemo(() => {
    const fromNode = Array.isArray(nodeDetails?.lessonMedia)
      ? nodeDetails.lessonMedia
      : [];
    const seen = new Set();
    return [...fromNode, ...flowMedia].filter((item) => {
      if (!item?.id || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [flowMedia, nodeDetails?.lessonMedia]);

  const progressItems = useMemo(
    () => flow.map((component, index) => ({ component, index })),
    [flow],
  );

  const mediaIdByIndex = useMemo(() => {
    const mediaIds = new Map();
    let currentMediaId = lessonMedia[0]?.id || null;

    flow.forEach((component, index) => {
      const linkedMediaId = getLinkedMediaId(component);
      if (linkedMediaId) {
        currentMediaId = linkedMediaId;
      } else if (component.type === "media") {
        currentMediaId = component.id;
      }
      mediaIds.set(index, currentMediaId);
    });

    return mediaIds;
  }, [flow, lessonMedia]);

  const getMediaIdForIndex = (index) => {
    const component = flow[index];
    const linkedMediaId = getLinkedMediaId(component);
    if (linkedMediaId) return linkedMediaId;
    if (component?.type === "media") return component.id;
    return mediaIdByIndex.get(index) || lessonMedia[0]?.id || null;
  };

  // 3. State Management
  const progressActiveIndex = findFlowIndexByComponentId(
    flow,
    progress?.activeComponentId,
  );
  const initialIndex = isRevisit
    ? 0
    : Math.min(
        progressActiveIndex >= 0
          ? progressActiveIndex
          : progress?.currentComponentIndex || 0,
        Math.max(flow.length - 1, 0),
      );
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [completedIds, setCompletedIds] = useState(() =>
    Array.isArray(progress?.completedComponentIds)
      ? progress.completedComponentIds
      : [],
  );
  const componentResults = useMemo(
    () =>
      Array.isArray(progress?.componentResults)
        ? progress.componentResults
        : [],
    [progress?.componentResults],
  );
  const [activeMediaId, setActiveMediaId] = useState(lessonMedia[0]?.id);

  const updateComponentProgress = useUpdateComponentProgressMutation();

  const activeMediaForIndex = useMemo(
    () => getMediaIdForIndex(activeIndex),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeIndex, flow, lessonMedia, mediaIdByIndex],
  );

  useEffect(() => {
    if (activeMediaForIndex) {
      setActiveMediaId(activeMediaForIndex);
    } else {
      setActiveMediaId(null);
    }
  }, [activeMediaForIndex]);

  // Reset state on node change
  useEffect(() => {
    setActiveIndex(initialIndex);
    setCompletedIds(
      Array.isArray(progress?.completedComponentIds)
        ? progress.completedComponentIds
        : [],
    );
    setActiveMediaId(getMediaIdForIndex(initialIndex));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeDetails?.id, lessonMedia]);

  // 4. Progress Handlers
  const handleCompleteComponent = (
    activeComponent,
    currentSafeIndex,
    result = {},
  ) => {
    const nextCompletedIds = completedIds.includes(activeComponent.id)
      ? completedIds
      : [...completedIds, activeComponent.id];

    const nextIndex = Math.min(currentSafeIndex + 1, flow.length - 1);

    const componentResult = {
      componentId: activeComponent.id,
      type: activeComponent.type,
      status: "completed",
      ...result,
    };

    setCompletedIds(nextCompletedIds);

    updateComponentProgress.mutate({
      nodeId: nodeDetails.id,
      userId: user?.id,
      payload: {
        activeComponentId: flow[nextIndex]?.id,
        currentComponentIndex: nextIndex,
        completedComponentIds: nextCompletedIds,
        componentResult,
      },
    });

    if (currentSafeIndex < flow.length - 1) {
      setActiveIndex(nextIndex);
    }
  };

  const handleUpdateComponentResult = (
    activeComponent,
    currentSafeIndex,
    result = {},
  ) => {
    const componentResult = {
      componentId: activeComponent.id,
      type: activeComponent.type,
      status: "in_progress",
      ...result,
    };

    updateComponentProgress.mutate({
      nodeId: nodeDetails.id,
      userId: user?.id,
      payload: {
        activeComponentId: activeComponent.id,
        currentComponentIndex: currentSafeIndex,
        completedComponentIds: completedIds,
        componentResult,
      },
    });
  };

  const handleSelectComponent = (index) => {
    setActiveIndex(index);
  };

  const handleSelectMedia = (mediaId) => {
    setActiveMediaId(mediaId);
  };

  const handleResetLesson = () => {
    const firstComponent = flow[0];
    if (!firstComponent || !nodeDetails?.id) return;

    setCompletedIds([]);
    setActiveIndex(0);
    setActiveMediaId(getMediaIdForIndex(0));

    updateComponentProgress.mutate({
      nodeId: nodeDetails.id,
      userId: user?.id,
      payload: {
        activeComponentId: firstComponent.id,
        currentComponentIndex: 0,
        completedComponentIds: [],
        componentResults: [],
        resetLessonProgress: true,
      },
    });
  };

  // Drag-resize logic — recoded.
  // Cách cũ tính % theo `e.clientX / window.innerWidth`, bỏ qua việc khung bài
  // học nằm trong <main> có lề trái (sidebar). Vì thế clientX luôn lớn hơn
  // chiều rộng thực của khung → cột trái bị phóng hết cỡ, vỡ cột phải.
  // Cách mới: đo vị trí con trỏ TƯƠNG ĐỐI so với chính hàng chứa 2 cột.
  const MIN_PERCENT = 25;
  const MAX_PERCENT = 75;
  const splitRowRef = useRef(null);
  const [leftWidth, setLeftWidth] = useState(50); // phần trăm cột trái
  const [isDragging, setIsDragging] = useState(false);

  const applyWidthFromClientX = useCallback((clientX) => {
    const row = splitRowRef.current;
    if (!row) return;
    const rect = row.getBoundingClientRect();
    if (rect.width <= 0) return;
    const raw = ((clientX - rect.left) / rect.width) * 100;
    const clamped = Math.min(MAX_PERCENT, Math.max(MIN_PERCENT, raw));
    setLeftWidth(clamped);
  }, []);

  const startDrag = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e) => {
      const clientX = e.touches ? e.touches[0]?.clientX : e.clientX;
      if (typeof clientX === "number") applyWidthFromClientX(clientX);
    };
    const stop = () => setIsDragging(false);

    // Chặn bôi đen văn bản trong lúc kéo.
    const prevUserSelect = document.body.style.userSelect;
    const prevCursor = document.body.style.cursor;
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", stop);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", stop);
      document.body.style.userSelect = prevUserSelect;
      document.body.style.cursor = prevCursor;
    };
  }, [isDragging, applyWidthFromClientX]);

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-slate-50 dark:bg-[#0D1117]">
      <div className="w-full min-w-0 px-3 pt-3">
        <ProgressBar
          progressItems={progressItems}
          activeIndex={activeIndex}
          completedIds={completedIds}
          onSelectComponent={handleSelectComponent}
          onReset={handleResetLesson}
          isResetting={updateComponentProgress.isPending || flow.length === 0}
        />
      </div>
      <div
        ref={splitRowRef}
        className="flex flex-1 min-h-0 w-full min-w-0 p-3 gap-1 overflow-hidden"
      >
        {/* Left Column: Center Media */}
        <div
          className="relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-transparent dark:bg-surface-dark-elevated"
          style={{ width: `${leftWidth}%` }}
        >
          <MilestoneBar
            flow={flow}
            completedIds={completedIds}
            activeIndex={activeIndex}
          />
          <CenterMedia
            lessonMedia={lessonMedia}
            activeMediaId={activeMediaId}
            onSelectMedia={handleSelectMedia}
          />
        </div>

        {/* Resizable Divider */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Kéo để chỉnh độ rộng hai cột"
          className="group z-10 -mx-1 flex w-4 shrink-0 cursor-col-resize touch-none items-center justify-center"
          onMouseDown={startDrag}
          onTouchStart={startDrag}
          onDoubleClick={() => setLeftWidth(50)}
        >
          <div
            className={`h-16 w-1 rounded-full transition-colors ${
              isDragging
                ? "bg-primary-500"
                : "bg-slate-300 group-hover:bg-primary-400 dark:bg-slate-600"
            }`}
          />
        </div>

        {/* Right Column: Interactive Content */}
        <div
          className="relative h-full min-h-0 min-w-0"
          style={{ width: `${100 - leftWidth}%` }}
        >
          <RightInteractive
            flow={flow}
            activeIndex={activeIndex}
            completedIds={completedIds}
            componentResults={componentResults}
            onCompleteComponent={handleCompleteComponent}
            onUpdateComponentResult={handleUpdateComponentResult}
            onFinishLesson={onComplete}
          />
        </div>
      </div>
    </div>
  );
}
