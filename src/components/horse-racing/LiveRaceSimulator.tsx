import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Play, Eye, Zap, Timer, Flag } from "lucide-react";
import { useUserHorses, useRaces, useJoinRace } from "@/hooks/useHorseRacing";
import { RaceTrack3D } from "./RaceTrack3D";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const LiveRaceSimulator = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { horses } = useUserHorses();
  const { races } = useRaces();
  const joinRace = useJoinRace();
  const [selectedRace, setSelectedRace] = useState<string | null>(null);
  const [selectedHorse, setSelectedHorse] = useState("");
  const [strategy, setStrategy] = useState("balanced");
  const [showJoinDialog, setShowJoinDialog] = useState(false);

  const activeRace = races?.find(r => r.id === selectedRace);

  const handleJoin = () => {
    if (!user) { navigate("/auth"); return; }
    if (!selectedHorse || !selectedRace) { toast.error("Select a horse"); return; }
    joinRace.mutate({ raceId: selectedRace, horseId: selectedHorse, strategy }, {
      onSuccess: () => { setShowJoinDialog(false); setSelectedHorse(""); }
    });
  };

  if (selectedRace && activeRace) {
    return (
    <>
      <FloatingHowItWorks title={"Live Race Simulator - How it works"} steps={[{ title: 'Open', desc: 'Access the Live Race Simulator section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Live Race Simulator.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-4">
        <Button variant="outline" onClick={() => setSelectedRace(null)} className="gap-2">
          ← Back to Races
        </Button>
        <RaceTrack3D
          participants={activeRace.race_participants.map((p: any) => ({
            id: p.id, horse: p.horses, position: p.position || 0, progress: 0,
          }))}
          isRaceActive={activeRace.status === "running"}
          onRaceComplete={async (results) => {
            try {
              const { data, error } = await supabase.functions.invoke("calculate-race-results", {
                body: { raceId: selectedRace },
              });
              if (error) throw error;
              if (data?.results) {
                const winner = data.results[0];
                toast.success(`Race finished! Winner: ${winner.horseName}${winner.prize > 0 ? ` — Prize: ${winner.prize} coins` : ""}`);
              }
            } catch (error) {
              toast.error("Error calculating race results");
            }
            queryClient.invalidateQueries({ queryKey: ["active-races"] });
            queryClient.invalidateQueries({ queryKey: ["user-horses"] });
            queryClient.invalidateQueries({ queryKey: ["horse-currency"] });
            setSelectedRace(null);
          }}
        />
      </div>
    </>
  );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black flex items-center gap-2">
          <Flag className="h-6 w-6 text-amber-400" /> Live Race Simulator
        </h2>
        <p className="text-muted-foreground text-sm">Watch real-time race simulations with multiple camera angles</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {races?.map((race, i) => (
          <motion.div
            key={race.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-4 border-purple-500/10 bg-card/80 backdrop-blur-sm hover:border-purple-500/30 transition-all group">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-bold text-base">{race.track_name}</h3>
                  <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Timer className="h-3 w-3" /> {race.distance}m</span>
                    <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> {race.entry_fee_coins} Coins</span>
                    <span className="flex items-center gap-1">👥 {race.race_participants?.length || 0}/{race.max_participants}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 capitalize">
                    Weather: {race.weather} • Track: {race.track_condition}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedRace(race.id)}>
                    <Eye className="h-3.5 w-3.5 mr-1" /> Watch
                  </Button>
                  <Button size="sm" onClick={() => { if (!user) { navigate("/auth"); return; } setSelectedRace(race.id); setShowJoinDialog(true); }}
                    className="bg-gradient-to-r from-purple-600 to-amber-600 text-white"
                  >
                    <Play className="h-3.5 w-3.5 mr-1" /> Join
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}

        {(!races || races.length === 0) && (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm">No races available right now</p>
          </div>
        )}
      </div>

      {/* Join race inline */}
      {showJoinDialog && (
        <Card className="p-4 border-amber-500/20 bg-card/80">
          <h3 className="font-bold mb-3">Select Horse & Strategy</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <Select value={selectedHorse} onValueChange={setSelectedHorse}>
              <SelectTrigger><SelectValue placeholder="Choose horse" /></SelectTrigger>
              <SelectContent>
                {horses?.map(h => (
                  <SelectItem key={h.id} value={h.id}>{h.name} (Lvl {h.level})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={strategy} onValueChange={setStrategy}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="aggressive">Aggressive — Early sprint</SelectItem>
                <SelectItem value="balanced">Balanced — Steady pace</SelectItem>
                <SelectItem value="conservative">Conservative — Save energy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowJoinDialog(false)}>Cancel</Button>
            <Button onClick={handleJoin} disabled={joinRace.isPending}
              className="bg-gradient-to-r from-purple-600 to-amber-600 text-white"
            >
              {joinRace.isPending ? "Joining..." : "Confirm Join"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
