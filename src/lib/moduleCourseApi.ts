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

async function invoke(action: string, meta: CourseMetaLite, extra: Record<string, any> = {}) {
  const { data, error } = await supabase.functions.invoke("module-course-exam", {
    body: { action, meta, ...extra },
  });
  if (error) throw error;
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as any;
}

export const moduleCourseApi = {
  curriculum: (meta: CourseMetaLite) => invoke("curriculum", meta).then((d) => d.content as Curriculum),
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
