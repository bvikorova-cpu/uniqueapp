import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BarChart3, Eye, Users, TrendingUp, DollarSign } from "lucide-react";

const courseStats = [
  { title: "Complete Web Dev Bootcamp", views: 12400, enrollments: 3420, completionRate: 72, revenue: 4280 },
  { title: "Machine Learning Fundamentals", views: 8900, enrollments: 1850, completionRate: 65, revenue: 3120 },
  { title: "Digital Marketing Mastery", views: 15200, enrollments: 5200, completionRate: 81, revenue: 2890 },
];

interface Props { onBack: () => void; }

export function CourseAnalyticsView({ onBack }: Props) {
  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <h2 className="text-2xl font-black mb-6 flex items-center gap-2"><BarChart3 className="w-6 h-6 text-teal-500" />Course Analytics</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 text-center">
          <Eye className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">36.5K</p>
          <p className="text-xs text-muted-foreground">Total Views</p>
        </Card>
        <Card className="p-4 text-center">
          <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">10.4K</p>
          <p className="text-xs text-muted-foreground">Total Students</p>
        </Card>
        <Card className="p-4 text-center">
          <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">73%</p>
          <p className="text-xs text-muted-foreground">Avg Completion</p>
        </Card>
        <Card className="p-4 text-center">
          <DollarSign className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">€10.2K</p>
          <p className="text-xs text-muted-foreground">Total Revenue</p>
        </Card>
      </div>

      <div className="space-y-4">
        {courseStats.map((course, i) => (
          <Card key={i}>
            <CardHeader className="pb-2"><CardTitle className="text-lg">{course.title}</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold">{course.views.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Views</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{course.enrollments.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Enrollments</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{course.completionRate}%</p>
                  <p className="text-xs text-muted-foreground">Completion</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-emerald-600">€{course.revenue}</p>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
