import React, { useMemo, useState, useEffect } from "react";
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
  const initialIndex = isRevisit
    ? 0
    : Math.min(
        progress?.currentComponentIndex || 0,
        Math.max(flow.length - 1, 0),
      );
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [completedIds, setCompletedIds] = useState(() =>
    Array.isArray(progress?.completedComponentIds)
      ? progress.completedComponentIds
      : [],
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

  const handleSelectComponent = (index) => {
    setActiveIndex(index);
  };

  const handleSelectMedia = (mediaId) => {
    setActiveMediaId(mediaId);
  };

  // Drag resize logic
  const [leftWidth, setLeftWidth] = useState(50); // percentage
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const newWidth = (e.clientX / window.innerWidth) * 100;
      if (newWidth >= 20 && newWidth <= 80) {
        setLeftWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-slate-50 dark:bg-[#0D1117]">
      <ProgressBar
        progressItems={progressItems}
        activeIndex={activeIndex}
        completedIds={completedIds}
        onSelectComponent={handleSelectComponent}
      />
      <div className="flex flex-1 min-h-0 w-full p-3 gap-1 overflow-hidden">
        {/* Left Column: Center Media */}
        <div 
          className="relative h-full min-h-0 flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-primary-850/50 dark:bg-surface-dark-elevated"
          style={{ width: `calc(${leftWidth}% - 8px)` }}
        >
          <MilestoneBar flow={flow} completedIds={completedIds} />
          <CenterMedia
            lessonMedia={lessonMedia}
            activeMediaId={activeMediaId}
            onSelectMedia={handleSelectMedia}
          />
        </div>

        {/* Resizable Divider */}
        <div
          className="w-4 shrink-0 cursor-col-resize group flex items-center justify-center -mx-1 z-10"
          onMouseDown={() => setIsDragging(true)}
        >
          <div className={`h-16 w-1 rounded-full transition-colors ${isDragging ? 'bg-primary-500' : 'bg-slate-300 group-hover:bg-primary-400 dark:bg-slate-600'}`} />
        </div>

        {/* Right Column: Interactive Content */}
        <div 
          className="relative h-full min-h-0"
          style={{ width: `calc(${100 - leftWidth}% - 8px)` }}
        >
          <RightInteractive
            flow={flow}
            activeIndex={activeIndex}
            completedIds={completedIds}
            onCompleteComponent={handleCompleteComponent}
            onFinishLesson={onComplete}
          />
        </div>
      </div>
    </div>
  );
}
