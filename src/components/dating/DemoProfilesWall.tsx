import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type DemoProfile = {
  id: string;
  display_name: string;
  age: number;
  gender: string | null;
  location: string | null;
  profile_photo_url: string | null;
  bio: string | null;
  interests: string[] | null;
};

export const DemoProfilesWall = () => {
  const [profiles, setProfiles] = useState<DemoProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await (supabase as any).rpc("get_demo_dating_profiles", { _limit: 8 });
      if (cancelled) return;
      if (!error && data) setProfiles(data as DemoProfile[]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  if (!loading && profiles.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Meet our community
        </h3>
        <Badge variant="outline" className="text-[10px]">Preview</Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {(loading ? Array.from({ length: 8 }).map((_, i) => ({ id: `s-${i}` } as any)) : profiles).map((p: any) => (
          <Card key={p.id} className="overflow-hidden border-border/50 group">
            <div className="relative aspect-[3/4] bg-muted overflow-hidden">
              {p.profile_photo_url ? (
                <img
                  src={p.profile_photo_url}
                  alt={p.display_name || "Profile"}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full animate-pulse" />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <p className="text-white font-semibold text-sm leading-tight">
                  {p.display_name}{p.age ? `, ${p.age}` : ""}
                </p>
                {p.location && (
                  <p className="text-white/80 text-[11px] flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" />
                    {p.location}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center mt-3">
        Subscribe to unlock swipe, chat and 100% of profiles.
      </p>
    </section>
  );
};

export default DemoProfilesWall;
