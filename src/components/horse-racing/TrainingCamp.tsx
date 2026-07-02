import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dumbbell, Zap, Shield, Flame, Heart, TrendingUp } from "lucide-react";
import { useUserHorses, useTrainHorse } from "@/hooks/useHorseRacing";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const TrainingCamp = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { horses } = useUserHorses();
  const trainHorse = useTrainHorse();

  const handleTrain = (horseId: string, stat: 'speed' | 'stamina' | 'acceleration' | 'temperament') => {
    if (!user) { navigate("/auth"); return; }
    trainHorse.mutate({ horseId, statType: stat });
  };

  const statConfig = [
    { key: "speed" as const, label: "Speed", icon: Zap, color: "text-yellow-400", barColor: "bg-yellow-500", field: "speed_stat" },
    { key: "stamina" as const, label: "Stamina", icon: Shield, color: "text-blue-400", barColor: "bg-blue-500", field: "stamina_stat" },
    { key: "acceleration" as const, label: "Acceleration", icon: Flame, color: "text-orange-400", barColor: "bg-orange-500", field: "acceleration_stat" },
    { key: "temperament" as const, label: "Temperament", icon: Heart, color: "text-pink-400", barColor: "bg-pink-500", field: "temperament_stat" },
  ];

  return (
    <>
      <FloatingHowItWorks title={"Training Camp - How it works"} steps={[{ title: 'Open', desc: 'Access the Training Camp section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Training Camp.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black flex items-center gap-2">
          <Dumbbell className="h-6 w-6 text-emerald-400" /> Training Camp
        </h2>
        <p className="text-muted-foreground text-sm">Train your horses to improve stats. Cost: 20 Coins per session</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {horses?.map((horse, i) => (
          <motion.div
            key={horse.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-4 border-purple-500/10 bg-card/80 backdrop-blur-sm hover:border-purple-500/30 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg border-2 border-white/20 relative" style={{ backgroundColor: horse.color }}>
                  <div className="absolute -inset-1 rounded-xl blur-md opacity-30" style={{ backgroundColor: horse.color }} />
                </div>
                <div>
                  <h3 className="font-bold">{horse.name}</h3>
                  <p className="text-[10px] text-muted-foreground capitalize">Level {horse.level} • {horse.breed}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xs text-muted-foreground">{horse.total_wins}W / {horse.total_races}R</p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {statConfig.map(stat => {
                  const val = horse[stat.field as keyof typeof horse] as number;
                  return (
                    <div key={stat.key}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className={`flex items-center gap-1 ${stat.color}`}>
                          <stat.icon className="h-3 w-3" /> {stat.label}
                        </span>
                        <span className="font-bold">{val}/100</span>
                      </div>
                      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${val}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className={`h-full rounded-full ${stat.barColor}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {statConfig.map(stat => {
                  const val = horse[stat.field as keyof typeof horse] as number;
                  return (
                    <Button
                      key={stat.key}
                      size="sm"
                      variant="outline"
                      onClick={() => handleTrain(horse.id, stat.key)}
                      disabled={trainHorse.isPending || val >= 100}
                      className="text-[10px] uppercase tracking-wider"
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {stat.label}
                    </Button>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {(!horses || horses.length === 0) && (
        <div className="text-center py-12">
          <Dumbbell className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground text-sm">No horses to train. Buy your first horse!</p>
        </div>
      )}
    </div>
    </>
  );
};
