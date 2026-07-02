import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Box } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Avatar3DProps {
  userId: string;
}

export const Avatar3D = ({ userId }: Avatar3DProps) => {
  const { data: profile } = useQuery({
    queryKey: ["avatar-3d", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("avatar_3d_url")
        .eq("id", userId)
        .maybeSingle();
      return data as { avatar_3d_url: string | null } | null;
    },
    enabled: !!userId,
  });

  if (!profile?.avatar_3d_url) return null;

  return (
    <>
      <FloatingHowItWorks title={"Avatar3 D - How it works"} steps={[{ title: 'Open', desc: 'Access the Avatar3 D section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Avatar3 D.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-post-card p-3 mb-6 border border-cyan-400/20 bg-gradient-to-br from-cyan-950/30 to-card/40 backdrop-blur-xl"
    >
      <div className="flex items-center gap-2 mb-2">
        <Box className="h-4 w-4 text-cyan-400" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300/80">3D Avatar</h3>
      </div>
      <div className="relative w-full aspect-square max-h-80 rounded-xl overflow-hidden bg-black/30">
        <iframe
          src={profile.avatar_3d_url}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen; xr-spatial-tracking"
          loading="lazy"
        />
      </div>
    </motion.div>
    </>
  );
};
