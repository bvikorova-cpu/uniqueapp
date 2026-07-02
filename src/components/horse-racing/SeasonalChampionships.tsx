import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Calendar, Medal, Crown, Star, Users, Zap, Timer, ChevronRight } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useUserHorses } from "@/hooks/useHorseRacing";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const SEASONS = [
  { id: "spring_cup", name: "Spring Cup Championship", prize: 5000, entryFee: 100, minLevel: 3, maxParticipants: 32, icon: "🌸" },
  { id: "summer_derby", name: "Summer Grand Derby", prize: 10000, entryFee: 250, minLevel: 5, maxParticipants: 16, icon: "☀️" },
  { id: "autumn_classic", name: "Autumn Classic Stakes", prize: 15000, entryFee: 500, minLevel: 8, maxParticipants: 8, icon: "🍂" },
  { id: "winter_crown", name: "Winter Crown Invitational", prize: 25000, entryFee: 1000, minLevel: 10, maxParticipants: 4, icon: "❄️" },
];

export const SeasonalChampionships = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { horses } = useUserHorses();
  const [selectedHorse, setSelectedHorse] = useState("");
  const [enrollingSeason, setEnrollingSeason] = useState<string | null>(null);

  const { data: enrollments = [] } = useQuery({
    queryKey: ["championship-enrollments"],
    queryFn: async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) return [];
      const { data } = await (supabase as any)
        .from("horse_championship_entries")
        .select("*")
        .eq("user_id", u.id);
      return data || [];
    },
  });

  const enrollMutation = useMutation({
    mutationFn: async ({ seasonId, horseId }: { seasonId: string; horseId: string }) => {
      const { data, error } = await supabase.functions.invoke("horse-championship-enroll", {
        body: { seasonId, horseId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Successfully enrolled in championship!");
      queryClient.invalidateQueries({ queryKey: ["championship-enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["horse-currency"] });
      setEnrollingSeason(null);
      setSelectedHorse("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const isEnrolled = (seasonId: string) => enrollments.some((e: any) => e.season_id === seasonId);

  return (
    <>
      <FloatingHowItWorks title={"Seasonal Championships - How it works"} steps={[{ title: 'Open', desc: 'Access the Seasonal Championships section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Seasonal Championships.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black font-mono flex items-center gap-2 text-white">
          <Trophy className="h-6 w-6 text-amber-400" /> Seasonal Championships
        </h2>
        <p className="text-amber-400/50 font-mono text-sm">Compete in monthly tournaments for massive prize pools</p>
      </div>

      {/* Season Timeline */}
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-amber-400/40 via-amber-400/20 to-transparent" />
        
        <div className="space-y-4">
          {SEASONS.map((season, i) => {
            const enrolled = isEnrolled(season.id);
            const eligibleHorses = horses?.filter(h => h.level >= season.minLevel) || [];
            
            return (
              <motion.div
                key={season.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="ml-12 relative p-4 sm:p-5 bg-slate-900/60 border-amber-500/15 backdrop-blur-sm hover:border-amber-400/40 transition-all group">
                  {/* Timeline dot */}
                  <div className="absolute -left-[3.25rem] top-5 w-4 h-4 rounded-full border-2 border-amber-400 bg-slate-950 group-hover:bg-amber-400/20 transition-colors" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{season.icon}</span>
                        <h3 className="font-bold font-mono text-white">{season.name}</h3>
                        {enrolled && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                            Enrolled
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-3 mt-2 text-xs font-mono">
                        <span className="flex items-center gap-1 text-amber-400">
                          <Trophy className="h-3 w-3" /> {season.prize.toLocaleString()} Coins Prize
                        </span>
                        <span className="flex items-center gap-1 text-amber-400/50">
                          <Zap className="h-3 w-3" /> {season.entryFee} Entry Fee
                        </span>
                        <span className="flex items-center gap-1 text-amber-400/50">
                          <Star className="h-3 w-3" /> Min Level {season.minLevel}
                        </span>
                        <span className="flex items-center gap-1 text-amber-400/50">
                          <Users className="h-3 w-3" /> {season.maxParticipants} Max
                        </span>
                      </div>
                    </div>

                    {!enrolled && (
                      <div className="flex flex-col gap-2">
                        {enrollingSeason === season.id ? (
                          <div className="flex gap-2">
                            <Select value={selectedHorse} onValueChange={setSelectedHorse}>
                              <SelectTrigger className="w-40 bg-slate-800/60 border-amber-500/20 font-mono text-xs">
                                <SelectValue placeholder="Pick horse" />
                              </SelectTrigger>
                              <SelectContent>
                                {eligibleHorses.map(h => (
                                  <SelectItem key={h.id} value={h.id}>{h.name} (Lvl {h.level})</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button size="sm" onClick={() => {
                              if (!selectedHorse) { toast.error("Select a horse"); return; }
                              enrollMutation.mutate({ seasonId: season.id, horseId: selectedHorse });
                            }}
                              disabled={enrollMutation.isPending}
                              className="bg-gradient-to-r from-amber-600 to-red-600 text-white font-mono text-xs"
                            >
                              {enrollMutation.isPending ? "..." : "Enroll"}
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" onClick={() => {
                            if (!user) { navigate("/auth"); return; }
                            if (eligibleHorses.length === 0) { toast.error(`Need a horse level ${season.minLevel}+`); return; }
                            setEnrollingSeason(season.id);
                          }}
                            className="bg-slate-800/60 border border-amber-500/20 text-amber-400 hover:bg-amber-950/40 font-mono text-xs"
                          >
                            <ChevronRight className="h-3 w-3 mr-1" /> Enter
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Prize Breakdown */}
                  <div className="mt-3 pt-3 border-t border-amber-500/10 grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: "1st Place", value: `${Math.round(season.prize * 0.5)}`, icon: "🥇" },
                      { label: "2nd Place", value: `${Math.round(season.prize * 0.3)}`, icon: "🥈" },
                      { label: "3rd Place", value: `${Math.round(season.prize * 0.2)}`, icon: "🥉" },
                    ].map(p => (
                      <div key={p.label} className="text-xs font-mono">
                        <span className="text-lg">{p.icon}</span>
                        <p className="text-amber-400 font-bold">{p.value}</p>
                        <p className="text-amber-400/40">{p.label}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Info */}
      <Card className="p-4 bg-slate-900/40 border-amber-500/10">
        <h3 className="font-bold font-mono text-sm text-amber-300 mb-2">📜 Championship Rules</h3>
        <ul className="text-xs text-amber-400/50 font-mono space-y-1">
          <li>• Championships run monthly with bracket-style elimination rounds</li>
          <li>• Horse stats, equipment, and weather conditions affect race outcomes</li>
          <li>• Prize pools are distributed to top 3 finishers</li>
          <li>• Entry fees are non-refundable once the tournament begins</li>
        </ul>
      </Card>
    </div>
    </>
  );
};
