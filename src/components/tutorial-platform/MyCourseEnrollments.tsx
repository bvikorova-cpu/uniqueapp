import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, Play, Loader2, Users, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Enrollment {
  id: string;
  course_id: string;
  enrolled_at: string;
  progress_percentage: number;
  amount_paid: number;
  completed_at: string | null;
  courses: {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string;
    category: string;
    difficulty_level: string;
    duration_minutes: number;
  };
}

export const MyCourseEnrollments = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`
          id,
          course_id,
          enrolled_at,
          progress_percentage,
          amount_paid,
          completed_at,
          courses (
            id,
            title,
            description,
            thumbnail_url,
            category,
            difficulty_level,
            duration_minutes
          )
        `)
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;
      setEnrollments(data as unknown as Enrollment[] || []);
    } catch (error: any) {
      console.error("Error loading enrollments:", error);
      toast({
        title: "Error",
        description: "Failed to load your enrollments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
    <>
      <FloatingHowItWorks title={"My Course Enrollments - How it works"} steps={[{ title: 'Open', desc: 'Access the My Course Enrollments section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in My Course Enrollments.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    </>
  );
  }

  if (enrollments.length === 0) {
    return (
      <div className="text-center py-12">
        <GraduationCap className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">You haven't enrolled in any courses yet</p>
        <p className="text-sm text-muted-foreground mt-2">
          Browse available courses and enroll to start learning
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {enrollments.map((enrollment) => (
        <Card key={enrollment.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative h-40 bg-secondary/20">
            {enrollment.courses?.thumbnail_url ? (
              <img
                src={enrollment.courses.thumbnail_url}
                alt={enrollment.courses.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                <GraduationCap className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
            <div className="absolute top-2 right-2 flex gap-2">
              <Badge variant="secondary">{enrollment.courses?.category}</Badge>
              {enrollment.completed_at && (
                <Badge className="bg-green-500">Completed</Badge>
              )}
            </div>
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-1 line-clamp-1">{enrollment.courses?.title}</h3>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {enrollment.courses?.description}
            </p>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {enrollment.courses?.duration_minutes || 0}min
              </div>
              {enrollment.courses?.difficulty_level && (
                <Badge variant="outline" className="text-xs">
                  {enrollment.courses.difficulty_level}
                </Badge>
              )}
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{enrollment.progress_percentage || 0}%</span>
              </div>
              <Progress value={enrollment.progress_percentage || 0} className="h-2" />
            </div>

            <p className="text-xs text-muted-foreground mb-4">
              Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
            </p>

            <Button 
              className="w-full" 
              onClick={() => navigate(`/course/${enrollment.course_id}`)}
            >
              <Play className="w-4 h-4 mr-2" />
              {enrollment.completed_at ? "Review Course" : "Continue Learning"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
