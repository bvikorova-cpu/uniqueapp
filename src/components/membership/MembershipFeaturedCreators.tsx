import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle2, ArrowRight, Search, Heart, Gift, SlidersHorizontal, Star, TrendingUp, Clock } from "lucide-react";
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

type SortOption = "popular" | "newest" | "verified";

interface MembershipFeaturedCreatorsProps {
  onViewAll: () => void;
}

export const MembershipFeaturedCreators = ({ onViewAll }: MembershipFeaturedCreatorsProps) => {
  const navigate = useNavigate();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      const { data } = await supabase
        .from("creator_profiles")
        .select("*")
        .order("total_subscribers", { ascending: false });
      if (data) setCreators(data);
    } catch (error) {
      console.error("Error fetching creators:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCreators = creators
    .filter((c) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        c.display_name?.toLowerCase().includes(term) ||
        c.bio?.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      if (sortBy === "popular") return (b.total_subscribers || 0) - (a.total_subscribers || 0);
      if (sortBy === "verified") return (b.is_verified ? 1 : 0) - (a.is_verified ? 1 : 0);
      return 0; // newest - default order
    });

  const displayedCreators = showAll ? filteredCreators : filteredCreators.slice(0, 8);

  if (loading) {
    return (
      <div className="mb-10">
      <FloatingHowItWorks
        title={"Membership Featured Creators"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Loading creators...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              Discover Creators
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Find and support amazing content creators</p>
          </div>
          <Badge variant="secondary" className="text-xs px-3 py-1">
            {creators.length} creators
          </Badge>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search creators by name or bio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card/80 backdrop-blur-xl border-border/50 focus:border-primary/50"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={sortBy === "popular" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("popular")}
              className="gap-1.5 text-xs"
            >
              <TrendingUp className="w-3.5 h-3.5" /> Popular
            </Button>
            <Button
              variant={sortBy === "verified" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("verified")}
              className="gap-1.5 text-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Verified
            </Button>
            <Button
              variant={sortBy === "newest" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("newest")}
              className="gap-1.5 text-xs"
            >
              <Clock className="w-3.5 h-3.5" /> Newest
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Results */}
      {filteredCreators.length === 0 ? (
        <div className="text-center py-12 bg-card/40 backdrop-blur-xl rounded-xl border border-border/50">
          <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            {searchTerm ? "No creators found matching your search" : "No creators yet. Be the first!"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayedCreators.map((creator, i) => (
              <motion.div
                key={creator.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card
                  className="bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer group overflow-hidden h-full"
                  onClick={() => navigate(`/creator/${creator.user_id}`)}
                >
                  {/* Top gradient banner */}
                  <div className="h-16 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/5 relative">
                    <div className="absolute -bottom-6 left-4">
                      <Avatar className="w-12 h-12 ring-3 ring-background group-hover:ring-primary/30 transition-all">
                        <AvatarImage src={creator.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-sm">
                          {creator.display_name?.charAt(0)?.toUpperCase() || "C"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>

                  <CardContent className="pt-8 pb-4 px-4">
                    <div className="flex items-center gap-1.5 mb-1">
                      <h3 className="font-bold text-sm text-foreground truncate">{creator.display_name}</h3>
                      {creator.is_verified && (
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3 min-h-[2rem]">
                      {creator.bio || "No bio yet"}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="w-3.5 h-3.5" />
                        <span>{creator.total_subscribers?.toLocaleString() || 0} subs</span>
                      </div>
                      <div className="flex gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/creator/${creator.user_id}?gift=true`);
                          }}
                        >
                          <Gift className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="h-7 px-3 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/creator/${creator.user_id}`);
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Show more / less */}
          {filteredCreators.length > 8 && (
            <div className="text-center mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className="gap-2"
              >
                {showAll ? "Show Less" : `View All ${filteredCreators.length} Creators`}
                <ArrowRight className={`w-4 h-4 transition-transform ${showAll ? "rotate-90" : ""}`} />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
