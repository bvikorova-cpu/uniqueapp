import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HandwritingAnalysisResult } from "./HandwritingAnalysisResult";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export const HandwritingHistory = () => {
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);

  const { data: analyses, isLoading } = useQuery({
    queryKey: ["handwriting-analyses"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("handwriting_analyses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const getTypeLabel = (type: string) => {
    const labels = {
      personal: "Personal",
      professional: "Professional",
      relationship: "Relationship",
      business: "Business",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      personal: "bg-purple-500",
      professional: "bg-blue-500",
      relationship: "bg-pink-500",
      business: "bg-green-500",
    };
    return colors[type as keyof typeof colors] || "bg-gray-500";
  };

  if (selectedAnalysis) {
    return (
      <div>
        <button
          onClick={() => setSelectedAnalysis(null)}
          className="text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          ← Back to history
        </button>
        <HandwritingAnalysisResult analysis={selectedAnalysis} />
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

  if (!analyses || analyses.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">No analyses yet. Upload a handwriting sample to get started!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">Analysis History</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {analyses.map((analysis) => (
          <Card
            key={analysis.id}
            className="p-4 cursor-pointer hover:shadow-lg transition-all"
            onClick={() => setSelectedAnalysis(analysis)}
          >
            <img
              src={analysis.image_url}
              alt="Handwriting sample"
              className="w-full h-40 object-cover rounded-lg mb-3"
            />
            
            <Badge className={getTypeColor(analysis.analysis_type)}>
              {getTypeLabel(analysis.analysis_type)}
            </Badge>
            
            <div className="mt-2 text-sm text-muted-foreground">
              {new Date(analysis.created_at).toLocaleDateString()}
            </div>
            
            <div className="mt-1 text-xs text-muted-foreground">
              {analysis.credits_used} credits used
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
