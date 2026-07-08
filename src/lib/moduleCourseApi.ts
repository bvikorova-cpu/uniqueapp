import { supabase } from "@/integrations/supabase/client";

export interface CurriculumLesson {
  title: string;
  content: string;
  key_points?: string[];
  exercise?: string;
}
export interface CurriculumModule {
  title: string;
  summary?: string;
  lessons: CurriculumLesson[];
}
export interface Curriculum {
  overview: string;
  learning_outcomes?: string[];
  modules: CurriculumModule[];
  final_project?: string;
  resources?: { label: string; hint?: string }[];
}

export interface ExamQuestion {
  id: number;
  q: string;
  options: string[];
}

export interface CourseMetaLite {
  module_key: string;
  module_label: string;
  course_slug: string;
  course_title: string;
  description?: string;
  level?: string;
  duration?: string;
  price?: number;
  skills?: string[];
}

export interface LessonVideo {
  title: string;
  embed_url: string;
}

export interface ExerciseFeedback {
  score: number;
  strengths?: string[];
  improvements?: string[];
  next_step?: string;
  summary?: string;
}

async function invoke(action: string, meta: CourseMetaLite, extra: Record<string, any> = {}) {
  const { data, error } = await supabase.functions.invoke("education-router", {
    body: { action: `course.${action}`, meta, ...extra },
  });
  if (error) throw error;
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as any;
}

export const lessonKey = (moduleIdx: number, lessonIdx: number) => `m${moduleIdx}_l${lessonIdx}`;

export const moduleCourseApi = {
  curriculum: (meta: CourseMetaLite) => invoke("curriculum", meta).then((d) => d.content as Curriculum),
  videos: (meta: CourseMetaLite, lesson_key: string, lesson_title: string) =>
    invoke("videos", meta, { lesson_key, lesson_title }).then((d) => d.videos as LessonVideo[]),
  workbook: (meta: CourseMetaLite) => invoke("workbook", meta).then((d) => d.pdf_url as string),
  progressGet: (meta: CourseMetaLite) => invoke("progress_get", meta).then((d) => d.completed as string[]),
  progressSet: (meta: CourseMetaLite, lesson_key: string, completed: boolean) =>
    invoke("progress_set", meta, { lesson_key, completed }),
  feedback: (meta: CourseMetaLite, opts: { lesson_key: string; lesson_title: string; exercise: string; submission: string }) =>
    invoke("feedback", meta, opts) as Promise<{ feedback: ExerciseFeedback; score: number }>,
  startExam: (meta: CourseMetaLite) =>
    invoke("exam", meta) as Promise<{ questions: ExamQuestion[]; exam_token: string }>,
  submitExam: (
    meta: CourseMetaLite,
    payload: { answers: number[]; exam_token: string; recipient_name: string },
  ) =>
    invoke("submit", meta, payload) as Promise<{
      passed: boolean;
      score: number;
      correct: number;
      total: number;
      certificate?: { certificate_code: string; pdf_url: string };
      verify_url?: string;
    }>,
};
