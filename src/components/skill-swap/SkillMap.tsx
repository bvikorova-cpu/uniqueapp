import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, MapPin, Users, Star, MessageSquare, ArrowLeft, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface SkillMapProps {
  onBack: () => void;
}

export const SkillMap = ({ onBack }: SkillMapProps) => {
  const [selectedSwapper, setSelectedSwapper] = useState<any | null>(null);
  const navigate = useNavigate();

  const { data: swappers = [], isLoading } = useQuery({
    queryKey: ['skill-map-swappers'],
    queryFn: async () => {
      const { data: offerings } = await supabase
        .from('skill_offerings')
        .select('id, title, category, location, user_id, price_per_hour')
        .eq('is_active', true)
        .limit(50);

      if (!offerings?.length) return [];

      const userIds = [...new Set(offerings.map(o => o.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, location')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return offerings.map((o, i) => {
        const profile = profileMap.get(o.user_id);
        // Distribute pins pseudo-randomly based on index
        const x = 15 + ((i * 37) % 70);
        const y = 20 + ((i * 53) % 55);
        return {
          id: o.id,
          name: profile?.full_name || 'User',
          location: o.location || profile?.location || '—',
          skills: [o.title],
          category: o.category,
          x,
          y,
          userId: o.user_id,
        };
      });
    },
  });

  if (isLoading) {
    return (
    <>
      <FloatingHowItWorks title={"Skill Map - How it works"} steps={[{ title: 'Open', desc: 'Access the Skill Map section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Skill Map.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </>
  );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Hub
      </Button>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" /> Skill Map
        </h2>
        <Badge variant="secondary" className="text-xs">
          <Users className="w-3 h-3 mr-1" /> {swappers.length} Offerings
        </Badge>
      </div>

      {swappers.length === 0 ? (
        <Card className="p-12 text-center bg-card/80 backdrop-blur-xl border-border/50">
          <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-bold text-lg mb-2">No Swappers Yet</h3>
          <p className="text-sm text-muted-foreground">Be the first to offer a skill and appear on the map!</p>
        </Card>
      ) : (
        <>
          {/* Map */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border-border/50 p-2">
            <div className="relative w-full aspect-[2/1] min-h-[300px] bg-gradient-to-b from-blue-500/5 to-emerald-500/5 rounded-xl overflow-hidden">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {[20, 40, 60, 80].map(y => (
                  <line key={`h-${y}`} x1="0" y1={y} x2="100" y2={y} stroke="hsl(var(--border))" strokeWidth="0.15" strokeDasharray="1 1" />
                ))}
                {[20, 40, 60, 80].map(x => (
                  <line key={`v-${x}`} x1={x} y1="0" x2={x} y2="100" stroke="hsl(var(--border))" strokeWidth="0.15" strokeDasharray="1 1" />
                ))}
              </svg>

              {swappers.map((swapper, i) => (
                <motion.div
                  key={swapper.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="absolute cursor-pointer group z-10"
                  style={{ left: `${swapper.x}%`, top: `${swapper.y}%`, transform: "translate(-50%, -50%)" }}
                  onClick={() => setSelectedSwapper(swapper)}
                >
                  <div className="absolute inset-0 w-8 h-8 -m-1 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: `${2 + i * 0.3}s` }} />
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2 transition-all
                    ${selectedSwapper?.id === swapper.id 
                      ? "bg-primary text-primary-foreground border-primary scale-125 ring-4 ring-primary/30" 
                      : "bg-card text-foreground border-border/50 hover:border-primary/50 hover:scale-110"
                    }`}
                  >
                    📍
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                    <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-lg px-3 py-1.5 shadow-xl whitespace-nowrap">
                      <p className="text-xs font-bold">{swapper.name}</p>
                      <p className="text-[10px] text-muted-foreground">{swapper.location}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Selected Swapper Detail */}
          {selectedSwapper && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-5 bg-card/80 backdrop-blur-xl border-primary/20">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-black text-lg">{selectedSwapper.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {selectedSwapper.location}
                    </p>
                  </div>
                  <Button size="sm" className="gap-1.5" onClick={() => {
                    if (!selectedSwapper.user_id) { toast.error("User not available"); return; }
                    navigate(`/messenger?to=${selectedSwapper.user_id}`);
                  }}>
                    <MessageSquare className="w-3.5 h-3.5" /> Connect
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedSwapper.skills.map((skill: string) => (
                    <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
};