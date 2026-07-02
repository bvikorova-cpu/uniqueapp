import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users2 } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const CLANS = [
  { name: "Mensa Elite", members: 142, score: 8420 },
  { name: "Logic Lords", members: 98, score: 7150 },
  { name: "Quantum Minds", members: 76, score: 6890 },
  { name: "Neural Knights", members: 64, score: 5430 },
  { name: "Synapse Squad", members: 51, score: 4820 },
];

export default function IQClanList() {
  return (
    <>
      <FloatingHowItWorks title="How IQClan List works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users2 className="h-4 w-4 text-primary" /> Top Clans
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {CLANS.map((c, i) => (
          <div key={c.name} className="flex justify-between items-center text-sm border-b border-border/40 pb-1">
            <span><span className="text-primary font-semibold">#{i + 1}</span> {c.name}</span>
            <span className="text-xs text-muted-foreground">{c.members}m · {c.score}pts</span>
          </div>
        ))}
      </CardContent>
    </Card>
    </>
    );
}
