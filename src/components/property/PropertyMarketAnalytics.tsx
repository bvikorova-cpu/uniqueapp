import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, TrendingUp, TrendingDown, DollarSign, Home, MapPin, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const TRENDS = [
  { city: "Berlin", avgPrice: 185000, change: 12.5, listings: 45, demand: "High" },
  { city: "Košice", avgPrice: 125000, change: 8.2, listings: 28, demand: "Medium" },
  { city: "Žilina", avgPrice: 145000, change: 15.1, listings: 15, demand: "High" },
  { city: "Banská Bystrica", avgPrice: 110000, change: -2.3, listings: 12, demand: "Low" },
  { city: "Nitra", avgPrice: 135000, change: 6.8, listings: 20, demand: "Medium" },
  { city: "Prešov", avgPrice: 98000, change: 4.1, listings: 18, demand: "Low" },
];

export const PropertyMarketAnalytics = ({ onBack }: Props) => {
  return (
    <>
      <FloatingHowItWorks title={"Property Market Analytics - How it works"} steps={[{ title: 'Open', desc: 'Access the Property Market Analytics section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Property Market Analytics.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub
      </Button>

      <Card className="backdrop-blur-xl bg-card/80 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            <BarChart3 className="w-6 h-6 text-emerald-500" />
            Market Analytics Dashboard
          </CardTitle>
          <p className="text-sm text-muted-foreground">Real-time market trends, price analytics & demand indicators</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Avg. Price", value: "€138K", change: "+8.5%", icon: DollarSign, color: "text-green-500", bg: "from-green-500/10 to-emerald-500/10" },
              { label: "Total Listings", value: "340+", change: "+12%", icon: Home, color: "text-sky-500", bg: "from-sky-500/10 to-blue-500/10" },
              { label: "Avg. Days Listed", value: "45", change: "-5d", icon: Activity, color: "text-amber-500", bg: "from-amber-500/10 to-yellow-500/10" },
              { label: "Hot Markets", value: "3", change: "cities", icon: MapPin, color: "text-red-500", bg: "from-red-500/10 to-pink-500/10" },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className={`bg-gradient-to-br ${stat.bg} border-border/30`}>
                  <CardContent className="p-4 text-center">
                    <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
                    <div className="text-2xl font-black">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                    <div className={`text-xs font-semibold mt-1 ${stat.color}`}>{stat.change}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Price Trend Chart (visual) */}
          <Card className="bg-card/60 border-border/30">
            <CardContent className="p-4">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Price Trends by City (Last 12 Months)
              </h3>
              <div className="space-y-3">
                {TRENDS.map((trend, i) => (
                  <motion.div
                    key={trend.city}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <span className="w-28 text-sm font-medium truncate">{trend.city}</span>
                    <div className="flex-1 h-8 bg-muted/30 rounded-lg overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(trend.avgPrice / 200000) * 100}%` }}
                        transition={{ delay: 0.4 + i * 0.1, duration: 0.8 }}
                        className={`h-full rounded-lg ${trend.change > 0 ? "bg-gradient-to-r from-sky-500 to-blue-500" : "bg-gradient-to-r from-red-400 to-red-500"}`}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                        €{(trend.avgPrice / 1000).toFixed(0)}K
                      </span>
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-bold w-16 ${trend.change > 0 ? "text-green-500" : "text-red-500"}`}>
                      {trend.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {trend.change > 0 ? "+" : ""}{trend.change}%
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      trend.demand === "High" ? "bg-green-500/20 text-green-500" :
                      trend.demand === "Medium" ? "bg-amber-500/20 text-amber-500" :
                      "bg-red-500/20 text-red-500"
                    }`}>
                      {trend.demand}
                    </span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
              <CardContent className="p-4">
                <h4 className="font-bold text-sm flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-500" /> Best Time to Sell
                </h4>
                <p className="text-xs text-muted-foreground">Spring (March-May) shows 15% higher demand with faster sales. Average listing time drops to 32 days.</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
              <CardContent className="p-4">
                <h4 className="font-bold text-sm flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-blue-500" /> Emerging Areas
                </h4>
                <p className="text-xs text-muted-foreground">Žilina region shows 15.1% growth - highest in the country. New infrastructure projects driving demand.</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </motion.div>
    </>
  );
};
