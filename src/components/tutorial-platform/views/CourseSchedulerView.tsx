import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Plus, Clock, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";

const mockSchedule = [
  { id: 1, course: "Web Dev Bootcamp", lesson: "Module 5: APIs", date: "Apr 8, 2026", time: "10:00", status: "scheduled" },
  { id: 2, course: "ML Fundamentals", lesson: "Module 3: Neural Networks", date: "Apr 10, 2026", time: "14:00", status: "scheduled" },
  { id: 3, course: "Digital Marketing", lesson: "Module 7: Analytics", date: "Apr 12, 2026", time: "09:00", status: "draft" },
  { id: 4, course: "Python Advanced", lesson: "Module 2: Decorators", date: "Apr 15, 2026", time: "16:00", status: "draft" },
];

interface Props { onBack: () => void; }

export function CourseSchedulerView({ onBack }: Props) {
  const [creating, setCreating] = useState(false);

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black flex items-center gap-2"><Calendar className="w-6 h-6 text-purple-500" />Course Scheduler</h2>
        <Button onClick={() => setCreating(!creating)}><Plus className="w-4 h-4 mr-2" />Schedule Release</Button>
      </div>

      {creating && (
        <Card className="mb-6">
          <CardContent className="pt-6 space-y-3">
            <Input placeholder="Course name..." />
            <Input placeholder="Lesson title..." />
            <div className="grid grid-cols-2 gap-3">
              <Input type="date" />
              <Input type="time" />
            </div>
            <Button className="w-full"><Calendar className="w-4 h-4 mr-2" />Schedule</Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {mockSchedule.map(item => (
          <Card key={item.id} className="p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{item.lesson}</h3>
                <p className="text-sm text-muted-foreground">{item.course}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{item.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.time}</span>
                </div>
              </div>
              <Badge variant={item.status === "scheduled" ? "default" : "secondary"}>{item.status}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
