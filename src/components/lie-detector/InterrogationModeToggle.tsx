import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Skull, Eye } from "lucide-react";
import { useInterrogationMode } from "@/hooks/useLieDetectorTuning";
import { useEffect } from "react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const InterrogationModeToggle = () => {
  const { data, toggle } = useInterrogationMode();
  const on = !!data?.interrogation_mode;

  useEffect(() => {
    if (on) document.documentElement.classList.add("interrogation-mode");
    else document.documentElement.classList.remove("interrogation-mode");
    return () => document.documentElement.classList.remove("interrogation-mode");
  }, [on]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-3 px-3 py-2 rounded-lg bg-card/60 backdrop-blur-md border border-red-500/30"
    >
      {on ? <Skull className="w-4 h-4 text-red-400" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
      <div className="flex-1">
        <p className="text-xs font-bold">Dark Interrogation Mode</p>
        <p className="text-[10px] text-muted-foreground">Red noir filter across the app</p>
      </div>
      <Switch checked={on} onCheckedChange={(v) => toggle.mutate(v)} />
    </motion.div>
  );
};
