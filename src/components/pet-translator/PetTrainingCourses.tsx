import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, GraduationCap, Lock } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const COURSES = [
  { id: "puppy30", title: "30-Day Puppy Foundation", lessons: 30, level: "Beginner", desc: "Sit, stay, leash, potty training, socialization." },
  { id: "kitten",  title: "Kitten Confidence (14 days)", lessons: 14, level: "Beginner", desc: "Litter, scratch posts, handling, play routines." },
  { id: "leash",   title: "Loose Leash in 21 Days",      lessons: 21, level: "Intermediate", desc: "Stop pulling. Heel. Polite greetings." },
  { id: "tricks",  title: "10 Crowd-Pleaser Tricks",     lessons: 10, level: "All levels",  desc: "Spin, high-five, play dead, roll over." },
  { id: "anxiety", title: "Calm & Relaxed (Separation Anxiety)", lessons: 21, level: "Advanced", desc: "Desensitization protocol, alone-time training." },
];

export default function PetTrainingCourses({ onBack }: { onBack: () => void }) {
  return (
    <>
      <FloatingHowItWorks title="How Pet Training Courses works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-4">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <Card className="p-6">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><GraduationCap className="w-5 h-5 text-primary" /> Training Mini-Courses</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {COURSES.map((c) => (
            <div key={c.id} className="p-4 rounded-lg border border-border/40 hover:border-primary/40 transition-all">
              <div className="flex items-center justify-between mb-1">
                <Badge variant="outline">{c.level}</Badge>
                <span className="text-xs text-muted-foreground">{c.lessons} lessons</span>
              </div>
              <h3 className="font-bold mt-1">{c.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-3">{c.desc}</p>
              <Button size="sm" className="w-full" variant="outline" disabled><Lock className="w-3.5 h-3.5 mr-1" />Coming Soon</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
    </>
    );
}
