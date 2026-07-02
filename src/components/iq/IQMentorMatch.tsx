import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";
import { toast } from "sonner";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const MENTORS = [
  { name: "Dr. Alex Kim", field: "Logic & Reasoning", rating: 4.9 },
  { name: "Prof. Maya Chen", field: "Mathematics", rating: 4.8 },
  { name: "Dr. Jordan Lee", field: "Memory Training", rating: 4.7 },
];

const KEY = "iq_mentor_match";

export default function IQMentorMatch() {
  const [matched, setMatched] = useState<string | null>(null);
  useEffect(() => { setMatched(localStorage.getItem(KEY)); }, []);

  const pick = (name: string) => {
    localStorage.setItem(KEY, name);
    setMatched(name);
    toast.success(`Matched with ${name}`);
  };

  return (
    <>
      <FloatingHowItWorks title="How IQMentor Match works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <GraduationCap className="h-4 w-4 text-primary" /> Mentor Match
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {matched && <div className="text-xs text-primary mb-2">Current mentor: {matched}</div>}
        {MENTORS.map((m) => (
          <div key={m.name} className="flex justify-between items-center text-sm border-b border-border/40 pb-2">
            <div>
              <div className="font-medium">{m.name}</div>
              <div className="text-xs text-muted-foreground">{m.field} · ★ {m.rating}</div>
            </div>
            <Button size="sm" variant={matched === m.name ? "default" : "outline"} onClick={() => pick(m.name)}>
              {matched === m.name ? "✓" : "Match"}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
    </>
    );
}
