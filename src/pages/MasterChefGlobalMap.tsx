import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const regions = [
  { name: "Europe", chefs: 4200, flag: "🇪🇺", competitions: 89, color: "from-blue-500 to-indigo-500" },
  { name: "North America", chefs: 3100, flag: "🇺🇸", competitions: 67, color: "from-red-500 to-orange-500" },
  { name: "Asia", chefs: 5800, flag: "🌏", competitions: 124, color: "from-yellow-500 to-amber-500" },
  { name: "South America", chefs: 1900, flag: "🌎", competitions: 34, color: "from-green-500 to-emerald-500" },
  { name: "Africa", chefs: 890, flag: "🌍", competitions: 18, color: "from-purple-500 to-violet-500" },
  { name: "Oceania", chefs: 620, flag: "🇦🇺", competitions: 12, color: "from-cyan-500 to-teal-500" },
];

export default function MasterChefGlobalMap() {
  const navigate = useNavigate();

  return (
    <>
      <FloatingHowItWorks title="How Master Chef Global Map works" steps={[
          { title: 'Explore the feature', desc: 'Browse the options and pick what interests you.' },
          { title: 'Interact', desc: 'Tap actions, generate content, or make a selection. AI actions cost 2-5 credits.' },
          { title: 'Review results', desc: 'Check the output, share, save or purchase where available.' },
          { title: 'Come back', desc: 'Progress and history are saved to your account.' },
        ]} />
      <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/masterchef-subscription")}>← Back</Button>
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-2">
            Global Kitchen Map
          </h1>
          <p className="text-muted-foreground text-lg">See where chefs compete worldwide</p>
        </div>

        {/* World Stats */}
        <Card className="bg-gradient-to-br from-sky-500/10 to-cyan-500/10 border-sky-500/20">
          <CardContent className="p-6 text-center">
            <Globe className="h-12 w-12 mx-auto mb-3 text-sky-500" />
            <h3 className="text-2xl font-bold mb-1">16,510+ Active Chefs Worldwide</h3>
            <p className="text-muted-foreground">Across 6 continents, 85+ countries</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {regions.map((region, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{region.flag}</span>
                    {region.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Active Chefs</span>
                      <span className="font-bold">{region.chefs.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Competitions</span>
                      <span className="font-bold">{region.competitions}</span>
                    </div>
                    <div className={`h-2 rounded-full bg-gradient-to-r ${region.color}`} style={{ width: `${(region.chefs / 5800) * 100}%` }} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
    </>
    );
}
