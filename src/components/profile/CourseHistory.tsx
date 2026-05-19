import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Target, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CompletedCourse {
  id: string;
  course_name: string;
  completion_date: string;
  test_score: number;
  time_spent_minutes: number;
}

interface CourseProgress {
  id: string;
  course_name: string;
  current_topic: number;
  completed_topics: number[];
  last_accessed_at: string;
}

interface CourseHistoryProps {
  userId?: string;
}

export const CourseHistory = ({ userId }: CourseHistoryProps = {}) => {
  const { data: completedCourses, isLoading: loadingCompleted } = useQuery({
    queryKey: ["completed-courses", userId],
    queryFn: async () => {
      let targetId = userId;
      if (!targetId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");
        targetId = user.id;
      }

      const { data, error } = await supabase
        .from("completed_courses")
        .select("*")
        .eq("user_id", targetId)
        .order("completion_date", { ascending: false });

      if (error) throw error;
      return data as CompletedCourse[];
    },
    enabled: !!userId || userId === undefined,
  });

  const { data: inProgressCourses, isLoading: loadingProgress } = useQuery({
    queryKey: ["in-progress-courses", userId],
    queryFn: async () => {
      let targetId = userId;
      if (!targetId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");
        targetId = user.id;
      }

      const { data, error } = await supabase
        .from("course_progress")
        .select("*")
        .eq("user_id", targetId)
        .order("last_accessed_at", { ascending: false });

      if (error) throw error;
      return data as CourseProgress[];
    },
  });

  if (loadingCompleted || loadingProgress) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const totalCompleted = completedCourses?.length || 0;
  const totalInProgress = inProgressCourses?.length || 0;
  const averageScore = completedCourses?.length
    ? Math.round(
        completedCourses.reduce((sum, course) => sum + course.test_score, 0) /
          completedCourses.length
      )
    : 0;
  const totalTimeSpent = (completedCourses || []).reduce(
    (sum, course) => sum + course.time_spent_minutes,
    0
  );

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              Completed courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalCompleted}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              In progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalInProgress}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Average score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{averageScore}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Total time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{Math.round(totalTimeSpent / 60)}h</p>
          </CardContent>
        </Card>
      </div>

      {/* In Progress Courses */}
      {inProgressCourses && inProgressCourses.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Courses in progress</h3>
          <div className="grid gap-4">
            {inProgressCourses.map((course) => {
              const progress = (course.completed_topics.length / 10) * 100;
              return (
                <Card key={course.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{course.course_name}</CardTitle>
                      <Badge variant="outline">
                        {course.completed_topics.length}/10 topics
                      </Badge>
                    </div>
                    <CardDescription>
                      Last opened:{" "}
                      {new Date(course.last_accessed_at).toLocaleDateString("en-US")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress value={progress} className="h-2" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Courses */}
      {completedCourses && completedCourses.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Completed courses</h3>
          <div className="grid gap-4">
            {completedCourses.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      {course.course_name}
                    </CardTitle>
                    <Badge
                      variant={course.test_score >= 80 ? "default" : "secondary"}
                    >
                      {course.test_score}%
                    </Badge>
                  </div>
                  <CardDescription>
                    Completed: {new Date(course.completion_date).toLocaleDateString("en-US")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.time_spent_minutes} min</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {totalCompleted === 0 && totalInProgress === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
            <p className="text-muted-foreground">
              Start learning and your courses will appear here
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
