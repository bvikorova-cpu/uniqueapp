import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MapPin, Sparkles, Heart, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

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
  const [selected, setSelected] = useState<DemoProfile | null>(null);

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

  const cleanBio = (bio: string | null) =>
    (bio || "").replace(/\[seed:[^\]]+\]/g, "").trim();

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
          <Card
            key={p.id}
            onClick={() => p.display_name && setSelected(p)}
            className="overflow-hidden border-border/50 group cursor-pointer hover:border-primary/50 transition-colors"
            role={p.display_name ? "button" : undefined}
            tabIndex={p.display_name ? 0 : undefined}
            onKeyDown={(e) => {
              if (p.display_name && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                setSelected(p);
              }
            }}
          >
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
        Tap any profile for a preview. Subscribe to unlock swipe, chat and 100% of profiles.
      </p>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          {selected && (
            <>
              <div className="relative aspect-[4/5] bg-muted">
                {selected.profile_photo_url && (
                  <img
                    src={selected.profile_photo_url}
                    alt={selected.display_name}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4">
                  <DialogHeader className="text-left space-y-1">
                    <DialogTitle className="text-white text-2xl font-bold">
                      {selected.display_name}{selected.age ? `, ${selected.age}` : ""}
                    </DialogTitle>
                    {selected.location && (
                      <DialogDescription className="text-white/85 flex items-center gap-1 text-sm">
                        <MapPin className="h-3.5 w-3.5" />
                        {selected.location}
                      </DialogDescription>
                    )}
                  </DialogHeader>
                </div>
                <Badge className="absolute top-3 right-3" variant="secondary">Preview</Badge>
              </div>

              <div className="p-4 space-y-4">
                {cleanBio(selected.bio) && (
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {cleanBio(selected.bio)}
                  </p>
                )}

                {selected.interests && selected.interests.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selected.interests.slice(0, 8).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[11px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-3 flex items-start gap-2">
                  <Lock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Swipe, likes and chat are unlocked with a Dating subscription (€2/mo).
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setSelected(null)}>
                    Close
                  </Button>
                  <Button asChild className="flex-1">
                    <Link to="/dating/subscribe">
                      <Heart className="h-4 w-4 mr-1.5" />
                      Unlock
                    </Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default DemoProfilesWall;
