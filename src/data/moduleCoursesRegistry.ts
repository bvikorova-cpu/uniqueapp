// Registry of remaining module courses used by the universal
// curriculum + final exam + certificate system.

export interface ModuleCourseMeta {
  module_key: string;
  module_label: string;
  course_slug: string;
  course_title: string;
  description: string;
  level: string;
  price: number;
  duration: string;
  purchase_type: string; // matches useLearningContent contentType
  skills: string[];
}

export const MODULE_COURSES: ModuleCourseMeta[] = [
  // Fitness & Wellness
  { module_key: "fitness-wellness", module_label: "Fitness & Wellness", course_slug: "yoga-mastery", course_title: "Complete Yoga Mastery", description: "Progressive yoga from beginner to advanced", level: "All Levels", price: 149, duration: "8 weeks", purchase_type: "fitness-course", skills: ["Asanas", "Pranayama", "Alignment", "Sequencing", "Meditation"] },
  { module_key: "fitness-wellness", module_label: "Fitness & Wellness", course_slug: "hiit-bootcamp", course_title: "HIIT Bootcamp Pro", description: "Fat-burning, functional HIIT training", level: "Intermediate", price: 129, duration: "6 weeks", purchase_type: "fitness-course", skills: ["Intervals", "Mobility", "Progression", "Recovery", "Nutrition"] },
  { module_key: "fitness-wellness", module_label: "Fitness & Wellness", course_slug: "mindfulness-meditation", course_title: "Mindfulness & Meditation", description: "A calmer mind in 8 weeks", level: "Beginner", price: 99, duration: "8 weeks", purchase_type: "fitness-course", skills: ["Attention", "Breath", "Body scan", "Compassion", "Habit"] },
  { module_key: "fitness-wellness", module_label: "Fitness & Wellness", course_slug: "nutrition-fundamentals", course_title: "Nutrition Fundamentals", description: "Evidence-based nutrition for real life", level: "All Levels", price: 159, duration: "7 weeks", purchase_type: "fitness-course", skills: ["Macros", "Micros", "Meal planning", "Hydration", "Sustainability"] },
];

export const getModuleCourse = (module_key: string, course_slug: string) =>
  MODULE_COURSES.find((c) => c.module_key === module_key && c.course_slug === course_slug);
