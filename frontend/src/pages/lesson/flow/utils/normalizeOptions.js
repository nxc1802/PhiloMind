/**
 * Normalize answer options array into a consistent shape for MCQ/quiz components.
 */
export function normalizeOptions(options = []) {
  return options.map((option, index) => ({
    id: option.id || option.answerId || `option_${index}`,
    text: option.text,
    isCorrect: option.isCorrect === true || option.correct === true,
    explanation: option.explanation,
  }));
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
      id: question.id || `question_${questionIndex}`,
      question: question.question || question.prompt || "Câu hỏi",
      options,
      explanation: question.explanation,
    };
  });
}
