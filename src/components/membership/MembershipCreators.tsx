import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Users, Heart, Gift, Search, CheckCircle2 } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Creator {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  total_subscribers: number;
  is_verified: boolean;
}

export const MembershipCreators = () => {
  const navigate = useNavigate();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCreators, setFilteredCreators] = useState<Creator[]>([]);
  const [loadingCreators, setLoadingCreators] = useState(true);

  useEffect(() => {
    loadCreators();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = creators.filter(
        (c) => c.display_name.toLowerCase().includes(searchTerm.toLowerCase()) || c.bio?.toLowerCase().includes(searchTerm.toLowerCase())
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
    } catch (error) {
      console.error("Error loading creators:", error);
    } finally {
      setLoadingCreators(false);
    }
  };

  return (
    <div className="mb-8">
      <FloatingHowItWorks
        title={"Membership Creators"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="text-center mb-6">
        <h2 className="text-2xl font-black mb-2 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
          Browse All Creators
        </h2>
        <p className="text-sm text-muted-foreground">Discover amazing creators and support them with memberships</p>
      </div>

      <div className="max-w-2xl mx-auto mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search creators by name or bio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card/80 backdrop-blur-xl border-border/50"
          />
        </div>
      </div>

      {loadingCreators ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Loading creators...</p>
        </div>
      ) : filteredCreators.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-sm">
            {searchTerm ? "No creators found matching your search" : "No creators yet. Be the first!"}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCreators.map((creator) => (
            <Card key={creator.id} className="bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/40 hover:shadow-lg transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-lg flex-shrink-0">
                    {creator.display_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <CardTitle className="text-sm truncate">{creator.display_name}</CardTitle>
                      {creator.is_verified && <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />}
                    </div>
                    <CardDescription className="line-clamp-2 text-xs">{creator.bio || "No bio yet"}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span>{creator.total_subscribers || 0} subscribers</span>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button className="flex-1" variant="outline" size="sm" onClick={() => navigate(`/creator/${creator.user_id}`)}>
                  <Heart className="mr-1.5 h-3.5 w-3.5" /> View
                </Button>
                <Button variant="default" size="sm" onClick={() => navigate(`/creator/${creator.user_id}?gift=true`)}>
                  <Gift className="h-3.5 w-3.5" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
