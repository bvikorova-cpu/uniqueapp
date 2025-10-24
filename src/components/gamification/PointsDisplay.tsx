import { Trophy, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGamification } from "@/hooks/useGamification";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export const PointsDisplay = () => {
  const [userId, setUserId] = useState<string | undefined>();
  const { data } = useGamification(userId);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id);
    });
  }, []);

  if (!data) return null;

  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="gap-1">
        <Trophy className="h-3 w-3" />
        Level {data.points.level}
      </Badge>
      <Badge variant="outline" className="gap-1">
        <Star className="h-3 w-3 text-gold" />
        {data.points.total_points} XP
      </Badge>
    </div>
  );
};