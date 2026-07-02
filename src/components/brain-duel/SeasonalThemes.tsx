import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const SeasonalThemes = () => {
  const { data: themes } = useQuery({
    queryKey: ["brain-duel-seasonal-themes"],
    queryFn: async () => {
      const { data } = await supabase
        .from("brain_duel_seasonal_themes")
        .select("*")
        .order("is_active", { ascending: false });
      return data || [];
    },
  });

  const activeTheme = themes?.find((t: any) => t.is_active);

  if (!activeTheme) return null;

  return (
    <>
      <FloatingHowItWorks title={"Seasonal Themes - How it works"} steps={[{ title: 'Open', desc: 'Access the Seasonal Themes section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Seasonal Themes.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card
        className="border-primary/20 overflow-hidden relative"
        style={{
          background: `linear-gradient(135deg, ${activeTheme.gradient_from}15, ${activeTheme.gradient_to}15)`,
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: `linear-gradient(135deg, ${activeTheme.gradient_from}, ${activeTheme.gradient_to})`,
          }}
        />
        <CardContent className="relative p-4 flex items-center gap-4">
          <motion.span
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-4xl"
          >
            {activeTheme.emoji}
          </motion.span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-sm">{activeTheme.name}</h3>
              <Badge
                className="text-[10px] border-0 text-white shadow-md"
                style={{
                  background: `linear-gradient(90deg, ${activeTheme.gradient_from}, ${activeTheme.gradient_to})`,
                }}
              >
                ACTIVE
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{activeTheme.description}</p>
            {activeTheme.ends_at && (
              <p className="text-[10px] text-muted-foreground mt-1">
                Ends: {new Date(activeTheme.ends_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
    </>
  );
};
