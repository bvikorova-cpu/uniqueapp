import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, TrendingUp } from "lucide-react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const resolved = [
  { title: "Flood Relief — Manila", raised: 12400, helped: 340, days: 5, emoji: "🌊", type: "Flood" },
  { title: "Wildfire Recovery — Athens", raised: 8700, helped: 180, days: 8, emoji: "🔥", type: "Fire" },
  { title: "Earthquake Aid — Istanbul", raised: 25300, helped: 890, days: 3, emoji: "🏚️", type: "Disaster" },
  { title: "Tornado Relief — Oklahoma", raised: 6200, helped: 120, days: 6, emoji: "🌪️", type: "Disaster" },
];

export function ResolvedEmergencies() {
  return (
    <>
      <FloatingHowItWorks title={"Resolved Emergencies - How it works"} steps={[{ title: 'Open', desc: 'Access the Resolved Emergencies section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Resolved Emergencies.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <section className="py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">✅ Resolved Emergencies</h2>
          <p className="text-muted-foreground">Crises where community response made a difference</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {resolved.map((r, i) => (
            <motion.div key={r.title} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Card className="border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all h-full">
                <CardContent className="pt-6 pb-4 text-center space-y-3">
                  <span className="text-4xl">{r.emoji}</span>
                  <h3 className="font-bold text-sm text-foreground">{r.title}</h3>
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    <CheckCircle className="h-3 w-3 mr-1" /> Resolved in {r.days} days
                  </Badge>
                  <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> €{r.raised.toLocaleString()}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {r.helped} helped</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
    </>
  );
}
