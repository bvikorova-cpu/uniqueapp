import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Home, Building2, DollarSign, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props { onBack: () => void; }

const MOCK_PINS = [
  { id: 1, city: "Bratislava", lat: 48.15, lng: 17.11, count: 45, avgPrice: 185000, type: "apartment" },
  { id: 2, city: "Košice", lat: 48.72, lng: 21.26, count: 28, avgPrice: 125000, type: "house" },
  { id: 3, city: "Žilina", lat: 49.22, lng: 18.74, count: 15, avgPrice: 145000, type: "apartment" },
  { id: 4, city: "Banská Bystrica", lat: 48.74, lng: 19.15, count: 12, avgPrice: 110000, type: "house" },
  { id: 5, city: "Nitra", lat: 48.31, lng: 18.08, count: 20, avgPrice: 135000, type: "apartment" },
  { id: 6, city: "Prešov", lat: 48.99, lng: 21.24, count: 18, avgPrice: 98000, type: "house" },
  { id: 7, city: "Trnava", lat: 48.37, lng: 17.59, count: 22, avgPrice: 155000, type: "apartment" },
  { id: 8, city: "Trenčín", lat: 48.89, lng: 18.04, count: 10, avgPrice: 120000, type: "house" },
];

export const PropertyMapView = ({ onBack }: Props) => {
  const [selectedCity, setSelectedCity] = useState<typeof MOCK_PINS[0] | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all" ? MOCK_PINS : MOCK_PINS.filter(p => p.type === filter);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub
      </Button>

      <Card className="backdrop-blur-xl bg-card/80 border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="flex items-center gap-2 text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              <MapPin className="w-6 h-6 text-sky-500" />
              Interactive Property Map
            </CardTitle>
            <div className="flex gap-2">
              {["all", "apartment", "house"].map(f => (
                <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)} className="capitalize">
                  {f === "all" ? "All" : f}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Map visualization */}
          <div className="relative w-full h-[400px] bg-gradient-to-br from-sky-900/20 to-blue-900/30 rounded-2xl border border-border/30 overflow-hidden mb-6">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50" />
            
            {filtered.map((pin, i) => (
              <motion.div
                key={pin.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="absolute cursor-pointer group"
                style={{
                  left: `${((pin.lng - 16.5) / 5.5) * 80 + 10}%`,
                  top: `${((49.5 - pin.lat) / 2) * 80 + 10}%`,
                }}
                onClick={() => setSelectedCity(pin)}
              >
                <div className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all group-hover:scale-125 ${
                  selectedCity?.id === pin.id ? "bg-sky-500 scale-125" : "bg-sky-500/70"
                } shadow-lg shadow-sky-500/30`}>
                  <Home className="w-4 h-4 text-white" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent text-[10px] font-bold flex items-center justify-center text-white">
                    {pin.count}
                  </span>
                </div>
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold whitespace-nowrap text-muted-foreground">
                  {pin.city}
                </span>
              </motion.div>
            ))}
          </div>

          {/* City Details */}
          <AnimatePresence mode="wait">
            {selectedCity ? (
              <motion.div
                key={selectedCity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="bg-gradient-to-r from-sky-500/10 to-blue-500/10 border-sky-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <h3 className="text-xl font-black flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-sky-500" />
                          {selectedCity.city}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">{selectedCity.count} active listings</p>
                      </div>
                      <div className="flex gap-4">
                        <div className="text-center">
                          <div className="text-lg font-black text-sky-500">€{(selectedCity.avgPrice / 1000).toFixed(0)}K</div>
                          <div className="text-[10px] text-muted-foreground">Avg. Price</div>
                        </div>
                        <div className="text-center">
                          <Badge variant="outline" className="capitalize">{selectedCity.type}</Badge>
                          <div className="text-[10px] text-muted-foreground mt-1">Top Type</div>
                        </div>
                      </div>
                      <Button size="sm" className="bg-gradient-to-r from-sky-500 to-blue-600">
                        Browse {selectedCity.city}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-muted-foreground text-sm py-4">
                Click on a city pin to view property details 📍
              </motion.p>
            )}
          </AnimatePresence>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {[
              { label: "Total Properties", value: MOCK_PINS.reduce((s, p) => s + p.count, 0), icon: Building2, color: "text-sky-500" },
              { label: "Cities", value: MOCK_PINS.length, icon: MapPin, color: "text-blue-500" },
              { label: "Avg. Price", value: `€${Math.round(MOCK_PINS.reduce((s, p) => s + p.avgPrice, 0) / MOCK_PINS.length / 1000)}K`, icon: DollarSign, color: "text-green-500" },
              { label: "New Today", value: 12, icon: Home, color: "text-amber-500" },
            ].map((stat, i) => (
              <Card key={i} className="bg-card/60 border-border/30">
                <CardContent className="p-3 text-center">
                  <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
                  <div className="text-lg font-black">{stat.value}</div>
                  <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
