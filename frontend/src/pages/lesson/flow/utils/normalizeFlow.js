/**
 * Normalize the raw lessonFlow array from the database into a consistent structure.
 * Also expands final_summary components that embed quiz into separate quiz_sequence + final_summary.
 */
export function normalizeFlow(rawFlow) {
  if (!Array.isArray(rawFlow)) return [];

  const normalized = rawFlow
    .filter((component) => component && typeof component === "object")
    .map((component, index) => ({
      ...component,
      id: component.id || `component_${index}`,
      type: component.type || "unsupported",
      title: component.title || "Hoạt động bài học",
      config:
        component.config && typeof component.config === "object"
          ? component.config
          : {},
    }));

  return normalized.flatMap((component) => {
    const finalQuiz = component.config.quiz;
    if (
      component.type === "final_summary" &&
      Array.isArray(finalQuiz) &&
      finalQuiz.length > 0
    ) {
      const finalConfig = { ...component.config };
      delete finalConfig.quiz;
      return [
        {
          id: `${component.id}-quiz`,
          type: "quiz_sequence",
          title: component.config.quizTitle || "Kiểm tra cuối bài",
          config: { questions: finalQuiz },
          completionRule: { type: "correct" },
        },
        { ...component, config: finalConfig },
      ];
    }

    return [component];
  });
}
