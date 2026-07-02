import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, X, BookOpen } from "lucide-react";
import { LessonManager } from "./LessonManager";
import { QuizBuilder } from "./QuizBuilder";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface CourseFormProps {
  courseId: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const categories = [
  "Programming",
  "Design",
  "Business",
  "Marketing",
  "Photography",
  "Music",
  "Health & Fitness",
  "Cooking",
  "Language",
  "Personal Development",
];

export function CourseForm({ courseId, onSuccess, onCancel }: CourseFormProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    difficulty_level: "beginner",
    price: "",
    thumbnail_url: "",
    is_published: false,
  });

  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  const loadCourse = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();

      if (error) throw error;

      setFormData({
        title: data.title,
        description: data.description,
        category: data.category,
        difficulty_level: data.difficulty_level || "beginner",
        price: data.price.toString(),
        thumbnail_url: data.thumbnail_url || "",
        is_published: data.is_published || false,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category || !formData.price) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const courseData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        difficulty_level: formData.difficulty_level,
        price: parseFloat(formData.price),
        thumbnail_url: formData.thumbnail_url || null,
        is_published: formData.is_published,
        creator_id: user.id,
      };

      if (courseId) {
        const { error } = await supabase
          .from("courses")
          .update(courseData)
          .eq("id", courseId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("courses")
          .insert([courseData]);

        if (error) throw error;
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Course Form works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{courseId ? "Edit Course" : "Create New Course"}</h2>
          <p className="text-muted-foreground">Fill in the details to create your course</p>
        </div>
        <Button variant="outline" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </div>

      {courseId ? (
        <Tabs defaultValue="details" className="w-full">
          <TabsList>
            <TabsTrigger value="details">Course Details</TabsTrigger>
            <TabsTrigger value="lessons">Lessons & Content</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <CourseDetailsForm
              formData={formData}
              setFormData={setFormData}
              handleSubmit={handleSubmit}
              saving={saving}
              categories={categories}
            />
          </TabsContent>

          <TabsContent value="lessons">
            <LessonManager courseId={courseId} />
          </TabsContent>

          <TabsContent value="quizzes">
            <QuizBuilder courseId={courseId} />
          </TabsContent>
        </Tabs>
      ) : (
        <CourseDetailsForm
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          saving={saving}
          categories={categories}
        />
      )}
    </div>
    </>
    );
}

function CourseDetailsForm({ formData, setFormData, handleSubmit, saving, categories }: any) {
  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Course Information</CardTitle>
          <CardDescription>
            Basic details about your course
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Course Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Complete Web Development Bootcamp"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what students will learn in this course..."
              rows={5}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat: string) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level *</Label>
              <Select
                value={formData.difficulty_level}
                onValueChange={(value) => setFormData({ ...formData, difficulty_level: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price">Price (€) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="5"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="29.99"
                required
              />
              <p className="text-sm text-muted-foreground">
                You'll earn 80% (€{(parseFloat(formData.price || "0") * 0.8).toFixed(2)}) per sale
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail URL</Label>
              <Input
                id="thumbnail"
                value={formData.thumbnail_url}
                onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={formData.is_published}
              onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
            />
            <Label htmlFor="published">Publish course (make it visible to students)</Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Course"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
