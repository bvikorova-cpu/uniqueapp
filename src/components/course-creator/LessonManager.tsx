import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Save, X, GripVertical, Upload } from "lucide-react";
import { MaterialUploader } from "./MaterialUploader";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Lesson {
  id: string;
  title: string;
  description: string;
  video_url: string;
  duration_minutes: number;
  order_index: number;
  is_preview: boolean;
}

interface LessonManagerProps {
  courseId: string;
}

export function LessonManager({ courseId }: LessonManagerProps) {
  const { toast } = useToast();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    video_url: "",
    duration_minutes: "",
    is_preview: false,
  });

  useEffect(() => {
    loadLessons();
  }, [courseId]);

  const loadLessons = async () => {
    try {
      const { data, error } = await supabase
        .from("course_lessons")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index", { ascending: true });

      if (error) throw error;
      setLessons(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.video_url) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const lessonData = {
        course_id: courseId,
        title: formData.title,
        description: formData.description || null,
        video_url: formData.video_url,
        duration_minutes: parseInt(formData.duration_minutes) || 0,
        is_preview: formData.is_preview,
        order_index: editingLesson ? editingLesson.order_index : lessons.length,
      };

      if (editingLesson) {
        const { error } = await supabase
          .from("course_lessons")
          .update(lessonData)
          .eq("id", editingLesson.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("course_lessons")
          .insert([lessonData]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Lesson ${editingLesson ? "updated" : "created"} successfully`,
      });

      resetForm();
      loadLessons();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description || "",
      video_url: lesson.video_url || "",
      duration_minutes: lesson.duration_minutes?.toString() || "",
      is_preview: lesson.is_preview || false,
    });
  };

  const handleDelete = async (lessonId: string) => {
    try {
      const { error } = await supabase
        .from("course_lessons")
        .delete()
        .eq("id", lessonId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Lesson deleted successfully",
      });
      
      loadLessons();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingLesson(null);
    setFormData({
      title: "",
      description: "",
      video_url: "",
      duration_minutes: "",
      is_preview: false,
    });
  };

  return (
    <>
      <FloatingHowItWorks title="How Lesson Manager works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <div className="space-y-6">
      {/* Lesson Form */}
      <Card>
        <CardHeader>
          <CardTitle>{editingLesson ? "Edit Lesson" : "Add New Lesson"}</CardTitle>
          <CardDescription>
            Create video lessons for your course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lesson-title">Lesson Title *</Label>
              <Input
                id="lesson-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Introduction to React Hooks"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lesson-description">Description</Label>
              <Textarea
                id="lesson-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What will students learn in this lesson?"
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="video-url">Video URL *</Label>
                <Input
                  id="video-url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  required
                />
                <p className="text-xs text-muted-foreground">
                  YouTube, Vimeo, or direct video link
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                  placeholder="15"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="preview"
                checked={formData.is_preview}
                onCheckedChange={(checked) => setFormData({ ...formData, is_preview: checked })}
              />
              <Label htmlFor="preview">Allow free preview (users can watch without purchasing)</Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                {editingLesson ? "Update Lesson" : "Add Lesson"}
              </Button>
              {editingLesson && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lessons List */}
      <Card>
        <CardHeader>
          <CardTitle>Course Lessons ({lessons.length})</CardTitle>
          <CardDescription>Manage your course curriculum</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : lessons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No lessons yet. Add your first lesson above.
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson, index) => (
                <div key={lesson.id}>
                  <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{index + 1}. {lesson.title}</span>
                        {lesson.is_preview && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                            Free Preview
                          </span>
                        )}
                      </div>
                      {lesson.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {lesson.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {lesson.duration_minutes} minutes
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(lesson)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(lesson.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Material Uploader for this lesson */}
                  <MaterialUploader lessonId={lesson.id} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </>
    );
}
