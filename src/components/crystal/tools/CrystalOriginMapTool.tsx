import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from "lucide-react";
import { CRYSTAL_DATABASE } from "../crystalData";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const REGIONS = ["All", "Africa", "Asia", "Europe", "North America", "South America", "Oceania", "Caribbean"];

export const CrystalOriginMapTool = () => {
  const [selectedRegion, setSelectedRegion] = useState("All");

  const filtered = selectedRegion === "All" ? CRYSTAL_DATABASE : CRYSTAL_DATABASE.filter(c => c.region === selectedRegion);
  const regionCounts = REGIONS.slice(1).map(r => ({ name: r, count: CRYSTAL_DATABASE.filter(c => c.region === r).length }));

  return (
    <>
      <FloatingHowItWorks title={"Crystal Origin Map Tool - How it works"} steps={[{ title: 'Open', desc: 'Access the Crystal Origin Map Tool section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Crystal Origin Map Tool.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/80 backdrop-blur-xl border-border/50">
      <CardHeader>
        <CardTitle className="text-xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
          <Globe className="w-5 h-5" /> Crystal Origin Map
        </CardTitle>
        <p className="text-sm text-muted-foreground">Explore where crystals are found around the world</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {regionCounts.map(r => (
            <div
              key={r.name}
              onClick={() => setSelectedRegion(selectedRegion === r.name ? "All" : r.name)}
              className={`text-center p-3 rounded-xl border cursor-pointer transition-all ${selectedRegion === r.name ? "bg-primary/10 border-primary/30" : "bg-muted/20 border-border/30 hover:border-primary/20"}`}
            >
              <div className="text-lg font-black text-primary">{r.count}</div>
              <div className="text-[10px] text-muted-foreground font-medium">{r.name}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {REGIONS.map(r => (
            <button key={r} onClick={() => setSelectedRegion(r)} className={`text-xs px-2.5 py-1 rounded-full border transition-all ${selectedRegion === r ? "bg-primary text-primary-foreground border-primary" : "bg-muted/30 border-border/30 text-muted-foreground hover:border-primary/30"}`}>
              {r}
            </button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">{filtered.length} crystals from {selectedRegion === "All" ? "all regions" : selectedRegion}</p>

        <div className="grid gap-2 max-h-[400px] overflow-y-auto pr-1">
          <AnimatePresence mode="popLayout">
            {filtered.map(crystal => (
              <motion.div
                key={crystal.name}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 rounded-xl bg-muted/20 border border-border/30"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm">{crystal.name}</h4>
                    <p className="text-xs text-muted-foreground">{crystal.origin}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{crystal.region}</span>
                </div>
                <div className="flex gap-1.5 mt-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{crystal.color}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">Hardness: {crystal.hardness}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{crystal.rarity}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
    </>
  );
};
