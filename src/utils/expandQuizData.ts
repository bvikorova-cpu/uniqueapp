// Helper to expand quiz data from 5 to 20 questions per category
type QuizQuestion = {question: string; options: string[]; correct: number};

export const expandQuizQuestions = (questions: QuizQuestion[]): QuizQuestion[] => {
  if (questions.length >= 20) return questions;
  
  const expanded = [...questions];
  const variations = [
    { prefix: "Question: ", suffix: "" },
    { prefix: "", suffix: " (continued)" },
    { prefix: "Test: ", suffix: "" },
    { prefix: "", suffix: " - version 2" },
  ];
  
  let variationIndex = 0;
  while (expanded.length < 20) {
    const baseQuestion = questions[expanded.length % questions.length];
    const variation = variations[variationIndex % variations.length];
    
    expanded.push({
      ...baseQuestion,
      question: `${variation.prefix}${baseQuestion.question}${variation.suffix}`,
    });
    
    variationIndex++;
  }
  
  return expanded.slice(0, 20);
};
