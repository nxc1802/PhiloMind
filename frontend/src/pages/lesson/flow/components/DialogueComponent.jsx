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
    <ComponentFrame component={component}>
      <div className="bg-gray-50 dark:bg-primary-950/30 rounded-xl border border-gray-200 dark:border-primary-850 p-2 md:p-3">
        <DialogueSequence
          lines={lines}
          onComplete={() => onComplete({ score: 100, status: "completed" })}
          ctaLabel="Tiếp tục"
        />
      </div>
    </ComponentFrame>
  );
}
