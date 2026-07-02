import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, AlertTriangle } from "lucide-react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const zones = [
  { region: "Southeast Asia", active: 3, severity: "high", emoji: "🌊", types: "Floods, Typhoons" },
  { region: "Southern Europe", active: 2, severity: "medium", emoji: "🔥", types: "Wildfires" },
  { region: "Central America", active: 1, severity: "high", emoji: "🌪️", types: "Hurricanes" },
  { region: "East Africa", active: 2, severity: "medium", emoji: "🌍", types: "Drought" },
  { region: "Western USA", active: 1, severity: "low", emoji: "🔥", types: "Wildfires" },
];

const severityColors: Record<string, string> = {
  high: "bg-destructive text-destructive-foreground",
  medium: "bg-accent text-accent-foreground",
  low: "bg-secondary text-secondary-foreground",
};

export function CrisisZoneOverview() {
  return (
    <>
      <FloatingHowItWorks title={"Crisis Zone Overview - How it works"} steps={[{ title: 'Open', desc: 'Access the Crisis Zone Overview section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Crisis Zone Overview.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <section className="py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">🌍 Active Crisis Zones</h2>
          <p className="text-muted-foreground">Current emergencies around the world</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {zones.map((z, i) => (
            <motion.div key={z.region} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <Card className="border-border/50 hover:shadow-lg hover:shadow-destructive/5 transition-all h-full">
                <CardContent className="pt-5 pb-4 text-center space-y-2">
                  <span className="text-3xl">{z.emoji}</span>
                  <h3 className="font-semibold text-sm text-foreground">{z.region}</h3>
                  <Badge className={severityColors[z.severity]}>
                    <AlertTriangle className="h-3 w-3 mr-1" /> {z.severity}
                  </Badge>
                  <p className="text-xs text-muted-foreground">{z.types}</p>
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {z.active} active campaigns
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
