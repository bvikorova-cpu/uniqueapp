import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Clock, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Course {
  id: string;
  title: string;
  description: string;
  instructor_name: string;
  price: number;
  duration_hours: number;
  level: string;
  image_url: string | null;
  topics: string[];
  learning_outcomes: string[];
}

const PremiumCourses = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
    if (user) {
      fetchEnrollments();
    }
    
    // Handle payment success
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      handlePaymentSuccess(params.get('session_id'));
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('premium_courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await (supabase as any)
        .from('user_course_enrollments')
        .select('course_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setEnrolledCourses(new Set((data || []).map((e: any) => e.course_id)));
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  const handlePaymentSuccess = async (sessionId: string | null) => {
    if (!sessionId) return;
    
    try {
      const { error } = await supabase.functions.invoke('enroll-premium-course', {
        body: { sessionId }
      });
      
      if (error) throw error;
      
      toast({
        title: "Enrollment Successful!",
        description: "You now have access to this course",
      });
      
      fetchEnrollments();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handlePurchase = async (course: Course) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to purchase courses",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    setPurchasing(course.id);
    try {
      const { data, error } = await supabase.functions.invoke('purchase-premium-course', {
        body: { 
          courseId: course.id,
          priceInCents: Math.round(course.price * 100)
        }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to initiate purchase",
        variant: "destructive",
      });
    } finally {
      setPurchasing(null);
    }
  };

  const goToCourse = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  if (loading) {
    return (
      <>
        <FloatingHowItWorks title="How Premium Courses works" steps={[
          { title: 'Explore', desc: 'Browse the learning content or tool.' },
          { title: 'Start / generate', desc: 'Take a course, quiz or AI action (2-5 credits where applicable).' },
          { title: 'Track progress', desc: 'Your XP, badges and completion are saved.' },
          { title: 'Level up', desc: 'Unlock next lessons, leaderboards and rewards.' },
        ]} />
        <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
      </>
      );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Premium Courses
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Invest in your future with our comprehensive courses. One-time purchase, lifetime access.
          </p>
        </div>

        {courses.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No courses available at the moment.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => {
              const isEnrolled = enrolledCourses.has(course.id);
              const isPurchasing = purchasing === course.id;
              
              return (
                <Card key={course.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2">
                  {course.image_url && (
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={course.image_url} 
                        alt={course.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary">{course.level}</Badge>
                      {isEnrolled && (
                        <Badge className="bg-green-500">Enrolled</Badge>
                      )}
                    </div>

                    <h3 className="text-2xl font-black mb-2">{course.title}</h3>
                    <p className="text-muted-foreground mb-4">{course.description}</p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration_hours} hours</span>
                      </div>
                    </div>

                    {course.topics.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold mb-2">What you'll learn:</p>
                        <div className="flex flex-wrap gap-2">
                          {course.topics.map((topic, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Instructor</p>
                        <p className="text-xs text-muted-foreground">{course.instructor_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="text-3xl font-bold text-primary">€{course.price}</p>
                        <p className="text-xs text-muted-foreground">One-time payment</p>
                      </div>
                      {isEnrolled ? (
                        <Button
                          onClick={() => goToCourse(course.id)}
                          size="lg"
                        >
                          Go to Course
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handlePurchase(course)}
                          disabled={isPurchasing}
                          size="lg"
                        >
                          {isPurchasing ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            "Purchase Course"
                          )}
                        </Button>
                      )}
                    </div>

                    <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span className="font-semibold">Lifetime access • Certificate of completion</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default PremiumCourses;
