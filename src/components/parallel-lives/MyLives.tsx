import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Users, FileText, Eye, EyeOff, Globe } from "lucide-react";

interface ParallelLife {
  id: string;
  life_name: string;
  persona: string;
  bio: string;
  profession: string;
  lifestyle: string;
  avatar_url: string;
  follower_count: number;
  post_count: number;
  is_active: boolean;
  created_at: string;
}

export function MyLives() {
  const { toast } = useToast();
  const [lives, setLives] = useState<ParallelLife[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLives();
  }, []);

  const fetchLives = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('parallel_lives')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLives(data || []);
    } catch (error) {
      console.error('Error fetching lives:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLifeStatus = async (lifeId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('parallel_lives')
        .update({ is_active: !currentStatus })
        .eq('id', lifeId);

      if (error) throw error;

      toast({
        title: currentStatus ? "Life Hidden" : "Life Activated",
        description: currentStatus ? "This parallel life is now hidden" : "This parallel life is now visible"
      });

      fetchLives();
    } catch (error) {
      console.error('Error toggling life:', error);
      toast({
        title: "Error",
        description: "Failed to update life status",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading your parallel lives...</div>;
  }

  if (lives.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Globe className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-2">You haven't created any parallel lives yet</p>
          <p className="text-sm text-muted-foreground">Start by creating your first alternate reality</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {lives.map((life) => (
        <Card key={life.id} className={!life.is_active ? 'opacity-60' : ''}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {life.avatar_url ? (
                  <img src={life.avatar_url} alt={life.life_name} className="h-16 w-16 rounded-full object-cover" />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                )}
                <div>
                  <CardTitle>{life.life_name}</CardTitle>
                  <CardDescription>{life.profession} • {life.lifestyle}</CardDescription>
                </div>
              </div>
              <Badge variant={life.is_active ? 'default' : 'secondary'}>
                {life.is_active ? 'Active' : 'Hidden'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">{life.bio}</p>
            
            <div className="flex gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{life.follower_count} followers</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>{life.post_count} posts</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                View Profile
              </Button>
              <Button variant="outline" size="sm">
                Edit Life
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => toggleLifeStatus(life.id, life.is_active)}
              >
                {life.is_active ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Hide
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}