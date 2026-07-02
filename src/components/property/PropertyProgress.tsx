import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, Target } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const PropertyProgress = () => {
  const navigate = useNavigate();
  return (
    <>
      <FloatingHowItWorks title={"Property Progress - How it works"} steps={[{ title: 'Open', desc: 'Access the Property Progress section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Property Progress.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
      <Card className="bg-gradient-to-r from-blue-500/10 via-primary/10 to-accent/10 border-primary/20 overflow-hidden relative h-full">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Search className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Quick Search</h3>
              <p className="text-[10px] text-muted-foreground">AI-powered • Smart filters • Instant results</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Matching</span>
            <span className="flex items-center gap-1"><Target className="w-3 h-3" /> Price Analysis</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="p-2 rounded-lg bg-background/50 border border-border/30 text-center">
              <div className="text-lg font-black text-blue-500">0</div>
              <div className="text-[10px] text-muted-foreground">Searches</div>
            </div>
            <div className="p-2 rounded-lg bg-background/50 border border-border/30 text-center">
              <div className="text-lg font-black text-accent">0</div>
              <div className="text-[10px] text-muted-foreground">Saved</div>
            </div>
          </div>

          <Button className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:opacity-90 text-white" size="sm" onClick={() => navigate("/property-marketplace")}>
            <Search className="w-4 h-4 mr-2" />
            Search Now
          </Button>
        </CardContent>
      </Card>
    </motion.div>
    </>
  );
};
