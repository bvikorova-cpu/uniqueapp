import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Zap, Shield, Heart, Star, Crown, Gauge, Backpack, Wind } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface LeaderboardRow {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  description: string | null;
  image_url: string | null;
  hp: number | null;
  attack: number | null;
  defense: number | null;
  speed: number | null;
  special_power: string | null;
  level: number | null;
  wins: number | null;
  losses: number | null;
  is_premium: boolean | null;
  gear_bonus: number | null;
  gear_count: number | null;
  total_power: number | null;
}

export const CharacterGallery = () => {
  const { data: characters, isLoading } = useQuery({
    queryKey: ["character-power-leaderboard"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc("character_power_leaderboard", { _limit: 50 });
      if (error) throw error;
      return (data || []) as LeaderboardRow[];
    },
  });

  const { data: myUserId } = useQuery({
    queryKey: ["auth-user-id"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id ?? null;
    },
  });

  return (
    <>
      <FloatingHowItWorks
        title={"Hall of Legends - How it works"}
        steps={[
          { title: "Global ranking", desc: "This is a leaderboard of every warrior created by all users on the platform." },
          { title: "How power is scored", desc: "Total Power = HP + Attack + Defense + Speed + (Level x 10) + all equipment bonuses your hero owns." },
          { title: "Climb the ranks", desc: "Level up in Training Center, buy stronger gear in the Equipment Shop, and win battles." },
          { title: "Top 3", desc: "The strongest warrior overall sits at #1 with gold, silver and bronze badges for the podium." },
        ]}
      />
      <div>
        <Card className="relative overflow-hidden border-border/30 bg-card/90 backdrop-blur-xl p-6 mb-6">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-purple-500 to-pink-500" />
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-purple-600">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Hall of Legends</h2>
              <p className="text-muted-foreground text-sm">
                Global leaderboard — the strongest warriors of all users, ranked by total power (stats + level + equipment).
              </p>
            </div>
          </div>
        </Card>

        {isLoading && <p className="text-sm text-muted-foreground">Loading ranking…</p>}
        {!isLoading && !characters?.length && (
          <p className="text-sm text-muted-foreground">No warriors yet — forge the first legend.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters?.map((char, index) => (
            <motion.div
              key={char.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index, 12) * 0.05, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.02, y: -4 }}
            >
              <Card className={`relative overflow-hidden bg-card/90 backdrop-blur-xl transition-all group ${myUserId && char.user_id === myUserId ? "border-primary/60" : "border-border/30 hover:border-primary/40"}`}>
                <div className={`absolute top-0 left-0 right-0 h-1 ${index === 0 ? "bg-gradient-to-r from-yellow-400 to-amber-500" : index === 1 ? "bg-gradient-to-r from-gray-300 to-gray-400" : index === 2 ? "bg-gradient-to-r from-amber-600 to-amber-700" : "bg-gradient-to-r from-border to-border/50"}`} />

                <div className="relative">
                  <Badge className={`absolute top-3 right-3 z-10 font-bold ${index === 0 ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-white" : index === 1 ? "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800" : index === 2 ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white" : "bg-card/90 text-foreground border border-border/40"}`}>
                    <Trophy className="h-3 w-3 mr-1" /> #{index + 1}
                  </Badge>
                  {myUserId && char.user_id === myUserId && (
                    <Badge className="absolute top-3 left-3 z-10 bg-primary text-primary-foreground text-[10px] font-bold">Your hero</Badge>
                  )}
                  {char.image_url && (
                    <img src={char.image_url} alt={`${char.name} — ranked #${index + 1} warrior`} loading="lazy" className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500" />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-white text-sm">{char.name}</h3>
                      <Badge className="bg-primary/80 text-primary-foreground text-[10px]">Lv.{char.level ?? 1}</Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] font-bold">
                      <Gauge className="h-2.5 w-2.5 mr-1" /> Power {char.total_power ?? 0}
                    </Badge>
                    {(char.gear_count ?? 0) > 0 && (
                      <Badge variant="outline" className="text-[10px]">
                        <Backpack className="h-2.5 w-2.5 mr-1" /> {char.gear_count} gear (+{char.gear_bonus ?? 0})
                      </Badge>
                    )}
                    {char.category && <Badge variant="outline" className="text-[10px]">{char.category}</Badge>}
                    {char.is_premium && <Badge className="bg-amber-500/20 text-amber-400 text-[10px]"><Star className="h-2.5 w-2.5 mr-0.5" /> Premium</Badge>}
                  </div>

                  <p className="text-muted-foreground text-xs line-clamp-2">{char.description}</p>

                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { icon: Heart, value: char.hp ?? 0, label: "HP", color: "text-red-400" },
                      { icon: Zap, value: char.attack ?? 0, label: "ATK", color: "text-amber-400" },
                      { icon: Shield, value: char.defense ?? 0, label: "DEF", color: "text-blue-400" },
                      { icon: Wind, value: char.speed ?? 0, label: "SPD", color: "text-cyan-400" },
                      { icon: Trophy, value: `${char.wins ?? 0}/${char.losses ?? 0}`, label: "W/L", color: "text-green-400" },
                    ].map((stat) => (
                      <div key={stat.label} className="text-center p-1.5 bg-card/50 rounded-lg border border-border/20">
                        <stat.icon className={`h-3.5 w-3.5 ${stat.color} mx-auto mb-0.5`} />
                        <p className="font-bold text-[11px]">{stat.value}</p>
                        <p className="text-[9px] text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {char.special_power && (
                    <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 text-xs">
                      <span className="text-amber-400 font-bold">⚡ Special:</span> <span className="text-muted-foreground">{char.special_power}</span>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
};
