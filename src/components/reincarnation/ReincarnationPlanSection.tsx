import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Crown, Target, Map, Shield, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const ReincarnationPlanSection = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [formData, setFormData] = useState({
    planName: "",
    goalDescription: "",
  });

  const handleCreatePlan = async () => {
    if (!formData.planName || !formData.goalDescription) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to create plan",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-reincarnation-plan', {
        body: { 
          planName: formData.planName,
          goalDescription: formData.goalDescription
        }
      });

      if (error) throw error;

      setPlan(data.plan);
      toast({
        title: "Reincarnation Plan Created!",
        description: "Your next life journey has been mapped",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create plan. Please try again.",
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
            <Crown className="h-5 w-5 text-primary" />
            Reincarnation Guarantee Plan
          </CardTitle>
          <CardDescription>
            Ultimate lifetime spiritual planning & soul preservation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!plan ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="planName">Plan Name</Label>
                <Input
                  id="planName"
                  placeholder="e.g., My Spiritual Ascension Journey"
                  value={formData.planName}
                  onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="goalDescription">Next Life Goal</Label>
                <Textarea
                  id="goalDescription"
                  placeholder="Describe what you want to achieve in your next incarnation..."
                  rows={4}
                  value={formData.goalDescription}
                  onChange={(e) => setFormData({ ...formData, goalDescription: e.target.value })}
                />
              </div>

              <Button 
                onClick={handleCreatePlan} 
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Reincarnation Plan...
                  </>
                ) : (
                  <>
                    <Crown className="mr-2 h-4 w-4" />
                    Create My Reincarnation Plan
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle className="text-xl">{plan.plan_name}</CardTitle>
                  <CardDescription>{plan.next_life_goal}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <Map className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <div className="text-xs text-muted-foreground">Era</div>
                      <div className="text-sm font-semibold mt-1">{plan.desired_era}</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <div className="text-xs text-muted-foreground">Role</div>
                      <div className="text-sm font-semibold mt-1">{plan.desired_role}</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <div className="text-xs text-muted-foreground">Location</div>
                      <div className="text-sm font-semibold mt-1">{plan.desired_location}</div>
                    </div>
                  </div>

                  {plan.soul_missions && plan.soul_missions.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        Soul Missions
                      </h4>
                      <div className="space-y-2">
                        {plan.soul_missions.map((mission: any, idx: number) => (
                          <div key={idx} className="p-4 rounded-lg bg-muted/30">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-medium text-sm">{mission.mission}</h5>
                              <Badge variant={mission.priority === 'high' ? 'default' : 'secondary'}>
                                {mission.priority}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Estimated: {mission.estimated_lifetimes} lifetime(s)
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {plan.karmic_lessons_to_complete && plan.karmic_lessons_to_complete.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Karmic Lessons to Complete</h4>
                      <div className="flex flex-wrap gap-2">
                        {plan.karmic_lessons_to_complete.map((lesson: string, idx: number) => (
                          <Badge key={idx} variant="outline">{lesson}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {plan.preservation_protocol && (
                    <div className="p-4 rounded-lg bg-primary/10">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Soul Preservation Protocol
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Memory Retention:</span>
                          <Badge>{plan.preservation_protocol.memory_retention}</Badge>
                        </div>
                        {plan.preservation_protocol.skill_transfer && (
                          <div>
                            <span className="text-muted-foreground">Skills to Transfer:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {plan.preservation_protocol.skill_transfer.map((skill: string, idx: number) => (
                                <Badge key={idx} variant="secondary" className="text-xs">{skill}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {plan.destiny_mapping?.key_life_events && (
                    <div>
                      <h4 className="font-semibold mb-3">Destiny Timeline</h4>
                      <div className="space-y-2">
                        {plan.destiny_mapping.key_life_events.map((event: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                            <div className="flex-shrink-0 w-12 text-center">
                              <span className="text-sm font-semibold text-primary">Age {event.age}</span>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{event.event}</p>
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
