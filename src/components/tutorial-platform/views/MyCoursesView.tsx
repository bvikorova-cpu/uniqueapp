import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Pencil, Trash2, Eye, Loader2, GraduationCap, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props {
  onBack: () => void;
  onEdit: (courseId: string) => void;
  onCreate: () => void;
}

interface CourseRow {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  price: number | null;
  is_published: boolean | null;
  total_lessons: number | null;
  created_at: string;
}

export function MyCoursesView({ onBack, onEdit, onCreate }: Props) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCourses([]);
        return;
      }
      const { data, error } = await supabase
        .from("courses")
        .select("id,title,description,category,price,is_published,total_lessons,created_at")
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setCourses((data as CourseRow[]) || []);
    } catch (e: any) {
      toast({ title: "Could not load your courses", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const togglePublish = async (course: CourseRow) => {
    setBusyId(course.id);
    try {
      const { error } = await supabase
        .from("courses")
        .update({ is_published: !course.is_published })
        .eq("id", course.id);
      if (error) throw error;
      toast({ title: course.is_published ? "Course unpublished" : "Course published" });
      await load();
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (course: CourseRow) => {
    if (!window.confirm(`Delete "${course.title}"? This cannot be undone.`)) return;
    setBusyId(course.id);
    try {
      await supabase.from("course_lessons").delete().eq("course_id", course.id);
      const { error } = await supabase.from("courses").delete().eq("id", course.id);
      if (error) throw error;
      toast({ title: "Course deleted" });
      setCourses(prev => prev.filter(c => c.id !== course.id));
    } catch (e: any) {
      toast({ title: "Delete failed", description: e.message, variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <FloatingHowItWorks
        title="My Courses - How it works"
        steps={[
          { title: "Overview", desc: "See every course you created, published or draft." },
          { title: "Edit", desc: "Tap Edit to change the course details, modules, videos and files." },
          { title: "Publish", desc: "Toggle publish to show or hide the course in Browse Courses." },
          { title: "Delete", desc: "Remove a course permanently together with its lessons." },
        ]}
      />
      <div>
        <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center shadow-lg">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black">My Courses</h2>
                <p className="text-sm text-muted-foreground">Edit, publish or delete your own courses</p>
              </div>
            </div>
            <Button onClick={onCreate} className="bg-gradient-to-r from-emerald-500 to-teal-600">
              <Plus className="w-4 h-4 mr-2" />New course
            </Button>
          </div>

          {loading ? (
            <div className="py-16 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : courses.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              You have no courses yet. Create your first course to get started.
            </Card>
          ) : (
            <div className="space-y-3">
              {courses.map(course => (
                <Card key={course.id} className="p-4 backdrop-blur-xl bg-card/70">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold truncate">{course.title}</h3>
                        <Badge variant={course.is_published ? "default" : "outline"}>
                          {course.is_published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{course.description}</p>
                      <div className="flex gap-2 mt-2 flex-wrap text-xs text-muted-foreground">
                        {course.category && <Badge variant="outline">{course.category}</Badge>}
                        <Badge variant="outline">{course.total_lessons ?? 0} lessons</Badge>
                        <Badge variant="outline">€{Number(course.price ?? 0).toFixed(2)}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:flex gap-2 mt-3">
                    <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-600" onClick={() => onEdit(course.id)}>
                      <Pencil className="w-4 h-4 mr-2" />Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => navigate(`/tutorial-course/${course.id}`)}>
                      <Eye className="w-4 h-4 mr-2" />View
                    </Button>
                    <Button size="sm" variant="outline" disabled={busyId === course.id} onClick={() => togglePublish(course)}>
                      {course.is_published ? "Unpublish" : "Publish"}
                    </Button>
                    <Button size="sm" variant="destructive" disabled={busyId === course.id} onClick={() => remove(course)}>
                      <Trash2 className="w-4 h-4 mr-2" />Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
