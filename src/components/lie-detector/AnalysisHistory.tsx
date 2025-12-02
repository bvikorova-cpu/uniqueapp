import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { MessageSquare, Users, Brain, Loader2 } from "lucide-react";

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
      case "single_message":
        return MessageSquare;
      case "conversation_thread":
        return Users;
      case "psychological_profile":
        return Brain;
      default:
        return MessageSquare;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "single_message":
        return "Single Message";
      case "conversation_thread":
        return "Conversation Thread";
      case "psychological_profile":
        return "Psychological Profile";
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analyses || analyses.length === 0) {
    return (
      <Card className="glassmorphism">
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground text-sm sm:text-base">
            No analyses yet. Start by analyzing a message!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {analyses.map((analysis) => {
        const Icon = getTypeIcon(analysis.analysis_type);
        const score = analysis.truthfulness_score;
        
        return (
          <Card key={analysis.id} className="glassmorphism hover:shadow-glow transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="line-clamp-1">{getTypeLabel(analysis.analysis_type)}</span>
                </CardTitle>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {score && (
                    <Badge variant={score >= 70 ? "default" : score >= 40 ? "secondary" : "destructive"} className="text-xs">
                      {score}%
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">{analysis.credits_used} credits</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(analysis.created_at), "PPp")}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                {analysis.input_text.substring(0, 150)}...
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};