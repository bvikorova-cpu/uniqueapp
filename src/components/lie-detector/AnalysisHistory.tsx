import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { MessageSquare, Users, Brain, Loader2, Clock, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const AnalysisHistory = () => {
  const { data: analyses, isLoading } = useQuery({
    queryKey: ["lie-detector-analyses"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("lie_detector_analyses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "single_message": return MessageSquare;
      case "conversation_thread": return Users;
      case "psychological_profile": return Brain;
      default: return MessageSquare;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "single_message": return "Single Message";
      case "conversation_thread": return "Conversation Thread";
      case "psychological_profile": return "Psychological Profile";
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "single_message": return "from-blue-500 to-cyan-500";
      case "conversation_thread": return "from-purple-500 to-pink-500";
      case "psychological_profile": return "from-amber-500 to-orange-500";
      default: return "from-primary to-accent";
    }
  };

  if (isLoading) {
    return (
    <>
      <FloatingHowItWorks title={"Analysis History - How it works"} steps={[{ title: 'Open', desc: 'Access the Analysis History section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Analysis History.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </>
  );
  }

  if (!analyses || analyses.length === 0) {
    return (
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardContent className="py-12">
          <div className="text-center">
            <ShieldCheck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No analyses yet. Start by analyzing a message!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {analyses.map((analysis, i) => {
        const Icon = getTypeIcon(analysis.analysis_type);
        const score = analysis.truthfulness_score;
        const color = getTypeColor(analysis.analysis_type);

        return (
          <motion.div
            key={analysis.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="bg-card/60 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all overflow-hidden">
              <div className={`h-1 bg-gradient-to-r ${color}`} />
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <span className="block">{getTypeLabel(analysis.analysis_type)}</span>
                      <span className="text-[10px] text-muted-foreground font-normal flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(analysis.created_at), "PPp")}
                      </span>
                    </div>
                  </CardTitle>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {score && (
                      <Badge
                        variant={score >= 70 ? "default" : score >= 40 ? "secondary" : "destructive"}
                        className="text-xs"
                      >
                        {score}%
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px]">{analysis.credits_used} cr</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {analysis.input_text.substring(0, 200)}...
                </p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
