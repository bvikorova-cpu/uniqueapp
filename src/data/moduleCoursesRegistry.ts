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
];

export const getModuleCourse = (module_key: string, course_slug: string) =>
  MODULE_COURSES.find((c) => c.module_key === module_key && c.course_slug === course_slug);
