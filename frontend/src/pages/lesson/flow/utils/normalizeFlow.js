/**
 * Normalize the raw lessonFlow array from the database into a consistent structure.
 * Also expands final_summary components that embed quiz into separate quiz_sequence + final_summary.
 */
export function normalizeFlow(rawFlow) {
  if (!Array.isArray(rawFlow)) return [];

  const normalized = rawFlow
    .filter((component) => component && typeof component === "object")
    .map((component, index) => normalizeComponent(component, index));

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

function normalizeComponent(component, index, parentId = "component") {
  const config =
    component.config && typeof component.config === "object"
      ? component.config
      : {};
  const id = component.id || `${parentId}_${index}`;
  const type = component.type || "unsupported";

  return {
    ...component,
    id,
    type,
    title: component.title || "Hoạt động bài học",
    config:
      type === "component_group"
        ? {
            ...config,
            components: Array.isArray(config.components)
              ? config.components
                  .filter((child) => child && typeof child === "object")
                  .map((child, childIndex) =>
                    normalizeComponent(child, childIndex, id),
                  )
              : [],
          }
        : config,
  };
}
