import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PastLifeResult } from "./PastLifeResult";
import { useState, useMemo } from "react";
import { Loader2, Calendar, ArrowLeft, Clock, Sparkles, Heart, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const PastLifeHistory = () => {
  const [selectedReading, setSelectedReading] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const { data: readings, isLoading } = useQuery({
    queryKey: ["past-life-readings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("past_life_readings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const getTypeConfig = (type: string) => {
    const configs: Record<string, { label: string; gradient: string; icon: any }> = {
      basic: { label: "Basic", gradient: "from-blue-500 to-cyan-500", icon: Clock },
      full: { label: "Full", gradient: "from-primary to-accent", icon: Sparkles },
      soulmate: { label: "Soul Mate", gradient: "from-pink-500 to-rose-500", icon: Heart },
    };
    return configs[type] || configs.basic;
  };

  if (selectedReading) {
    return (
      <>
        <FloatingHowItWorks
          title='Past Life History'
          steps={[
          { title: 'Open the tool', desc: 'Launch the Past Life History panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
        />
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedReading(null)}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to history
        </Button>
        <PastLifeResult
          reading={{
            pastLives: selectedReading.past_lives,
            overallKarmicTheme: selectedReading.karmic_lessons,
            soulmateConnection: selectedReading.soulmate_analysis,
          }}
        />
      </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!readings || readings.length === 0) {
    return (
      <Card className="p-12 text-center bg-card/80 backdrop-blur-xl border-border/50">
        <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No past life readings yet. Start your journey to discover who you were!</p>
      </Card>
    );
  }

  const filtered = (readings || []).filter((r) => {
    if (filterType !== "all" && r.reading_type !== filterType) return false;
    if (search) {
      const lower = search.toLowerCase();
      const lives = Array.isArray(r.past_lives) ? JSON.stringify(r.past_lives).toLowerCase() : "";
      if (!lives.includes(lower) && !(r.karmic_lessons || "").toLowerCase().includes(lower)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
          Your Past Life Readings
        </h2>
        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 self-start sm:self-auto">
          {filtered.length} of {readings.length} readings
        </Badge>
      </div>

      {/* Filter & Search */}
      <Card className="p-3 bg-card/60 backdrop-blur border-border/40">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by era, name, theme..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-muted/10 border-border/50 h-9 text-sm"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {[
              { id: "all", label: "All" },
              { id: "basic", label: "Basic" },
              { id: "full", label: "Full" },
              { id: "soulmate", label: "Soul Mate" },
            ].map((f) => (
              <Button
                key={f.id}
                size="sm"
                variant={filterType === f.id ? "default" : "outline"}
                className="text-xs h-9"
                onClick={() => setFilterType(f.id)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((reading, i) => {
          const config = getTypeConfig(reading.reading_type);
          const TypeIcon = config.icon;
          return (
            <motion.div
              key={reading.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className="overflow-hidden cursor-pointer hover:shadow-xl transition-all bg-card/80 backdrop-blur-xl border-border/50 group"
                onClick={() => setSelectedReading(reading)}
              >
                <div className={`h-1 bg-gradient-to-r ${config.gradient}`} />
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {new Date(reading.birth_date).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <TypeIcon className="h-4 w-4 text-primary" />
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                      {config.label} Reading
                    </Badge>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {Array.isArray(reading.past_lives) ? reading.past_lives.length : 0} past {Array.isArray(reading.past_lives) && reading.past_lives.length === 1 ? "life" : "lives"} discovered
                  </div>

                  <div className="mt-2 text-xs text-muted-foreground flex items-center justify-between">
                    <span>{new Date(reading.created_at).toLocaleDateString()}</span>
                    <span>{reading.credits_used} credits</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
