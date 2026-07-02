import { Flame, BarChart3, Award } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function GlamourEngagement() {
  return (
    <>
      <FloatingHowItWorks title={"Glamour Engagement - How it works"} steps={[{ title: 'Open', desc: 'Access the Glamour Engagement section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Glamour Engagement.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-400/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="h-5 w-5 text-pink-400" />
          <span className="font-bold text-sm">7-Day Streak</span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6, 7].map((d) => (
            <div key={d} className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${d <= 3 ? "bg-pink-500 text-white" : "bg-muted text-muted-foreground"}`}>
              {d}
            </div>
          ))}
        </div>
      </div>
      <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-400/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-5 w-5 text-purple-400" />
          <span className="font-bold text-sm">This Week</span>
        </div>
        <p className="text-2xl font-black text-purple-400">24</p>
        <p className="text-xs text-muted-foreground">creations made</p>
      </div>
      <div className="bg-gradient-to-br from-rose-500/10 to-rose-500/5 border border-rose-400/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Award className="h-5 w-5 text-rose-400" />
          <span className="font-bold text-sm">Achievements</span>
        </div>
        <p className="text-2xl font-black text-rose-400">7/30</p>
        <p className="text-xs text-muted-foreground">unlocked</p>
      </div>
    </div>
    </>
  );
}
