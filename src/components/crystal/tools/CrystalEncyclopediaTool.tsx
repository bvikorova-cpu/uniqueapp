import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, ChevronDown, ChevronUp } from "lucide-react";
import { CRYSTAL_DATABASE } from "../crystalData";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export const CrystalEncyclopediaTool = () => {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const elements = ["all", ...new Set(CRYSTAL_DATABASE.map(c => c.element.split("/")[0].trim()))];
  
  const filtered = CRYSTAL_DATABASE.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.properties.toLowerCase().includes(search.toLowerCase()) || c.chakra.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || c.element.includes(filter);
    return matchSearch && matchFilter;
  });

  return (
    <>
      <FloatingHowItWorks title={"Crystal Encyclopedia Tool - How it works"} steps={[{ title: 'Open', desc: 'Access the Crystal Encyclopedia Tool section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Crystal Encyclopedia Tool.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/80 backdrop-blur-xl border-border/50">
      <CardHeader>
        <CardTitle className="text-xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
          <BookOpen className="w-5 h-5" /> Crystal Encyclopedia
        </CardTitle>
        <p className="text-sm text-muted-foreground">{CRYSTAL_DATABASE.length} crystals with detailed healing properties</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search crystals, properties, chakras..." className="pl-9" />
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {elements.map(e => (
            <button key={e} onClick={() => setFilter(e)} className={`text-xs px-2.5 py-1 rounded-full border transition-all ${filter === e ? "bg-primary text-primary-foreground border-primary" : "bg-muted/30 border-border/30 text-muted-foreground hover:border-primary/30"}`}>
              {e === "all" ? "All" : e}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{filtered.length} crystals found</p>
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {filtered.map(crystal => (
            <motion.div key={crystal.name} layout className="rounded-xl border border-border/30 bg-muted/20 hover:border-primary/20 transition-all overflow-hidden">
              <div className="flex items-center justify-between p-3 cursor-pointer" onClick={() => setExpanded(expanded === crystal.name ? null : crystal.name)}>
                <div>
                  <h4 className="font-bold text-sm">{crystal.name}</h4>
                  <p className="text-xs text-muted-foreground">{crystal.chakra} • {crystal.element} • {crystal.color}</p>
                </div>
                {expanded === crystal.name ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
              <AnimatePresence>
                {expanded === crystal.name && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-3 pb-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-card/60"><span className="text-muted-foreground">Hardness:</span> <span className="font-semibold">{crystal.hardness}</span></div>
                      <div className="p-2 rounded-lg bg-card/60"><span className="text-muted-foreground">Rarity:</span> <span className="font-semibold">{crystal.rarity}</span></div>
                      <div className="p-2 rounded-lg bg-card/60"><span className="text-muted-foreground">Zodiac:</span> <span className="font-semibold">{crystal.zodiac}</span></div>
                      <div className="p-2 rounded-lg bg-card/60"><span className="text-muted-foreground">Origin:</span> <span className="font-semibold">{crystal.origin}</span></div>
                    </div>
                    <div className="p-2 rounded-lg bg-primary/5 border border-primary/10">
                      <span className="text-xs font-semibold">Properties: </span>
                      <span className="text-xs text-muted-foreground">{crystal.properties}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-accent/5 border border-accent/10">
                      <span className="text-xs font-semibold">Mantra: </span>
                      <span className="text-xs text-muted-foreground italic">"{crystal.mantra}"</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
    </>
  );
};
