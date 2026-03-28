import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, CheckCircle2, ArrowRight, Crown } from "lucide-react";

interface Creator {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  total_subscribers: number;
  is_verified: boolean;
}

interface MembershipFeaturedCreatorsProps {
  onViewAll: () => void;
}

export const MembershipFeaturedCreators = ({ onViewAll }: MembershipFeaturedCreatorsProps) => {
  const navigate = useNavigate();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedCreators();
  }, []);

  const fetchFeaturedCreators = async () => {
    try {
      const { data } = await supabase
        .from("creator_profiles")
        .select("*")
        .order("total_subscribers", { ascending: false })
        .limit(6);
      if (data) setCreators(data);
    } catch (error) {
      console.error("Error fetching creators:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (creators.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Featured Creators
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Top creators building amazing communities</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onViewAll} className="gap-1 text-primary hover:text-primary/80">
          View All <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {creators.map((creator, i) => (
          <motion.div
            key={creator.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card
              className="bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer group overflow-hidden"
              onClick={() => navigate(`/creator/${creator.user_id}`)}
            >
              <CardContent className="p-3 text-center">
                <div className="relative inline-block mb-2">
                  <Avatar className="w-14 h-14 mx-auto ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all">
                    <AvatarImage src={creator.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-foreground font-bold">
                      {creator.display_name?.charAt(0)?.toUpperCase() || "C"}
                    </AvatarFallback>
                  </Avatar>
                  {creator.is_verified && (
                    <CheckCircle2 className="w-4 h-4 text-primary absolute -bottom-0.5 -right-0.5 bg-background rounded-full" />
                  )}
                </div>
                <h3 className="font-bold text-xs text-foreground truncate">{creator.display_name}</h3>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Users className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{creator.total_subscribers?.toLocaleString() || 0}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
