import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GitBranch, Eye, AlertCircle } from "lucide-react";

interface Life {
  id: string;
  life_name: string;
  profession: string;
}

export function CrossRealityReveal() {
  const { toast } = useToast();
  const [myLives, setMyLives] = useState<Life[]>([]);
  const [targetLives, setTargetLives] = useState<Life[]>([]);
  const [selectedMyLife, setSelectedMyLife] = useState("");
  const [selectedTargetLife, setSelectedTargetLife] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchMyLives();
    fetchTargetLives();
  }, []);

  const fetchMyLives = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('parallel_lives')
      .select('id, life_name, profession')
      .eq('user_id', user.id)
      .eq('is_active', true);

    setMyLives(data || []);
  };

  const fetchTargetLives = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('parallel_lives')
      .select('id, life_name, profession')
      .neq('user_id', user.id)
      .eq('is_active', true)
      .limit(50);

    setTargetLives(data || []);
  };

  const handleReveal = async () => {
    if (!selectedMyLife || !selectedTargetLife) {
      toast({
        title: "Selection Required",
        description: "Please select both lives for the reveal",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('cross_reality_reveals')
        .insert({
          revealer_life_id: selectedMyLife,
          target_life_id: selectedTargetLife,
          message: message,
          payment_amount: 4.99
        });

      if (error) throw error;

      toast({
        title: "Reality Revealed! 🌟",
        description: "You've revealed your true identity across realities (€4.99 charged)"
      });

      setSelectedMyLife("");
      setSelectedTargetLife("");
      setMessage("");
    } catch (error) {
      console.error('Error creating reveal:', error);
      toast({
        title: "Error",
        description: "Failed to create cross-reality reveal",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-6 w-6 text-purple-500" />
            Cross-Reality Reveal
          </CardTitle>
          <CardDescription>
            Show another parallel life who you really are - reveal your true identity across realities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg flex gap-3">
            <AlertCircle className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold mb-1">What is Cross-Reality Reveal?</p>
              <p className="text-muted-foreground">
                In the Parallel Lives Network, followers only know you in one reality. 
                With Cross-Reality Reveal, you can show someone from another reality that you're actually the same person behind multiple lives.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Your Life (Revealer)</Label>
              <Select value={selectedMyLife} onValueChange={setSelectedMyLife}>
                <SelectTrigger>
                  <SelectValue placeholder="Select one of your lives..." />
                </SelectTrigger>
                <SelectContent>
                  {myLives.map((life) => (
                    <SelectItem key={life.id} value={life.id}>
                      {life.life_name} ({life.profession})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target Life (Who will see the reveal)</Label>
              <Select value={selectedTargetLife} onValueChange={setSelectedTargetLife}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a target life..." />
                </SelectTrigger>
                <SelectContent>
                  {targetLives.map((life) => (
                    <SelectItem key={life.id} value={life.id}>
                      {life.life_name} ({life.profession})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Message (Optional)</Label>
              <Textarea
                placeholder="Add a message to your reveal..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>

            <Button 
              onClick={handleReveal}
              className="w-full"
              size="lg"
            >
              <Eye className="mr-2 h-5 w-5" />
              Reveal Identity (€4.99)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Why Reveal?</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Build trust by showing your authentic multi-dimensional self</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Connect your different audiences and communities</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Create wow moments by revealing unexpected connections</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Strategic networking across different professional circles</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}