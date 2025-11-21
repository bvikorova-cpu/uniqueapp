import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Globe, Search, Users, UserPlus, RefreshCw } from "lucide-react";

interface ParallelLife {
  id: string;
  life_name: string;
  persona: string;
  profession: string;
  lifestyle: string;
  bio: string;
  follower_count: number;
  avatar_url: string;
}

export function ExploreLives() {
  const { toast } = useToast();
  const [lives, setLives] = useState<ParallelLife[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchLives();
  }, []);

  const fetchLives = async () => {
    try {
      const { data, error } = await supabase
        .from('parallel_lives')
        .select('*')
        .eq('is_active', true)
        .order('follower_count', { ascending: false })
        .limit(20);

      if (error) throw error;
      setLives(data || []);
    } catch (error) {
      console.error('Error fetching lives:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchLives();
    setIsRefreshing(false);
    toast({
      title: "Lives Refreshed",
      description: "Latest lives loaded"
    });
  };

  const handleFollow = async (lifeId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to follow",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Followed!",
        description: "You are now following this parallel life"
      });
    } catch (error) {
      console.error('Error following:', error);
    }
  };

  const filteredLives = lives.filter(life =>
    life.life_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    life.profession.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Explore Parallel Lives</CardTitle>
              <CardDescription>
                Discover alternative realities and follow different versions of people
              </CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or profession..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLives.map((life) => (
          <Card key={life.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                {life.avatar_url ? (
                  <img src={life.avatar_url} alt={life.life_name} className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                )}
                <div>
                  <CardTitle className="text-lg">{life.life_name}</CardTitle>
                  <CardDescription className="text-xs">{life.profession}</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{life.lifestyle}</Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {life.follower_count}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {life.bio || life.persona}
              </p>
              <div className="flex gap-2">
                <Button className="flex-1" size="sm">
                  View Profile
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleFollow(life.id)}>
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLives.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Globe className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No parallel lives found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}