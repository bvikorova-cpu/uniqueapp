import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PlusCircle, TrendingUp } from "lucide-react";
import { CourseForm } from "@/components/course-creator/CourseForm";
import { CoursesList } from "@/components/course-creator/CoursesList";
import { CreatorEarnings } from "@/components/course-creator/CreatorEarnings";

export default function CourseCreatorDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access the creator dashboard",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setLoading(false);
  };

  const handleCourseCreated = () => {
    setShowCourseForm(false);
    setSelectedCourseId(null);
    setRefreshKey(prev => prev + 1);
    toast({
      title: "Success",
      description: "Course saved successfully",
    });
  };

  const handleEditCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setShowCourseForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Course Creator Dashboard</h1>
              <p className="text-muted-foreground">Manage your courses and track your earnings</p>
            </div>
            <Button size="lg" onClick={() => setShowCourseForm(true)}>
              <PlusCircle className="mr-2 h-5 w-5" />
              Create New Course
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6 mt-8">
            <div className="p-6 rounded-lg bg-card border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Platform Fee</span>
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div className="text-2xl font-bold">20%</div>
            </div>
            <div className="p-6 rounded-lg bg-card border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">You Earn</span>
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary">80%</div>
            </div>
            <div className="p-6 rounded-lg bg-card border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Per Sale</span>
              </div>
              <div className="text-sm text-muted-foreground">Of each course purchase</div>
            </div>
            <div className="p-6 rounded-lg bg-card border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Lifetime Access</span>
              </div>
              <div className="text-sm text-muted-foreground">For all students</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2">
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="mt-6">
            {showCourseForm ? (
              <CourseForm
                courseId={selectedCourseId}
                onSuccess={handleCourseCreated}
                onCancel={() => {
                  setShowCourseForm(false);
                  setSelectedCourseId(null);
                }}
              />
            ) : (
              <CoursesList
                key={refreshKey}
                onEditCourse={handleEditCourse}
              />
            )}
          </TabsContent>

          <TabsContent value="earnings" className="mt-6">
            <CreatorEarnings />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
