import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, TrendingUp, Users, BookOpen, Calendar } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface EarningsSummary {
  totalEarnings: number;
  totalEnrollments: number;
  totalCourses: number;
  monthlyEarnings: number;
}

interface EnrollmentDetail {
  id: string;
  course_title: string;
  enrolled_at: string;
  price: number;
  creator_earning: number;
}

export function CreatorEarnings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<EarningsSummary>({
    totalEarnings: 0,
    totalEnrollments: 0,
    totalCourses: 0,
    monthlyEarnings: 0,
  });
  const [recentEnrollments, setRecentEnrollments] = useState<EnrollmentDetail[]>([]);

  useEffect(() => {
    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all creator's courses
      const { data: courses } = await supabase
        .from("courses")
        .select("id, title, price, total_enrollments")
        .eq("creator_id", user.id);

      if (!courses) {
        setLoading(false);
        return;
      }

      // Calculate total earnings (80% of all course prices * enrollments)
      let totalEarnings = 0;
      let totalEnrollments = 0;

      courses.forEach((course) => {
        const enrollments = course.total_enrollments || 0;
        totalEnrollments += enrollments;
        totalEarnings += course.price * 0.8 * enrollments;
      });

      // Get enrollments from the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: enrollments } = await supabase
        .from("course_enrollments")
        .select(`
          id,
          enrolled_at,
          courses (
            title,
            price
          )
        `)
        .in("course_id", courses.map((c) => c.id))
        .gte("enrolled_at", thirtyDaysAgo.toISOString())
        .order("enrolled_at", { ascending: false })
        .limit(10);

      let monthlyEarnings = 0;
      const enrollmentDetails: EnrollmentDetail[] = [];

      enrollments?.forEach((enrollment: any) => {
        const price = enrollment.courses?.price || 0;
        const creatorEarning = price * 0.8;
        monthlyEarnings += creatorEarning;

        enrollmentDetails.push({
          id: enrollment.id,
          course_title: enrollment.courses?.title || "Unknown Course",
          enrolled_at: enrollment.enrolled_at,
          price,
          creator_earning: creatorEarning,
        });
      });

      setSummary({
        totalEarnings,
        totalEnrollments,
        totalCourses: courses.length,
        monthlyEarnings,
      });

      setRecentEnrollments(enrollmentDetails);
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

  if (loading) {
    return (
      <>
        <FloatingHowItWorks title="How Creator Earnings works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
        <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading earnings...</p>
      </div>
      </>
      );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              €{summary.totalEarnings.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              80% of all course sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{summary.monthlyEarnings.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">
              Across all courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              Active courses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Enrollments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Enrollments</CardTitle>
          <CardDescription>Your latest student enrollments from the past 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          {recentEnrollments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No enrollments in the last 30 days
            </div>
          ) : (
            <div className="space-y-3">
              {recentEnrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{enrollment.course_title}</p>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Course: €{enrollment.price.toFixed(2)}
                    </p>
                    <p className="font-semibold text-primary">
                      You earned: €{enrollment.creator_earning.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Earnings Info */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            How Earnings Work
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• You earn <strong>80%</strong> from each course sale</p>
          <p>• Platform takes <strong>20%</strong> to cover hosting, payment processing, and maintenance</p>
          <p>• Students get <strong>lifetime access</strong> to your courses</p>
          <p>• Payments are processed securely through Stripe</p>
          <p>• Track your earnings in real-time from this dashboard</p>
        </CardContent>
      </Card>
    </div>
  );
}
