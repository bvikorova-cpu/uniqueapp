import { Flame, BarChart3, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";
import { useEscapeRoomRealStats } from "@/hooks/useEscapeRoomRealStats";
import { computeEscapeBadges } from "./escapeBadges";

export function EscapeRoomEngagement() {
  const { user, loading } = useEscapeRoomRealStats();
  const badges = computeEscapeBadges(user);
  const earned = badges.filter((b) => b.earned).length;
  const weekBadges = 0;

  const v = (n: number | string) => (loading ? "…" : n);

  return (
    <>
      <FloatingHowItWorks title={"Escape Room Engagement - How it works"} steps={[{ title: 'Open', desc: 'Access the Escape Room Engagement section from its module.' }, { title: 'Explore', desc: 'Review your live escape statistics.' }, { title: 'Interact', desc: 'Play rooms to update these numbers in real time.' }, { title: 'Review', desc: 'Track streaks, weekly progress and earned badges.' }]} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
challenge
      <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Escape Streak</p>
            <p className="text-2xl font-black">{v(`${user.streakDays} ${user.streakDays === 1 ? "Day" : "Days"}`)}</p>
            <p className="text-[10px] text-amber-500">
              {user.streakDays > 0 ? "Keep escaping daily!" : "Escape a room to start your streak"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-violet-500/5">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Weekly Stats</p>
            <p className="text-2xl font-black">{v(`${user.weeklyRooms} Rooms`)}</p>
            <p className="text-[10px] text-purple-500">{user.weeklyPuzzles} puzzles solved</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-green-500/5">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Achievements</p>
            <p className="text-2xl font-black">{v(`${earned} / ${badges.length}`)}</p>
            <p className="text-[10px] text-emerald-500">{user.totalXp} XP earned</p>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
