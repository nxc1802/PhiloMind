import React from "react";
import { useDroppable } from "@dnd-kit/core";

export function DropZone({ id, data, children, className }) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data,
  });

  return (
    <div
      ref={setNodeRef}
      className={`${className || ""} transition-colors ${
        isOver
          ? "ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/40"
          : ""
      }`}
    >
      {children}
    </div>
  );
}
