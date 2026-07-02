import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Heart, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const stories = [
  { type: "🐕 Dog", name: "A rescued dog", outcome: "Adopted & healthy!", emoji: "🏠" },
  { type: "🐈 Cat", name: "A stray kitten", outcome: "Surgery successful!", emoji: "💊" },
  { type: "🐦 Bird", name: "An injured bird", outcome: "Released to wildlife!", emoji: "🌿" },
];

export const PetSuccessStories = () => {
  const navigate = useNavigate();

  return (
    <>
      <FloatingHowItWorks title={"Pet Success Stories - How it works"} steps={[{ title: 'Open', desc: 'Access the Pet Success Stories section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Pet Success Stories.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
          <Trophy className="h-4 w-4 text-emerald-500" />
          <span className="text-sm font-medium text-emerald-500">Happy Endings</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">Rescue Success Stories</h2>
        <p className="text-muted-foreground mt-2">Animals that found love thanks to your support</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stories.map((story, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
            <Card className="p-6 h-full border-emerald-500/20 bg-emerald-500/5 hover:shadow-lg transition-shadow text-center">
              <div className="text-4xl mb-3">{story.emoji}</div>
              <Badge variant="secondary" className="mb-3">{story.type}</Badge>
              <h3 className="font-bold text-foreground mb-2">{story.name}</h3>
              <div className="flex items-center justify-center gap-2 mt-3 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                <Home className="h-4 w-4" /> {story.outcome}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-8">
        <Button size="lg" onClick={() => navigate("/fundraising/pet/create")} className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white">
          Help an Animal <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>
    </div>
    </>
  );
};
