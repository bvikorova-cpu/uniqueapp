import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, History, Clock, Trophy, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export function EscapeHistoryView({ onBack }: Props) {
  const history = [
    { room: "Haunted Manor", date: "2 hours ago", time: "28:34", score: 850, hints: 1, result: "Escaped" },
    { room: "Cyberpunk Heist 2077", date: "Yesterday", time: "42:17", score: 620, hints: 3, result: "Escaped" },
    { room: "Dragon's Lair", date: "3 days ago", time: "60:00", score: 0, hints: 5, result: "Failed" },
    { room: "Mars Colony Mystery", date: "5 days ago", time: "35:12", score: 780, hints: 2, result: "Escaped" },
    { room: "Detective's Office", date: "1 week ago", time: "22:45", score: 920, hints: 0, result: "Escaped" },
    { room: "Wizard's Tower", date: "1 week ago", time: "38:50", score: 710, hints: 2, result: "Escaped" },
  ];

  return (
    <>
      <FloatingHowItWorks title={"Escape History View - How it works"} steps={[{ title: 'Open', desc: 'Access the Escape History View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Escape History View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center shadow-lg">
            <History className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">My Escape History</h2>
            <p className="text-muted-foreground">Track all your completed & attempted rooms</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="border-emerald-500/20 bg-emerald-500/5"><CardContent className="p-3 text-center"><div className="text-2xl font-black text-emerald-500">5</div><div className="text-xs text-muted-foreground">Escaped</div></CardContent></Card>
          <Card className="border-red-500/20 bg-red-500/5"><CardContent className="p-3 text-center"><div className="text-2xl font-black text-red-500">1</div><div className="text-xs text-muted-foreground">Failed</div></CardContent></Card>
          <Card className="border-amber-500/20 bg-amber-500/5"><CardContent className="p-3 text-center"><div className="text-2xl font-black text-amber-500">780</div><div className="text-xs text-muted-foreground">Avg Score</div></CardContent></Card>
        </div>

        <div className="space-y-3">
          {history.map((h, i) => (
            <Card key={i} className={h.result === "Failed" ? "border-red-500/20" : "border-emerald-500/10"}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1">
                  <div className="font-bold text-sm">{h.room}</div>
                  <div className="text-xs text-muted-foreground">{h.date}</div>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{h.time}</span>
                  <span className="flex items-center gap-1"><Trophy className="w-3 h-3" />{h.score}</span>
                  <span>{h.hints} hints</span>
                </div>
                <Badge variant={h.result === "Escaped" ? "default" : "destructive"} className="text-[10px]">
                  {h.result}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}
