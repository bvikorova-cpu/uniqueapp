import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Eye, Clock, MapPin, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const PastLifeRegressionSection = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [regression, setRegression] = useState<any>(null);

  const handleRegression = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to explore past lives",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate-past-life-regression');

      if (error) throw error;

      setRegression(data.regression);
      toast({
        title: "Past Life Discovered!",
        description: `You have uncovered a life from ${data.regression.life_era}`,
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Regression Failed",
        description: "Failed to access past life memories. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Past Life Regression
          </CardTitle>
          <CardDescription>
            Explore your previous incarnations through AI-powered spiritual analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleRegression} 
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Accessing Past Life Memories...
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Begin Regression Session
              </>
            )}
          </Button>

          {regression && (
            <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <Card className="border-primary/30">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{regression.life_name}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {regression.life_era}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {regression.life_location}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {regression.life_role}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Life Story</h4>
                    <p className="text-sm text-muted-foreground">{regression.life_story}</p>
                  </div>

                  {regression.historical_context && (
                    <div>
                      <h4 className="font-semibold mb-2">Historical Context</h4>
                      <p className="text-sm text-muted-foreground">{regression.historical_context}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold mb-2 flex items-center justify-between">
                      Verification Score
                      <span className="text-primary">{regression.verification_score}%</span>
                    </h4>
                    <Progress value={regression.verification_score} className="h-2" />
                  </div>

                  {regression.lessons_learned && regression.lessons_learned.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Karmic Lessons</h4>
                      <div className="flex flex-wrap gap-2">
                        {regression.lessons_learned.map((lesson: string, idx: number) => (
                          <Badge key={idx} variant="outline">{lesson}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {regression.emotional_themes && regression.emotional_themes.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Emotional Themes</h4>
                      <div className="flex flex-wrap gap-2">
                        {regression.emotional_themes.map((theme: string, idx: number) => (
                          <Badge key={idx} className="bg-primary/20">{theme}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {regression.key_events && regression.key_events.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Key Life Events</h4>
                      <div className="space-y-2">
                        {regression.key_events.map((event: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <div className="flex-shrink-0 w-16 text-center">
                              <span className="text-sm font-semibold text-primary">Age {event.age}</span>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{event.event}</p>
                              <p className="text-xs text-muted-foreground mt-1">{event.significance}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
