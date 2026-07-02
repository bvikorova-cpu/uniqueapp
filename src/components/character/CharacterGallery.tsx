import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Zap, Shield, Heart, Star, Crown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const CharacterGallery = () => {
  const { data: characters } = useQuery({
    queryKey: ["all-characters"],
    queryFn: async () => {
      const { data, error } = await supabase.from("characters").select("*").order("popularity_score", { ascending: false }).limit(50);
      if (error) throw error;
      return data;
    },
  });

  return (
    <>
      <FloatingHowItWorks title={"Character Gallery - How it works"} steps={[{ title: 'Open', desc: 'Access the Character Gallery section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Character Gallery.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Card className="relative overflow-hidden border-border/30 bg-card/90 backdrop-blur-xl p-6 mb-6">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-purple-500 to-pink-500" />
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-purple-600">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Hall of Legends</h2>
            <p className="text-muted-foreground text-sm">The most powerful and popular warriors</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters?.map((char, index) => (
          <motion.div
            key={char.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.02, y: -4 }}
          >
            <Card className="relative overflow-hidden border-border/30 bg-card/90 backdrop-blur-xl hover:border-primary/40 transition-all group">
              <div className={`absolute top-0 left-0 right-0 h-1 ${index === 0 ? "bg-gradient-to-r from-yellow-400 to-amber-500" : index === 1 ? "bg-gradient-to-r from-gray-300 to-gray-400" : index === 2 ? "bg-gradient-to-r from-amber-600 to-amber-700" : "bg-gradient-to-r from-border to-border/50"}`} />
              
              <div className="relative">
                {index < 3 && (
                  <Badge className={`absolute top-3 right-3 z-10 ${index === 0 ? "bg-gradient-to-r from-yellow-400 to-amber-500" : index === 1 ? "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800" : "bg-gradient-to-r from-amber-600 to-amber-700"} text-white font-bold`}>
                    <Trophy className="h-3 w-3 mr-1" /> #{index + 1}
                  </Badge>
                )}
                {char.image_url && (
                  <img src={char.image_url} alt={char.name} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500" />
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-white text-sm">{char.name}</h3>
                    <Badge className="bg-primary/80 text-primary-foreground text-[10px]">Lv.{char.level}</Badge>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{char.category}</Badge>
                  {char.is_premium && <Badge className="bg-amber-500/20 text-amber-400 text-[10px]"><Star className="h-2.5 w-2.5 mr-0.5" /> Premium</Badge>}
                </div>

                <p className="text-muted-foreground text-xs line-clamp-2">{char.description}</p>

                <div className="grid grid-cols-4 gap-2">
                  {[
                    { icon: Heart, value: char.hp, label: "HP", color: "text-red-400" },
                    { icon: Zap, value: char.attack, label: "ATK", color: "text-amber-400" },
                    { icon: Shield, value: char.defense, label: "DEF", color: "text-blue-400" },
                    { icon: Trophy, value: `${char.wins}/${char.losses}`, label: "W/L", color: "text-green-400" },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center p-2 bg-card/50 rounded-lg border border-border/20">
                      <stat.icon className={`h-3.5 w-3.5 ${stat.color} mx-auto mb-0.5`} />
                      <p className="font-bold text-xs">{stat.value}</p>
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
