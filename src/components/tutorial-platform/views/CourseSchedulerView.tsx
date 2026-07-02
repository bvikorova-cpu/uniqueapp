import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Plus, Clock, BookOpen, CheckCircle, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const initialSchedule = [
  { id: 1, course: "Web Dev Bootcamp", lesson: "Module 5: APIs", date: "Apr 8, 2026", time: "10:00", status: "scheduled" },
  { id: 2, course: "ML Fundamentals", lesson: "Module 3: Neural Networks", date: "Apr 10, 2026", time: "14:00", status: "scheduled" },
  { id: 3, course: "Digital Marketing", lesson: "Module 7: Analytics", date: "Apr 12, 2026", time: "09:00", status: "draft" },
  { id: 4, course: "Python Advanced", lesson: "Module 2: Decorators", date: "Apr 15, 2026", time: "16:00", status: "draft" },
];

interface Props { onBack: () => void; }

export function CourseSchedulerView({ onBack }: Props) {
  const { toast } = useToast();
  const [creating, setCreating] = useState(false);
  const [schedule, setSchedule] = useState(initialSchedule);
  const [courseName, setCourseName] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const addSchedule = () => {
    if (!courseName.trim() || !lessonTitle.trim()) {
      toast({ title: "Missing Fields", description: "Fill in all fields", variant: "destructive" });
      return;
    }
    setSchedule(prev => [...prev, {
      id: Date.now(),
      course: courseName,
      lesson: lessonTitle,
      date: date || "TBD",
      time: time || "TBD",
      status: "draft"
    }]);
    setCourseName(""); setLessonTitle(""); setDate(""); setTime("");
    setCreating(false);
    toast({ title: "Release Scheduled!" });
  };

  return (
    <>
      <FloatingHowItWorks title={"Course Scheduler View - How it works"} steps={[{ title: 'Open', desc: 'Access the Course Scheduler View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Course Scheduler View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Course Scheduler</h2>
            <p className="text-sm text-muted-foreground">Plan & schedule content releases</p>
          </div>
        </div>
        <Button onClick={() => setCreating(!creating)} className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700">
          <Plus className="w-4 h-4 mr-2" />Schedule Release
        </Button>
      </div>

      {creating && (
        <Card className="mb-6 border-purple-500/20">
          <CardContent className="pt-6 space-y-3">
            <Input placeholder="Course name..." value={courseName} onChange={e => setCourseName(e.target.value)} className="h-11" />
            <Input placeholder="Lesson title..." value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} className="h-11" />
            <div className="grid grid-cols-2 gap-3">
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-11" />
              <Input type="time" value={time} onChange={e => setTime(e.target.value)} className="h-11" />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 bg-gradient-to-r from-purple-500 to-violet-600" onClick={addSchedule}><Calendar className="w-4 h-4 mr-2" />Schedule</Button>
              <Button variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {schedule.map(item => (
          <Card key={item.id} className="p-4 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  item.status === "scheduled" ? "bg-emerald-500/20" : "bg-amber-500/20"
                }`}>
                  {item.status === "scheduled" ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-amber-500" />}
                </div>
                <div>
                  <h3 className="font-bold">{item.lesson}</h3>
                  <p className="text-sm text-muted-foreground">{item.course}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{item.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.time}</span>
                  </div>
                </div>
              </div>
              <Badge variant={item.status === "scheduled" ? "default" : "secondary"} className={item.status === "scheduled" ? "bg-emerald-500" : ""}>
                {item.status}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
    </>
  );
}