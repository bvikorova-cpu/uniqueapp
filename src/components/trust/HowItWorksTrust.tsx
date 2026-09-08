import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Trophy, Coins } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const STEPS = [
  { icon: Sparkles, title: "Sign up free", desc: "Get 10 free credits instantly. No credit card required." },
  { icon: Coins, title: "Vote, create & engage", desc: "Use credits to vote, comment, upload talents or play games." },
  { icon: Trophy, title: "Win real prizes", desc: "Top talents earn real cash in quarterly prizes — the pool grows with every subscription." },
];

export function HowItWorksTrust() {
  return (
    <>
      <FloatingHowItWorks title={"How It Works Trust - How it works"} steps={[{ title: 'Open', desc: 'Access the How It Works Trust section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in How It Works Trust.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <section className="py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* steps */}
        <div className="text-center space-y-2">
          <Badge variant="secondary" className="gap-1"><Sparkles className="h-3 w-3" /> How it works</Badge>
          <h2 className="text-3xl md:text-4xl font-bold">Win in 3 simple steps</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Card className="h-full backdrop-blur-xl bg-card/60 border-primary/20">
                  <CardContent className="p-6 text-center space-y-3">
                    <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                      <Icon className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Step {i + 1}</p>
                      <h3 className="font-bold text-lg">{s.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
    </>
  );
}

export default HowItWorksTrust;
