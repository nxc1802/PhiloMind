import React, { useMemo } from "react";
import DialogueSequence from "../../components/GuideSpeech";
import { ComponentFrame } from "./ComponentFrame";

export function DialogueComponent({ component, onComplete }) {
  const isEmbedded = component.__isEmbedded === true;
  const isCompleted = component.__isCompleted === true;
  const sourceLines = component.config.lines || component.config.dialogs || [];
  const lines = useMemo(
    () =>
      sourceLines.map((line) => ({
        who: line.who || "guide",
        text: line.text,
        side: line.side,
      })),
    [sourceLines],
  );
  return (
    <ComponentFrame component={component} className="!p-3 md:!p-4">
      <div className={`flex flex-col min-h-0 ${isEmbedded ? "" : "flex-1"}`}>
        <DialogueSequence
          lines={lines}
          characters={component.config.characters}
          onComplete={() => onComplete({ score: 100, status: "completed" })}
          ctaLabel="Tiếp tục"
          compact={isEmbedded}
          completed={isCompleted}
        />
      </div>
    </ComponentFrame>
  );
}
