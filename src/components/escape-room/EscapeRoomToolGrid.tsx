import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Trophy, Award, Sparkles, ChevronRight } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";
import { useEscapeRoomRealStats } from "@/hooks/useEscapeRoomRealStats";


interface Props { onToolSelect: (id: string) => void; }

export function EscapeRoomToolGrid({ onToolSelect }: Props) {
  const { global, user } = useEscapeRoomRealStats();

  const tools = [
    { id: "browse", label: "Browse Rooms", desc: `${global.rooms} candle-lit chambers available`, icon: Lock, credits: 8 },
    { id: "leaderboard", label: "Leaderboard", desc: `${global.escapes} escapes recorded, ranked live`, icon: Trophy },
    { id: "badges", label: "Achievement Badges", desc: `${user.completed} rooms escaped by you`, icon: Award },
  ];

  return (
    <>
      <FloatingHowItWorks title={"Escape Room Tool Grid - How it works"} steps={[{ title: 'Open', desc: 'Access the Escape Room Tool Grid section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Escape Room Tool Grid.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tools.map(tool => {
          const Icon = tool.icon;
          return (
            <Card
              key={tool.id}
              onClick={() => onToolSelect(tool.id)}
              className="group relative cursor-pointer overflow-hidden border-amber-500/20 bg-gradient-to-b from-foreground/[0.06] to-transparent backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/50 hover:shadow-[0_18px_45px_-18px_hsl(38_92%_50%/0.45)]"
            >
              {/* haunted glow */}
              <div className="pointer-events-none absolute -top-16 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-amber-400/10 blur-3xl transition-opacity duration-500 group-hover:bg-amber-400/25" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
              <CardContent className="relative p-6">
                <div className="mb-5 flex items-start justify-between">
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/25 via-background/40 to-background shadow-inner">
                    <Icon className="h-6 w-6 text-amber-400 drop-shadow-[0_0_10px_hsl(38_92%_50%/0.6)] transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  {tool.credits && (
                    <Badge variant="outline" className="border-amber-400/30 bg-amber-500/10 text-[10px] tracking-widest text-amber-400">
                      <Sparkles className="mr-1 h-2.5 w-2.5" />{tool.credits} CR
                    </Badge>
                  )}
                </div>
                <h3 className="mb-1 text-lg font-black uppercase tracking-[0.18em] text-foreground/90 transition-colors group-hover:text-amber-300">
                  {tool.label}
                </h3>
                <p className="text-xs italic text-muted-foreground">{tool.desc}</p>
                <div className="mt-5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-400/70 transition-all group-hover:gap-2 group-hover:text-amber-300">
                  Enter <ChevronRight className="h-3 w-3" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
