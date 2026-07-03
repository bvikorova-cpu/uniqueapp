import { Card } from "@/components/ui/card";
import { Zap, Trophy, MessageCircle, Heart, Sparkles, Users } from "lucide-react";
import { lazy, Suspense } from "react";

const FloatingHowItWorks = lazy(() => import("../common/FloatingHowItWorks"));

interface XpBreakdownProps {
  xp: number;
  level: number;
  posts: number;
  likes: number;
  comments: number;
  friends: number;
}

export const XpBreakdown = ({ xp, level, posts, likes, comments, friends }: XpBreakdownProps) => {
  const rows = [
    { label: "Posts", value: posts, icon: Sparkles, color: "text-amber-300" },
    { label: "Likes given", value: likes, icon: Heart, color: "text-pink-400" },
    { label: "Comments", value: comments, icon: MessageCircle, color: "text-violet-300" },
    { label: "Friends", value: friends, icon: Users, color: "text-emerald-300" },
  ];

  return (
    <>
      <Suspense fallback={null}>
        <FloatingHowItWorks title={"Xp Breakdown - How it works"} steps={[{ title: 'Open', desc: 'Access the Xp Breakdown section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Xp Breakdown.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      </Suspense>
      <Card className="p-4 mb-4 bg-card/60 backdrop-blur-md border-amber-500/15">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-semibold">Level {level}</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-300">
          <Zap className="h-4 w-4" />
          <span className="font-black text-lg">{xp.toLocaleString()} XP</span>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {rows.map((r) => (
          <div
            key={r.label}
            className="rounded-lg bg-muted/30 border border-border/40 px-2.5 py-2 text-center"
          >
            <r.icon className={`h-3.5 w-3.5 mx-auto mb-1 ${r.color}`} />
            <div className="text-base font-bold">{r.value.toLocaleString()}</div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{r.label}</div>
          </div>
        ))}
      </div>
    </Card>
    </>
  );
};
