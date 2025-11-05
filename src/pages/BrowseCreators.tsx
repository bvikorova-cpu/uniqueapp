import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  Search,
  CheckCircle2,
  Heart,
  Gift,
} from "lucide-react";

interface Creator {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  total_subscribers: number;
  is_verified: boolean;
}

export default function BrowseCreators() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCreators, setFilteredCreators] = useState<Creator[]>([]);

  useEffect(() => {
    loadCreators();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = creators.filter(
        (creator) =>
          creator.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          creator.bio?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCreators(filtered);
    } else {
      setFilteredCreators(creators);
    }
  }, [searchTerm, creators]);

  const loadCreators = async () => {
    try {
      const { data, error } = await supabase
        .from("creator_profiles")
        .select("*")
        .order("total_subscribers", { ascending: false });

      if (error) throw error;

      setCreators(data || []);
      setFilteredCreators(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewCreator = (creatorId: string) => {
    navigate(`/creator/${creatorId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading creators...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Browse Creators</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover amazing creators and support them with exclusive memberships and gifts
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search creators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Creators Grid */}
        {filteredCreators.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No creators found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCreators.map((creator) => (
              <Card key={creator.id} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center text-white font-bold text-2xl">
                      {creator.display_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{creator.display_name}</CardTitle>
                        {creator.is_verified && (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <CardDescription className="line-clamp-2">
                        {creator.bio || "No bio yet"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{creator.total_subscribers || 0} subscribers</span>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    className="flex-1"
                    variant="outline"
                    onClick={() => handleViewCreator(creator.id)}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    View Profile
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => handleViewCreator(creator.id)}
                  >
                    <Gift className="mr-2 h-4 w-4" />
                    Send Gift
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}