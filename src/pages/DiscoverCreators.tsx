import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, Users, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface Creator {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  cover_image_url: string | null;
  total_subscribers: number;
}

export default function DiscoverCreators() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadCreators();
  }, []);

  const loadCreators = async () => {
    try {
      const { data, error } = await supabase
        .from('creator_profiles')
        .select('*')
        .order('total_subscribers', { ascending: false });

      if (error) throw error;
      setCreators(data || []);
    } catch (error: any) {
      console.error('Error loading creators:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load creators",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCreators = creators.filter(creator =>
    creator.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    creator.bio.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading creators...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black mb-4">Discover Creators</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Find and support amazing content creators
            </p>

            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredCreators.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No creators found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCreators.map((creator) => (
                <Card 
                  key={creator.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/creator/${creator.id}`)}
                >
                  <div className="relative h-32 bg-gradient-to-br from-primary/20 to-primary/5">
                    {creator.cover_image_url && (
                      <img 
                        src={creator.cover_image_url} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16 border-4 border-background -mt-8">
                        <AvatarImage src={creator.avatar_url || undefined} />
                        <AvatarFallback>{creator.display_name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 pt-2">
                        <CardTitle className="text-lg">{creator.display_name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            {creator.total_subscribers}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <CardDescription className="line-clamp-2 mb-4">
                      {creator.bio}
                    </CardDescription>
                    <Button className="w-full" onClick={() => toast({ description: "View Profile — coming soon" })}>
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
