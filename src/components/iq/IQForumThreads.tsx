import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessagesSquare } from "lucide-react";

const THREADS = [
  { title: "Best memory training techniques?", replies: 24, hot: true },
  { title: "How to improve pattern recognition", replies: 18, hot: false },
  { title: "Daily routine for IQ growth", replies: 42, hot: true },
  { title: "Math vs verbal: which to prioritize?", replies: 15, hot: false },
  { title: "Sleep and cognitive performance", replies: 31, hot: false },
];

export default function IQForumThreads() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessagesSquare className="h-4 w-4 text-primary" /> Forum Threads
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {THREADS.map((t) => (
          <div key={t.title} className="flex justify-between items-start text-sm border-b border-border/40 pb-1 gap-2">
            <span>{t.hot && "🔥 "}{t.title}</span>
            <span className="text-xs text-muted-foreground shrink-0">{t.replies}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
