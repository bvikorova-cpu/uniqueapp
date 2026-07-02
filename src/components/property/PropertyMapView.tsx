import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Home, Building2, DollarSign, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export const PropertyMapView = ({ onBack }: Props) => {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState<any | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const { data: cityData = [], isLoading } = useQuery({
    queryKey: ['property-map-cities'],
    queryFn: async () => {
      const { data: properties } = await supabase
        .from('properties')
        .select('city, property_type, price, latitude, longitude')
        .eq('status', 'active');

      if (!properties?.length) return [];

      // Aggregate by city
      const cityMap = new Map<string, { count: number; totalPrice: number; types: Set<string>; lat: number; lng: number }>();
      properties.forEach(p => {
        const city = p.city || 'Unknown';
        const entry = cityMap.get(city) || { count: 0, totalPrice: 0, types: new Set(), lat: p.latitude || 48.15, lng: p.longitude || 17.11 };
        entry.count++;
        entry.totalPrice += p.price;
        if (p.property_type) entry.types.add(p.property_type);
        cityMap.set(city, entry);
      });

      return Array.from(cityMap.entries()).map(([city, data], i) => ({
        id: i + 1,
        city,
        count: data.count,
        avgPrice: Math.round(data.totalPrice / data.count),
        type: [...data.types][0] || 'apartment',
        // Map coordinates to visual positions
        x: 10 + ((data.lng - 16.5) / 5.5) * 80,
        y: 10 + ((49.5 - data.lat) / 2) * 80,
      }));
    },
  });

  const filtered = filter === "all" ? cityData : cityData.filter(p => p.type === filter);

  return (
    <>
      <FloatingHowItWorks title={"Property Map View - How it works"} steps={[{ title: 'Open', desc: 'Access the Property Map View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Property Map View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
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
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-bold text-lg mb-2">No Properties Listed</h3>
              <p className="text-sm text-muted-foreground">Be the first to list a property!</p>
            </div>
          ) : (
            <>
              <div className="relative w-full h-[400px] bg-gradient-to-br from-sky-900/20 to-blue-900/30 rounded-2xl border border-border/30 overflow-hidden mb-6">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50" />
                
                {filtered.map((pin, i) => (
                  <motion.div
                    key={pin.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="absolute cursor-pointer group"
                    style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
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

              <AnimatePresence mode="wait">
                {selectedCity ? (
                  <motion.div key={selectedCity.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
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
                          <Button size="sm" className="bg-gradient-to-r from-sky-500 to-blue-600" onClick={() => navigate(`/property-marketplace?city=${encodeURIComponent(selectedCity.city)}`)}>
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

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                {[
                  { label: "Total Properties", value: cityData.reduce((s, p) => s + p.count, 0), icon: Building2, color: "text-sky-500" },
                  { label: "Cities", value: cityData.length, icon: MapPin, color: "text-blue-500" },
                  { label: "Avg. Price", value: cityData.length ? `€${Math.round(cityData.reduce((s, p) => s + p.avgPrice, 0) / cityData.length / 1000)}K` : '—', icon: DollarSign, color: "text-green-500" },
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
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
    </>
  );
};