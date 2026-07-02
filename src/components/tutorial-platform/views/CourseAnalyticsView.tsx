import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BarChart3, Eye, Users, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const overviewStats = [
  { label: "Total Views", value: "36.5K", change: "+12%", up: true, icon: Eye, color: "from-blue-500 to-indigo-600" },
  { label: "Total Students", value: "10.4K", change: "+23%", up: true, icon: Users, color: "from-emerald-500 to-teal-600" },
  { label: "Avg Completion", value: "73%", change: "+5%", up: true, icon: TrendingUp, color: "from-purple-500 to-violet-600" },
  { label: "Total Revenue", value: "€10.2K", change: "+18%", up: true, icon: DollarSign, color: "from-amber-500 to-orange-600" },
];

const courseStats = [
  { title: "Complete Web Dev Bootcamp", views: 12400, enrollments: 3420, completionRate: 72, revenue: 4280, trend: "+15%" },
  { title: "Machine Learning Fundamentals", views: 8900, enrollments: 1850, completionRate: 65, revenue: 3120, trend: "+28%" },
  { title: "Digital Marketing Mastery", views: 15200, enrollments: 5200, completionRate: 81, revenue: 2890, trend: "+8%" },
];

interface Props { onBack: () => void; }

export function CourseAnalyticsView({ onBack }: Props) {
  return (
    <>
      <FloatingHowItWorks title={"Course Analytics View - How it works"} steps={[{ title: 'Open', desc: 'Access the Course Analytics View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Course Analytics View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black">Course Analytics</h2>
          <p className="text-sm text-muted-foreground">Performance insights & revenue tracking</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {overviewStats.map(stat => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-4 hover:shadow-lg transition-all">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-md`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-black">{stat.value}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <span className={`text-xs font-bold flex items-center ${stat.up ? "text-emerald-500" : "text-red-500"}`}>
                  {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{stat.change}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      <h3 className="text-lg font-bold mb-4">Course Performance</h3>
      <div className="space-y-4">
        {courseStats.map((course, i) => (
          <Card key={i} className="hover:shadow-lg transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <Badge className="bg-emerald-500/10 text-emerald-600 font-bold">{course.trend}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 text-center mb-3">
                <div>
                  <p className="text-lg font-black">{course.views.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Views</p>
                </div>
                <div>
                  <p className="text-lg font-black">{course.enrollments.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Enrollments</p>
                </div>
                <div>
                  <p className="text-lg font-black">{course.completionRate}%</p>
                  <p className="text-xs text-muted-foreground">Completion</p>
                </div>
                <div>
                  <p className="text-lg font-black text-emerald-600">€{course.revenue}</p>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                </div>
              </div>
              <Progress value={course.completionRate} className="h-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
    </>
  );
}