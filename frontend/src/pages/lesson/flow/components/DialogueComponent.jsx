import React, { useMemo } from "react";
import DialogueSequence from "../../components/GuideSpeech";
import { ComponentFrame } from "./ComponentFrame";

export function DialogueComponent({ component, onComplete }) {
  const sourceLines = component.config.lines || component.config.dialogs || [];
  const lines = useMemo(
    () =>
      sourceLines.map((line) => ({
        who: line.who || "guide",
        text: line.text,
      })),
    [sourceLines],
  );
  return (
    <ComponentFrame component={component} className="!p-3 md:!p-4">
      <div className="flex flex-col flex-1 min-h-0">
        <DialogueSequence
          lines={lines}
          onComplete={() => onComplete({ score: 100, status: "completed" })}
          ctaLabel="Tiếp tục"
        />
      </div>
    </ComponentFrame>
  );
}
