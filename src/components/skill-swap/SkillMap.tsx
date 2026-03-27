import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, MapPin, Users, Star, MessageSquare, ArrowLeft } from "lucide-react";

interface SwapperPin {
  id: string;
  name: string;
  location: string;
  country: string;
  skills: string[];
  rating: number;
  exchanges: number;
  x: number;
  y: number;
  continent: string;
}

const MOCK_SWAPPERS: SwapperPin[] = [
  { id: "1", name: "Sarah K.", location: "London, UK", country: "🇬🇧", skills: ["Piano", "French"], rating: 4.9, exchanges: 34, x: 48, y: 28, continent: "Europe" },
  { id: "2", name: "Tomáš M.", location: "Bratislava, SK", country: "🇸🇰", skills: ["Programming", "Guitar"], rating: 4.8, exchanges: 22, x: 52, y: 27, continent: "Europe" },
  { id: "3", name: "Yuki T.", location: "Tokyo, Japan", country: "🇯🇵", skills: ["Japanese", "Origami"], rating: 5.0, exchanges: 41, x: 82, y: 32, continent: "Asia" },
  { id: "4", name: "Maria G.", location: "São Paulo, BR", country: "🇧🇷", skills: ["Portuguese", "Dance"], rating: 4.7, exchanges: 18, x: 32, y: 62, continent: "South America" },
  { id: "5", name: "James L.", location: "New York, US", country: "🇺🇸", skills: ["Photography", "Marketing"], rating: 4.6, exchanges: 27, x: 25, y: 30, continent: "North America" },
  { id: "6", name: "Aisha B.", location: "Lagos, NG", country: "🇳🇬", skills: ["Design", "Cooking"], rating: 4.8, exchanges: 15, x: 50, y: 50, continent: "Africa" },
  { id: "7", name: "Chen W.", location: "Shanghai, CN", country: "🇨🇳", skills: ["Mandarin", "Tai Chi"], rating: 4.9, exchanges: 38, x: 78, y: 33, continent: "Asia" },
  { id: "8", name: "Emma S.", location: "Sydney, AU", country: "🇦🇺", skills: ["Surfing", "Yoga"], rating: 4.7, exchanges: 12, x: 85, y: 65, continent: "Oceania" },
  { id: "9", name: "Carlos R.", location: "Mexico City, MX", country: "🇲🇽", skills: ["Spanish", "Cooking"], rating: 4.5, exchanges: 20, x: 18, y: 38, continent: "North America" },
  { id: "10", name: "Priya P.", location: "Mumbai, IN", country: "🇮🇳", skills: ["Hindi", "Meditation"], rating: 4.9, exchanges: 29, x: 70, y: 40, continent: "Asia" },
  { id: "11", name: "Olaf N.", location: "Oslo, NO", country: "🇳🇴", skills: ["Skiing", "Norwegian"], rating: 4.6, exchanges: 11, x: 50, y: 20, continent: "Europe" },
  { id: "12", name: "Fatima A.", location: "Dubai, UAE", country: "🇦🇪", skills: ["Arabic", "Business"], rating: 4.8, exchanges: 25, x: 62, y: 38, continent: "Asia" },
];

const CONTINENTS = ["All", "Europe", "Asia", "North America", "South America", "Africa", "Oceania"];

interface SkillMapProps {
  onBack: () => void;
}

export const SkillMap = ({ onBack }: SkillMapProps) => {
  const [selectedSwapper, setSelectedSwapper] = useState<SwapperPin | null>(null);
  const [filterContinent, setFilterContinent] = useState("All");

  const filteredSwappers = filterContinent === "All" 
    ? MOCK_SWAPPERS 
    : MOCK_SWAPPERS.filter(s => s.continent === filterContinent);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Hub
      </Button>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" /> Skill Map
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            <Users className="w-3 h-3 mr-1" /> {filteredSwappers.length} Swappers
          </Badge>
        </div>
      </div>

      {/* Continent Filter */}
      <div className="flex flex-wrap gap-2">
        {CONTINENTS.map(c => (
          <Button
            key={c}
            size="sm"
            variant={filterContinent === c ? "default" : "outline"}
            onClick={() => setFilterContinent(c)}
            className="text-xs h-8"
          >
            {c}
          </Button>
        ))}
      </div>

      {/* Map */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border-border/50 p-2">
        <div className="relative w-full aspect-[2/1] min-h-[300px] bg-gradient-to-b from-blue-500/5 to-emerald-500/5 rounded-xl overflow-hidden">
          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {[20, 40, 60, 80].map(y => (
              <line key={`h-${y}`} x1="0" y1={y} x2="100" y2={y} stroke="hsl(var(--border))" strokeWidth="0.15" strokeDasharray="1 1" />
            ))}
            {[20, 40, 60, 80].map(x => (
              <line key={`v-${x}`} x1={x} y1="0" x2={x} y2="100" stroke="hsl(var(--border))" strokeWidth="0.15" strokeDasharray="1 1" />
            ))}
          </svg>

          {/* Swapper Pins */}
          {filteredSwappers.map((swapper, i) => (
            <motion.div
              key={swapper.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="absolute cursor-pointer group z-10"
              style={{ left: `${swapper.x}%`, top: `${swapper.y}%`, transform: "translate(-50%, -50%)" }}
              onClick={() => setSelectedSwapper(swapper)}
            >
              {/* Pulse ring */}
              <div className="absolute inset-0 w-8 h-8 -m-1 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: `${2 + i * 0.3}s` }} />
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2 transition-all
                ${selectedSwapper?.id === swapper.id 
                  ? "bg-primary text-primary-foreground border-primary scale-125 ring-4 ring-primary/30" 
                  : "bg-card text-foreground border-border/50 hover:border-primary/50 hover:scale-110"
                }`}
              >
                {swapper.country}
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-lg px-3 py-1.5 shadow-xl whitespace-nowrap">
                  <p className="text-xs font-bold">{swapper.name}</p>
                  <p className="text-[10px] text-muted-foreground">{swapper.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Selected Swapper Detail */}
      {selectedSwapper && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-5 bg-card/80 backdrop-blur-xl border-primary/20">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl shadow-lg">
                  {selectedSwapper.country}
                </div>
                <div>
                  <h3 className="font-black text-lg">{selectedSwapper.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {selectedSwapper.location}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> {selectedSwapper.rating}
                    </span>
                    <span className="text-xs text-muted-foreground">{selectedSwapper.exchanges} exchanges</span>
                  </div>
                </div>
              </div>
              <Button size="sm" className="gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> Connect
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedSwapper.skills.map(skill => (
                <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Countries", value: "45+", emoji: "🌍" },
          { label: "Languages", value: "30+", emoji: "🗣️" },
          { label: "Skill Categories", value: "8", emoji: "📚" },
          { label: "Active Today", value: "1.2K", emoji: "🟢" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }}>
            <Card className="p-4 text-center bg-card/60 backdrop-blur-sm border-border/50">
              <span className="text-2xl block mb-1">{stat.emoji}</span>
              <div className="text-xl font-black text-foreground">{stat.value}</div>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
