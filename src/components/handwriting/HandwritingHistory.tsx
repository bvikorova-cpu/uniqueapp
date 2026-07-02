import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HandwritingAnalysisResult } from "./HandwritingAnalysisResult";
import { useState } from "react";
import { Loader2, PenTool, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    personal: "Personal",
    professional: "Professional",
    relationship: "Relationship",
    business: "Business",
  };
  return labels[type] || type;
};

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    personal: "from-purple-500 to-violet-500",
    professional: "from-blue-500 to-cyan-500",
    relationship: "from-pink-500 to-rose-500",
    business: "from-emerald-500 to-teal-500",
  };
  return colors[type] || "from-primary to-accent";
};

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

  if (selectedAnalysis) {
    return (
    <>
      <FloatingHowItWorks title={"Handwriting History - How it works"} steps={[{ title: 'Open', desc: 'Access the Handwriting History section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Handwriting History.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => setSelectedAnalysis(null)}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to history
        </Button>
        <HandwritingAnalysisResult analysis={selectedAnalysis} />
      </div>
    </>
  );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analyses || analyses.length === 0) {
    return (
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardContent className="py-12">
          <div className="text-center">
            <PenTool className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No analyses yet. Upload a handwriting sample to get started!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {analyses.map((analysis, i) => {
        const color = getTypeColor(analysis.analysis_type);
        return (
          <motion.div
            key={analysis.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card
              className="bg-card/60 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all cursor-pointer overflow-hidden"
              onClick={() => setSelectedAnalysis(analysis)}
            >
              <div className={`h-1 bg-gradient-to-r ${color}`} />
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {analysis.image_url && (
                    <img
                      src={analysis.image_url}
                      alt="Handwriting"
                      className="w-16 h-16 object-cover rounded-lg border border-border/30 flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`bg-gradient-to-r ${color} text-white border-0 text-[10px]`}>
                        {getTypeLabel(analysis.analysis_type)}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">{analysis.credits_used} cr</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(analysis.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
