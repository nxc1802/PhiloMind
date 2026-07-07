/**
 * Normalize answer options array into a consistent shape for MCQ/quiz components.
 */
export function normalizeOptions(options = []) {
  return options.map((option, index) => {
    const source =
      typeof option === "object" && option ? option : { text: String(option) };
    return {
      ...source,
      id: source.id || source.answerId || `option_${index}`,
      text: source.text || source.label || "",
      isCorrect: source.isCorrect === true || source.correct === true,
      explanation: source.explanation,
    };
  });
}

/**
 * Normalize quiz questions array for QuizSequenceComponent.
 */
export function normalizeQuizQuestions(questions = []) {
  return questions.map((question, questionIndex) => {
    const options = (question.options || []).map((option, optionIndex) => {
      if (typeof option === "string") {
        return {
          id: `q${questionIndex}_option_${optionIndex}`,
          text: option,
          isCorrect: optionIndex === question.correctIndex,
        };
      }

      return {
        ...option,
        id: option.id || `q${questionIndex}_option_${optionIndex}`,
        text: option.text || option.label || "",
        isCorrect:
          option.isCorrect === true ||
          option.correct === true ||
          optionIndex === question.correctIndex,
        explanation: option.explanation,
      };
    });

    return {
      ...question,
      id: question.id || `question_${questionIndex}`,
      question: question.question || question.prompt || "Câu hỏi",
      options,
      explanation: question.explanation,
    };
  });
}
