import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Filter } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface TimelineEvent {
  id: string;
  child: string;
  childAvatar: string;
  type: string;
  emoji: string;
  title: string;
  description: string;
  time: string;
  duration?: string;
  preview?: string;
}

const timelineEvents: TimelineEvent[] = [
  { id: "1", child: "Tomáško", childAvatar: "🧒", type: "homework", emoji: "📝", title: "Dokončil matematiku", description: "Vyriešil 8 príkladov so sčítaním", time: "Dnes, 14:30", duration: "15 min" },
  { id: "2", child: "Emka", childAvatar: "👧", type: "drawing", emoji: "🎨", title: "Nakreslila obrázok", description: "Dúhový jednorožec s trblietkami", time: "Dnes, 13:45", duration: "20 min" },
  { id: "3", child: "Tomáško", childAvatar: "🧒", type: "science", emoji: "🔬", title: "Experiment s farbami", description: "Miešanie primárnych farieb", time: "Dnes, 11:00", duration: "25 min" },
  { id: "4", child: "Emka", childAvatar: "👧", type: "story", emoji: "📖", title: "Prečítala príbeh", description: "Dobrodružstvo v enchanted forest", time: "Dnes, 10:20", duration: "12 min" },
  { id: "5", child: "Tomáško", childAvatar: "🧒", type: "story", emoji: "✍️", title: "Napísal príbeh", description: "Vesmírny pirát a jeho mačka", time: "Včera, 16:00", duration: "30 min" },
  { id: "6", child: "Emka", childAvatar: "👧", type: "homework", emoji: "📝", title: "Slovíčka v angličtine", description: "Naučila sa 12 nových slov", time: "Včera, 15:00", duration: "18 min" },
  { id: "7", child: "Tomáško", childAvatar: "🧒", type: "game", emoji: "🎮", title: "Matematický kvíz", description: "Skóre: 85/100", time: "Včera, 12:30", duration: "10 min" },
  { id: "8", child: "Emka", childAvatar: "👧", type: "drawing", emoji: "🎨", title: "Maľovanie podľa čísiel", description: "Motýľ v záhrade", time: "Pred 2 dňami", duration: "22 min" },
];

const typeColors: Record<string, string> = {
  homework: "bg-purple-100 text-purple-700",
  drawing: "bg-pink-100 text-pink-700",
  science: "bg-cyan-100 text-cyan-700",
  story: "bg-green-100 text-green-700",
  game: "bg-amber-100 text-amber-700",
};

export const ActivityTimeline = () => {
  const [filterChild, setFilterChild] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const filtered = timelineEvents.filter(e => !filterChild || e.child === filterChild);
  const displayed = showAll ? filtered : filtered.slice(0, 6);

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Časová os aktivít
            </CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={!filterChild ? "default" : "outline"}
                onClick={() => setFilterChild(null)}
                className="h-7 text-xs"
              >
                Všetci
              </Button>
              <Button
                size="sm"
                variant={filterChild === "Tomáško" ? "default" : "outline"}
                onClick={() => setFilterChild("Tomáško")}
                className="h-7 text-xs"
              >
                🧒 Tomáško
              </Button>
              <Button
                size="sm"
                variant={filterChild === "Emka" ? "default" : "outline"}
                onClick={() => setFilterChild("Emka")}
                className="h-7 text-xs"
              >
                👧 Emka
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-300 via-pink-300 to-blue-300" />

            <div className="space-y-4">
              {displayed.map((event, i) => (
                <motion.div
                  key={event.id}
                  className="relative flex items-start gap-4 pl-12"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {/* Dot */}
                  <div className="absolute left-[18px] top-2 w-3.5 h-3.5 rounded-full border-2 border-white bg-gradient-to-br from-purple-400 to-pink-400 shadow-sm" />

                  <div className="flex-1 bg-muted/30 hover:bg-muted/50 transition-colors rounded-xl p-3 border">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{event.emoji}</span>
                        <span className="font-medium text-sm">{event.title}</span>
                        <Badge className={`${typeColors[event.type]} h-5 text-[10px]`}>
                          {event.child}
                        </Badge>
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
              <div className="text-center mt-4">
                <Button variant="ghost" size="sm" onClick={() => setShowAll(true)}>
                  Zobraziť všetky ({filtered.length})
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
