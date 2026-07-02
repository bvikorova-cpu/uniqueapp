import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const ForgeProgressPreview = () => {
  return (
    <>
      <FloatingHowItWorks title={"Forge Progress Preview - How it works"} steps={[{ title: 'Open', desc: 'Access the Forge Progress Preview section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Forge Progress Preview.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20 h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-4 h-4 text-primary" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-primary/40" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">No projects yet</p>
            <p className="text-xs text-muted-foreground">Generate your first content to track progress!</p>
          </div>
          <div className="space-y-3">
            {[
              { label: "Content generated", value: 0 },
              { label: "Credits used", value: 0 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-bold">{item.value}</span>
                </div>
                <Progress value={item.value} className="h-1.5" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
    </>
  );
};
