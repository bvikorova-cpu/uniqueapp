import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface TimelineEvent { id: string; child: string; childAvatar: string; type: string; emoji: string; title: string; description: string; time: string; duration?: string; }

const timelineEvents: TimelineEvent[] = [
  { id: "1", child: "Tommy", childAvatar: "🧒", type: "homework", emoji: "📝", title: "Completed math", description: "Solved 8 addition problems", time: "Today, 2:30 PM", duration: "15 min" },
  { id: "2", child: "Emma", childAvatar: "👧", type: "drawing", emoji: "🎨", title: "Drew a picture", description: "Rainbow unicorn with sparkles", time: "Today, 1:45 PM", duration: "20 min" },
  { id: "3", child: "Tommy", childAvatar: "🧒", type: "science", emoji: "🔬", title: "Color experiment", description: "Mixing primary colors", time: "Today, 11:00 AM", duration: "25 min" },
  { id: "4", child: "Emma", childAvatar: "👧", type: "story", emoji: "📖", title: "Read a story", description: "Adventure in the enchanted forest", time: "Today, 10:20 AM", duration: "12 min" },
  { id: "5", child: "Tommy", childAvatar: "🧒", type: "story", emoji: "✍️", title: "Wrote a story", description: "Space pirate and his cat", time: "Yesterday, 4:00 PM", duration: "30 min" },
  { id: "6", child: "Emma", childAvatar: "👧", type: "homework", emoji: "📝", title: "English vocabulary", description: "Learned 12 new words", time: "Yesterday, 3:00 PM", duration: "18 min" },
  { id: "7", child: "Tommy", childAvatar: "🧒", type: "game", emoji: "🎮", title: "Math quiz", description: "Score: 85/100", time: "Yesterday, 12:30 PM", duration: "10 min" },
  { id: "8", child: "Emma", childAvatar: "👧", type: "drawing", emoji: "🎨", title: "Paint by numbers", description: "Butterfly in the garden", time: "2 days ago", duration: "22 min" },
];

const typeColors: Record<string, string> = {
  homework: "bg-purple-100 text-purple-700", drawing: "bg-pink-100 text-pink-700",
  science: "bg-cyan-100 text-cyan-700", story: "bg-green-100 text-green-700", game: "bg-amber-100 text-amber-700",
};

export const ActivityTimeline = () => {
  const [filterChild, setFilterChild] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const filtered = timelineEvents.filter(e => !filterChild || e.child === filterChild);
  const displayed = showAll ? filtered : filtered.slice(0, 6);

  return (
    <>
      <FloatingHowItWorks title={"Activity Timeline - How it works"} steps={[{ title: 'Open', desc: 'Access the Activity Timeline section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Activity Timeline.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-blue-500" />Activity Timeline</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant={!filterChild ? "default" : "outline"} onClick={() => setFilterChild(null)} className="h-7 text-xs">All</Button>
              <Button size="sm" variant={filterChild === "Tommy" ? "default" : "outline"} onClick={() => setFilterChild("Tommy")} className="h-7 text-xs">🧒 Tommy</Button>
              <Button size="sm" variant={filterChild === "Emma" ? "default" : "outline"} onClick={() => setFilterChild("Emma")} className="h-7 text-xs">👧 Emma</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-300 via-pink-300 to-blue-300" />
            <div className="space-y-4">
              {displayed.map((event, i) => (
                <motion.div key={event.id} className="relative flex items-start gap-4 pl-12" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <div className="absolute left-[18px] top-2 w-3.5 h-3.5 rounded-full border-2 border-white bg-gradient-to-br from-purple-400 to-pink-400 shadow-sm" />
                  <div className="flex-1 bg-muted/30 hover:bg-muted/50 transition-colors rounded-xl p-3 border">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{event.emoji}</span>
                        <span className="font-medium text-sm">{event.title}</span>
                        <Badge className={`${typeColors[event.type]} h-5 text-[10px]`}>{event.child}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {event.duration && <span>⏱️ {event.duration}</span>}
                        <span>{event.time}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground ml-8">{event.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            {!showAll && filtered.length > 6 && (
              <div className="text-center mt-4"><Button variant="ghost" size="sm" onClick={() => setShowAll(true)}>Show all ({filtered.length})</Button></div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
    </>
  );
};
