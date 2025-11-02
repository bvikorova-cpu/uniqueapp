import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Merge, AlertTriangle } from "lucide-react";

interface Life {
  id: string;
  life_name: string;
  profession: string;
  follower_count: number;
}

export function RealityMerge() {
  const { toast } = useToast();
  const [myLives, setMyLives] = useState<Life[]>([]);
  const [life1, setLife1] = useState("");
  const [life2, setLife2] = useState("");

  useEffect(() => {
    fetchMyLives();
  }, []);

  const fetchMyLives = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('parallel_lives')
      .select('id, life_name, profession, follower_count')
      .eq('user_id', user.id)
      .eq('is_active', true);

    setMyLives(data || []);
  };

  const handleMerge = async () => {
    if (!life1 || !life2) {
      toast({
        title: "Selection Required",
        description: "Please select two lives to merge",
        variant: "destructive"
      });
      return;
    }

    if (life1 === life2) {
      toast({
        title: "Invalid Selection",
        description: "Please select two different lives",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('reality_merges')
        .insert({
          user_id: user.id,
          life_1_id: life1,
          life_2_id: life2,
          payment_amount: 9.99,
          merge_data: {
            merged_at: new Date().toISOString(),
            status: 'processing'
          }
        });

      if (error) throw error;

      toast({
        title: "Realities Merging! 🌟",
        description: "Your two parallel lives are being combined (€9.99 charged)"
      });

      setLife1("");
      setLife2("");
    } catch (error) {
      console.error('Error merging realities:', error);
      toast({
        title: "Error",
        description: "Failed to merge realities",
        variant: "destructive"
      });
    }
  };

  const selectedLife1 = myLives.find(l => l.id === life1);
  const selectedLife2 = myLives.find(l => l.id === life2);
  const totalFollowers = (selectedLife1?.follower_count || 0) + (selectedLife2?.follower_count || 0);

  return (
    <div className="space-y-6">
      <Card className="border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Merge className="h-6 w-6 text-blue-500" />
            Reality Merge
          </CardTitle>
          <CardDescription>
            Combine two of your parallel lives into one unified reality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg flex gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold mb-1">What happens during a merge?</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Both follower bases are combined</li>
                <li>• All posts from both lives are merged</li>
                <li>• You choose which profile information to keep</li>
                <li>• This action cannot be undone</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>First Life</Label>
              <Select value={life1} onValueChange={setLife1}>
                <SelectTrigger>
                  <SelectValue placeholder="Select first life..." />
                </SelectTrigger>
                <SelectContent>
                  {myLives.map((life) => (
                    <SelectItem key={life.id} value={life.id}>
                      {life.life_name} - {life.follower_count} followers
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-center py-2">
              <Merge className="h-8 w-8 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <Label>Second Life</Label>
              <Select value={life2} onValueChange={setLife2}>
                <SelectTrigger>
                  <SelectValue placeholder="Select second life..." />
                </SelectTrigger>
                <SelectContent>
                  {myLives.filter(l => l.id !== life1).map((life) => (
                    <SelectItem key={life.id} value={life.id}>
                      {life.life_name} - {life.follower_count} followers
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {life1 && life2 && (
              <Card className="bg-muted">
                <CardContent className="pt-4">
                  <p className="text-sm font-semibold mb-2">Merge Preview:</p>
                  <p className="text-sm text-muted-foreground">
                    Combined followers: <span className="font-semibold text-foreground">{totalFollowers}</span>
                  </p>
                </CardContent>
              </Card>
            )}

            <Button 
              onClick={handleMerge}
              className="w-full"
              size="lg"
              disabled={!life1 || !life2}
            >
              <Merge className="mr-2 h-5 w-5" />
              Merge Realities (€9.99)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Why Merge Realities?</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Consolidate your audience when you want to be authentic</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Combine professional and personal brands strategically</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Create a more powerful unified presence</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Simplify management of your parallel lives</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}