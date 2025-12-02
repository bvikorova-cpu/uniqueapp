import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PastLifeResult } from "./PastLifeResult";
import { useState } from "react";
import { Loader2, Calendar } from "lucide-react";

export const PastLifeHistory = () => {
  const [selectedReading, setSelectedReading] = useState<any>(null);

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

  const getTypeLabel = (type: string) => {
    const labels = {
      basic: "Basic",
      full: "Full",
      soulmate: "Soul Mate",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      basic: "bg-blue-500",
      full: "bg-indigo-500",
      soulmate: "bg-pink-500",
    };
    return colors[type as keyof typeof colors] || "bg-gray-500";
  };

  if (selectedReading) {
    return (
      <div>
        <button
          onClick={() => setSelectedReading(null)}
          className="text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          ← Back to history
        </button>
        <PastLifeResult
          reading={{
            pastLives: selectedReading.past_lives,
            overallKarmicTheme: selectedReading.karmic_lessons,
            soulmateConnection: selectedReading.soulmate_analysis,
          }}
        />
      </div>
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
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">No past life readings yet. Start your journey to discover who you were!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl sm:text-2xl font-bold mb-6">Your Past Life Readings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {readings.map((reading) => (
          <Card
            key={reading.id}
            className="p-4 cursor-pointer hover:shadow-lg transition-all"
            onClick={() => setSelectedReading(reading)}
          >
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {new Date(reading.birth_date).toLocaleDateString()}
              </span>
            </div>

            <Badge className={getTypeColor(reading.reading_type)}>
              {getTypeLabel(reading.reading_type)} Reading
            </Badge>

            <div className="mt-3 text-sm text-muted-foreground">
              {Array.isArray(reading.past_lives) ? reading.past_lives.length : 0} past {Array.isArray(reading.past_lives) && reading.past_lives.length === 1 ? 'life' : 'lives'} discovered
            </div>

            <div className="mt-2 text-xs text-muted-foreground">
              {new Date(reading.created_at).toLocaleDateString()} • {reading.credits_used} credits
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};