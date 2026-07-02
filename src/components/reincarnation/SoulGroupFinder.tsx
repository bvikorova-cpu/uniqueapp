import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, Search, Heart, MapPin, Clock, Sparkles, Link2, UserPlus, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface SoulConnection {
  id: string;
  user_id: string;
  display_name: string;
  shared_eras: string[];
  shared_locations: string[];
  shared_themes: string[];
  connection_strength: number;
  discovered_at: string;
}

export const SoulGroupFinder = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [myProfile, setMyProfile] = useState<{ eras: string[]; locations: string[]; themes: string[] }>({ eras: [], locations: [], themes: [] });
  const [connections, setConnections] = useState<SoulConnection[]>([]);
  const [publicProfiles, setPublicProfiles] = useState<any[]>([]);

  useEffect(() => {
    loadMyProfile();
  }, []);

  const loadMyProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("past_life_readings")
        .select("*")
        .eq("user_id", user.id);

      if (data && data.length > 0) {
        const eras = [...new Set(data.map((r: any) => r.era).filter(Boolean))];
        const locations = [...new Set(data.map((r: any) => (r.reading_result as any)?.location).filter(Boolean))];
        const themes = [...new Set(data.map((r: any) => (r.reading_result as any)?.karmic_lesson).filter(Boolean))];
        setMyProfile({ eras, locations, themes });
      }

      await findConnections(user.id);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const findConnections = async (userId: string) => {
    try {
      // Find other users with past life readings (anonymized)
      const { data: allReadings } = await supabase
        .from("past_life_readings")
        .select("user_id, era, reading_result")
        .neq("user_id", userId)
        .limit(500);

      if (!allReadings || allReadings.length === 0) return;

      // Get my readings for comparison
      const { data: myReadings } = await supabase
        .from("past_life_readings")
        .select("era, reading_result")
        .eq("user_id", userId);

      if (!myReadings) return;

      const myEras = new Set(myReadings.map((r: any) => r.era).filter(Boolean));
      const myLocations = new Set(myReadings.map((r: any) => (r.reading_result as any)?.location).filter(Boolean));
      const myThemes = new Set(myReadings.map((r: any) => (r.reading_result as any)?.karmic_lesson).filter(Boolean));

      // Group other users' readings
      const userMap = new Map<string, { eras: string[]; locations: string[]; themes: string[] }>();
      allReadings.forEach((r: any) => {
        if (!userMap.has(r.user_id)) {
          userMap.set(r.user_id, { eras: [], locations: [], themes: [] });
        }
        const entry = userMap.get(r.user_id)!;
        if (r.era) entry.eras.push(r.era);
        const loc = (r.reading_result as any)?.location;
        if (loc) entry.locations.push(loc);
        const theme = (r.reading_result as any)?.karmic_lesson;
        if (theme) entry.themes.push(theme);
      });

      // Calculate connections
      const foundConnections: SoulConnection[] = [];
      userMap.forEach((profile, otherId) => {
        const sharedEras = [...new Set(profile.eras)].filter(e => myEras.has(e));
        const sharedLocations = [...new Set(profile.locations)].filter(l => myLocations.has(l));
        const sharedThemes = [...new Set(profile.themes)].filter(t => myThemes.has(t));

        const totalShared = sharedEras.length + sharedLocations.length + sharedThemes.length;
        if (totalShared > 0) {
          const strength = Math.min(100, Math.round(
            (sharedEras.length * 25 + sharedLocations.length * 20 + sharedThemes.length * 30)
          ));

          foundConnections.push({
            id: otherId,
            user_id: otherId,
            display_name: `Soul #${otherId.substring(0, 6).toUpperCase()}`,
            shared_eras: sharedEras,
            shared_locations: sharedLocations,
            shared_themes: sharedThemes,
            connection_strength: strength,
            discovered_at: new Date().toISOString(),
          });
        }
      });

      foundConnections.sort((a, b) => b.connection_strength - a.connection_strength);
      setConnections(foundConnections.slice(0, 20));
    } catch (error) {
      console.error("Error finding connections:", error);
    }
  };

  const searchSoulGroups = async () => {
    if (!searchQuery.trim()) {
      toast({ title: "Enter an era, location, or theme to search", variant: "destructive" });
      return;
    }

    setSearching(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const query = searchQuery.toLowerCase();

      // Search readings matching the query
      const { data } = await supabase
        .from("past_life_readings")
        .select("user_id, era, reading_result, created_at")
        .neq("user_id", user.id)
        .limit(100);

      if (data) {
        const matches = data.filter((r: any) => {
          const era = (r.era || "").toLowerCase();
          const loc = ((r.reading_result as any)?.location || "").toLowerCase();
          const theme = ((r.reading_result as any)?.karmic_lesson || "").toLowerCase();
          return era.includes(query) || loc.includes(query) || theme.includes(query);
        });

        // Group by user
        const groupedByUser = new Map<string, any[]>();
        matches.forEach((m: any) => {
          if (!groupedByUser.has(m.user_id)) groupedByUser.set(m.user_id, []);
          groupedByUser.get(m.user_id)!.push(m);
        });

        const results = Array.from(groupedByUser.entries()).map(([userId, readings]) => ({
          id: userId,
          display_name: `Soul #${userId.substring(0, 6).toUpperCase()}`,
          matching_readings: readings.length,
          sample_era: readings[0]?.era || "Unknown",
          sample_location: (readings[0]?.reading_result as any)?.location || "Unknown",
        }));

        setPublicProfiles(results);
        toast({ title: `Found ${results.length} matching souls`, description: `Searching for "${searchQuery}"` });
      }
    } catch (error: any) {
      toast({ title: "Search Failed", description: error.message, variant: "destructive" });
    } finally {
      setSearching(false);
    }
  };

  const getStrengthColor = (strength: number) => {
    if (strength >= 70) return "text-emerald-500";
    if (strength >= 40) return "text-amber-500";
    return "text-muted-foreground";
  };

  const getStrengthLabel = (strength: number) => {
    if (strength >= 70) return "Strong Bond";
    if (strength >= 40) return "Moderate";
    return "Faint Echo";
  };

  if (loading) {
    return (
      <>
        <FloatingHowItWorks
          title='Soul Group Finder'
          steps={[
          { title: 'Open the tool', desc: 'Launch the Soul Group Finder panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
        />
      <Card className="p-12 text-center bg-card/80 backdrop-blur-xl border-border/50">
        <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
      </Card>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/50">
        <h3 className="text-lg font-black mb-2">Soul Group Finder</h3>
        <p className="text-sm text-muted-foreground">
          Discover other souls who share past life connections with you. The algorithm compares
          eras, locations, and karmic themes across all users to find your soul group.
        </p>
      </Card>

      {/* My Soul Profile */}
      <Card className="p-5 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" /> Your Soul Fingerprint
        </h4>
        <div className="space-y-3">
          <div>
            <p className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wider">Eras Explored</p>
            <div className="flex flex-wrap gap-1.5">
              {myProfile.eras.length > 0 ? myProfile.eras.map((era, i) => (
                <Badge key={i} variant="outline" className="text-[10px]">
                  <Clock className="h-2.5 w-2.5 mr-1" />{era}
                </Badge>
              )) : <span className="text-xs text-muted-foreground">None yet</span>}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wider">Locations</p>
            <div className="flex flex-wrap gap-1.5">
              {myProfile.locations.length > 0 ? myProfile.locations.map((loc, i) => (
                <Badge key={i} variant="outline" className="text-[10px]">
                  <MapPin className="h-2.5 w-2.5 mr-1" />{loc}
                </Badge>
              )) : <span className="text-xs text-muted-foreground">None yet</span>}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wider">Karmic Themes</p>
            <div className="flex flex-wrap gap-1.5">
              {myProfile.themes.length > 0 ? myProfile.themes.map((theme, i) => (
                <Badge key={i} variant="outline" className="text-[10px]">
                  <Heart className="h-2.5 w-2.5 mr-1" />{theme}
                </Badge>
              )) : <span className="text-xs text-muted-foreground">None yet</span>}
            </div>
          </div>
        </div>
      </Card>

      {/* Search */}
      <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50">
        <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
          <Search className="h-4 w-4 text-primary" /> Search Soul Groups
        </h4>
        <div className="flex gap-2">
          <Input
            placeholder="Search by era, location, or karmic theme..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchSoulGroups()}
          />
          <Button onClick={searchSoulGroups} disabled={searching} className="shrink-0">
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        {/* Search Results */}
        {publicProfiles.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-muted-foreground">{publicProfiles.length} souls found</p>
            {publicProfiles.map((profile, i) => (
              <motion.div key={profile.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/10 border border-border/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{profile.display_name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {profile.sample_era} - {profile.sample_location}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {profile.matching_readings} shared
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* Auto-Discovered Connections */}
      <div>
        <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
          <Link2 className="h-4 w-4 text-primary" /> Discovered Soul Connections
          <Badge variant="outline" className="text-[10px] ml-auto">{connections.length} found</Badge>
        </h4>

        {connections.length === 0 ? (
          <Card className="p-8 text-center bg-card/80 backdrop-blur-xl border-border/50">
            <UserPlus className="h-12 w-12 mx-auto text-primary/30 mb-3" />
            <p className="text-muted-foreground mb-1">No soul connections found yet</p>
            <p className="text-xs text-muted-foreground">
              More past life readings increase the chances of finding your soul group
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {connections.map((conn, i) => (
              <motion.div
                key={conn.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{conn.display_name}</p>
                        <p className={`text-[10px] font-medium ${getStrengthColor(conn.connection_strength)}`}>
                          {getStrengthLabel(conn.connection_strength)} ({conn.connection_strength}%)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Connection strength bar */}
                  <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden mb-3">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${conn.connection_strength}%` }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                    />
                  </div>

                  {/* Shared elements */}
                  <div className="space-y-1.5">
                    {conn.shared_eras.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {conn.shared_eras.slice(0, 3).map((era, j) => (
                          <Badge key={j} variant="outline" className="text-[9px] py-0 px-1.5">
                            <Clock className="h-2 w-2 mr-0.5" />{era}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {conn.shared_locations.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {conn.shared_locations.slice(0, 3).map((loc, j) => (
                          <Badge key={j} variant="outline" className="text-[9px] py-0 px-1.5">
                            <MapPin className="h-2 w-2 mr-0.5" />{loc}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {conn.shared_themes.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {conn.shared_themes.slice(0, 3).map((theme, j) => (
                          <Badge key={j} variant="outline" className="text-[9px] py-0 px-1.5">
                            <Heart className="h-2 w-2 mr-0.5" />{theme}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
