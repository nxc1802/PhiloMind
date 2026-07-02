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
      <DialogueSequence
        lines={lines}
        onComplete={() => onComplete({ score: 100, status: "completed" })}
        ctaLabel="Tiếp tục"
      />
    </ComponentFrame>
  );
}
