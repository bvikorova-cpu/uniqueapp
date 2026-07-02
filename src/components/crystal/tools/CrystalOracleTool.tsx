import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sun, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CRYSTAL_DATABASE } from "../crystalData";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export const CrystalOracleTool = () => {
  const [todayDraw, setTodayDraw] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [drawing, setDrawing] = useState(false);

  useEffect(() => { checkToday(); }, []);

  const checkToday = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }
    const today = new Date().toISOString().split("T")[0];
    const { data } = await (supabase as any).from("crystal_oracle_draws").select("*").eq("user_id", session.user.id).eq("drawn_at", today).maybeSingle();
    if (data) setTodayDraw(data);
    setLoading(false);
  };

  const drawCard = async () => {
    setDrawing(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error("Please sign in"); setDrawing(false); return; }

    const crystal = CRYSTAL_DATABASE[Math.floor(Math.random() * CRYSTAL_DATABASE.length)];
    
    // Get AI oracle guidance
    try {
      const { data, error } = await supabase.functions.invoke("crystal-ai-tool", {
        body: { toolType: "oracle", textInput: `Crystal: ${crystal.name}. Properties: ${crystal.properties}. Chakra: ${crystal.chakra}. Element: ${crystal.element}.` },
      });
      
      const guidance = error ? crystal.properties : data?.analysis || crystal.properties;
      const today = new Date().toISOString().split("T")[0];
      
      const { data: draw } = await (supabase as any).from("crystal_oracle_draws").insert({
        user_id: session.user.id,
        crystal_name: crystal.name,
        mantra: crystal.mantra,
        guidance,
        drawn_at: today,
      }).select().single();

      setTodayDraw(draw || { crystal_name: crystal.name, mantra: crystal.mantra, guidance });
      toast.success("Your daily crystal has been revealed! ✨");
    } catch {
      // Fallback without AI
      const today = new Date().toISOString().split("T")[0];
      const { data: draw } = await (supabase as any).from("crystal_oracle_draws").insert({
        user_id: session.user.id,
        crystal_name: crystal.name,
        mantra: crystal.mantra,
        guidance: `Today's crystal is ${crystal.name}. ${crystal.properties}. Focus on your ${crystal.chakra} chakra and work with the ${crystal.element} element.`,
        drawn_at: today,
      }).select().single();
      setTodayDraw(draw || { crystal_name: crystal.name, mantra: crystal.mantra, guidance: crystal.properties });
    }
    setDrawing(false);
  };

  const crystalInfo = todayDraw ? CRYSTAL_DATABASE.find(c => c.name === todayDraw.crystal_name) : null;

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <>
      <FloatingHowItWorks title={"Crystal Oracle Tool - How it works"} steps={[{ title: 'Open', desc: 'Access the Crystal Oracle Tool section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Crystal Oracle Tool.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/80 backdrop-blur-xl border-border/50">
      <CardHeader>
        <CardTitle className="text-xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
          <Sun className="w-5 h-5" /> Daily Crystal Oracle
        </CardTitle>
        <p className="text-sm text-muted-foreground">Receive your daily crystal guidance and mantra</p>
      </CardHeader>
      <CardContent>
        {todayDraw ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
              <div className="text-5xl mb-3">🔮</div>
              <h3 className="text-2xl font-black text-foreground mb-1">{todayDraw.crystal_name}</h3>
              {crystalInfo && (
                <div className="flex flex-wrap gap-2 justify-center mb-3">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{crystalInfo.chakra}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent-foreground">{crystalInfo.element}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{crystalInfo.color}</span>
                </div>
              )}
              <div className="p-3 rounded-xl bg-card/60 border border-border/30 mb-3">
                <p className="text-sm font-semibold italic text-primary">"{todayDraw.mantra}"</p>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{todayDraw.guidance}</p>
            </div>
            <p className="text-xs text-center text-muted-foreground">Come back tomorrow for a new crystal oracle card ✨</p>
          </motion.div>
        ) : (
          <div className="text-center py-10 space-y-4">
            <div className="text-6xl animate-pulse">🔮</div>
            <h3 className="text-lg font-bold">Your daily crystal awaits</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">Draw your crystal oracle card to receive today's guidance, mantra, and energy focus.</p>
            <Button onClick={drawCard} disabled={drawing} className="gap-2">
              {drawing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {drawing ? "Channeling..." : "Draw Today's Crystal"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
};
