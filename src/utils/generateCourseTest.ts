import type { Topic } from "@/data/courseContent";

export interface TestQuestion {
  question: string;
  options: string[];
  correct: number;
}

export const generateCourseTest = (topics: Topic[]): TestQuestion[] => {
  const questions: TestQuestion[] = [];

  // Generate 10 questions from course topics
  topics.forEach((topic, index) => {
    if (index >= 10) return; // Only 10 questions

    // Extract key information from topic title and content
    const topicNumber = index + 1;
    const topicTitle = topic.title.replace(/^Topic \d+:\s*/, '');
    
    // Generate questions based on topic content
    const contentLines = topic.content.split('\n').filter(line => line.trim());
    const hasKeyPoints = contentLines.some(line => line.startsWith('**'));

    if (hasKeyPoints) {
      // Find first key concept
      const keyConcept = contentLines.find(line => line.startsWith('**'));
      if (keyConcept) {
        const concept = keyConcept.replace(/\*\*/g, '').split(':')[0].trim();
        
        questions.push({
          question: `What is the main topic of the ${topicNumber}. part of the course?`,
          options: [
            topicTitle,
            index > 0 ? topics[index - 1].title.replace(/^Topic \d+:\s*/, '') : 'Other topic',
            index < topics.length - 1 ? topics[index + 1].title.replace(/^Topic \d+:\s*/, '') : 'Conclusion',
            'All topics'
          ],
          correct: 0
        });
      }
    } else {
      // Generic question about topic
      questions.push({
        question: `In which topic is "${topicTitle}" discussed?`,
        options: [
          `Topic ${topicNumber}`,
          `Topic ${topicNumber > 1 ? topicNumber - 1 : topicNumber + 1}`,
          `Topic ${topicNumber < topics.length ? topicNumber + 1 : topicNumber - 1}`,
          'In all topics'
        ],
        correct: 0
      });
    }
  });

  // Ensure we have exactly 10 questions
  while (questions.length < 10) {
    const randomIndex = Math.floor(Math.random() * topics.length);
    const topic = topics[randomIndex];
    
    questions.push({
      question: `Which topic contains information about "${topic.title.replace(/^Topic \d+:\s*/, '')}"?`,
      options: [
        `Topic ${randomIndex + 1}`,
        `Topic ${randomIndex > 0 ? randomIndex : randomIndex + 2}`,
        `Topic ${randomIndex < topics.length - 1 ? randomIndex + 2 : randomIndex - 1}`,
        'Not found in the course'
      ],
      correct: 0
    });
  }

  return questions.slice(0, 10);
};
