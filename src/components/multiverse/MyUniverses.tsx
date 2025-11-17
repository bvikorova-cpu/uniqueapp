import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Globe, Loader2, TrendingUp, Shuffle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const MyUniverses = () => {
  const [universes, setUniverses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUniverses();
  }, []);

  const loadUniverses = async () => {
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('get-user-universes');

      if (error) throw error;

      setUniverses(data.universes || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

  if (universes.length === 0) {
    return (
      <Card className="border-muted">
        <CardContent className="py-12 text-center text-muted-foreground">
          No universes created yet. Start by creating your first parallel universe!
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-violet-500/20 bg-gradient-to-br from-violet-950/10 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Globe className="w-6 h-6 text-violet-400" />
            My Parallel Universes
          </CardTitle>
          <CardDescription>
            Explore your alternate realities and parallel timelines
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {universes.map((universe) => (
          <Card key={universe.id} className="border-violet-500/20 hover:border-violet-500/40 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-violet-400">
                  {universe.universe_name}
                </CardTitle>
                <Badge variant="secondary" className="bg-violet-500/20 text-violet-300">
                  {universe.success_score}/100
                </Badge>
              </div>
              <CardDescription className="text-sm">
                Diverged at: {universe.divergence_point}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {universe.universe_description}
              </p>

              {universe.parameters?.majorDifferences && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-violet-400">Key Differences:</p>
                  <div className="flex flex-wrap gap-1">
                    {universe.parameters.majorDifferences.slice(0, 3).map((diff: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {diff}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="w-4 h-4 text-violet-400" />
                  <span>Success: {universe.success_score}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-violet-500/30"
                >
                  <Shuffle className="w-4 h-4 mr-1" />
                  Jump
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyUniverses;
