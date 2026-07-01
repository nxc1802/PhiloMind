import React, { useMemo, useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useUpdateComponentProgressMutation } from "../../../hooks/useMutations";
import { normalizeFlow } from "./utils/normalizeFlow";
import { LeftPanel } from "../components/LeftPanel";
import { CenterMedia } from "../components/CenterMedia";
import { RightInteractive } from "../components/RightInteractive";

function getProgress(progress) {
  return Array.isArray(progress) && progress.length > 0 ? progress[0] : null;
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
  // Note: We use lessonMedia if available, otherwise we try to extract media from the current active component if it has media config.
  // This maintains backward compatibility.
  const lessonMedia = useMemo(() => {
    if (nodeDetails?.lessonMedia && Array.isArray(nodeDetails.lessonMedia) && nodeDetails.lessonMedia.length > 0) {
      return nodeDetails.lessonMedia;
    }
    return [];
  }, [nodeDetails?.lessonMedia]);

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

  // Reset state on node change
  useEffect(() => {
    setActiveIndex(initialIndex);
    setCompletedIds(
      Array.isArray(progress?.completedComponentIds)
        ? progress.completedComponentIds
        : [],
    );
    if (lessonMedia.length > 0) {
      setActiveMediaId(lessonMedia[0].id);
    } else {
      setActiveMediaId(null);
    }
  }, [nodeDetails?.id, lessonMedia]);

  // 4. Progress Handlers
  const handleCompleteComponent = (activeComponent, currentSafeIndex, result = {}) => {
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

  // 5. Layout Rendering
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_minmax(0,1.2fr)] h-[calc(100vh-64px)] w-full overflow-hidden">
      {/* Cột 1: Left Panel */}
      <div className="hidden lg:block h-full z-10 relative">
        <LeftPanel
          flatSyllabusItems={flatSyllabusItems}
          progressStats={progressStats}
          lessonSlug={lessonSlug}
          handleSyllabusClick={handleSyllabusClick}
          currentNodeDetails={nodeDetails}
          flow={flow}
          activeIndex={activeIndex}
          completedIds={completedIds}
          onSelectComponent={handleSelectComponent}
        />
      </div>

      {/* Cột 2: Center Media */}
      <div className="hidden lg:block h-full border-r border-slate-200 dark:border-primary-850/50 z-0 relative">
        <CenterMedia
          lessonMedia={lessonMedia}
          activeMediaId={activeMediaId}
          onSelectMedia={handleSelectMedia}
        />
      </div>

      {/* Cột 3: Right Interactive (or full width on mobile) */}
      <div className="h-full z-20 relative shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)] dark:shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.5)]">
        <RightInteractive
          flow={flow}
          activeIndex={activeIndex}
          completedIds={completedIds}
          onCompleteComponent={handleCompleteComponent}
          onFinishLesson={onComplete}
        />
      </div>
    </div>
  );
}
