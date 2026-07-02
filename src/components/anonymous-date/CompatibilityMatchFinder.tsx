import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Sparkles, Heart, Loader2, MapPin, Globe, Target, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props {
  credits: number;
  loading: boolean;
  onFindMatch: (filters: {
    location?: string;
    preferred_gender?: string;
    relationship_goal?: string;
    languages?: string[];
    min_shared_interests?: number;
  }) => Promise<any> | void;
}

const GENDERS = ["Any", "Male", "Female", "Non-binary"];
const GOALS = ["Friendship", "Casual Dating", "Serious Relationship", "Marriage", "Adventure"];
const COMMON_LANGUAGES = ["English", "Spanish", "French", "German", "Italian", "Portuguese", "Slovak", "Czech", "Polish", "Ukrainian"];

const MATCH_COST = 5;

export function CompatibilityMatchFinder({ credits, loading, onFindMatch }: Props) {
  const [myProfile, setMyProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [location, setLocation] = useState("");
  const [gender, setGender] = useState("Any");
  const [goal, setGoal] = useState<string>("");
  const [selectedLangs, setSelectedLangs] = useState<string[]>([]);
  const [minShared, setMinShared] = useState<number>(1);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from("anonymous_dating_profiles")
          .select("location, preferred_gender, relationship_goal, languages, interests")
          .eq("user_id", user.id)
          .single();
        if (data) {
          setMyProfile(data);
          setLocation(data.location ?? "");
          setGender(data.preferred_gender ?? "Any");
          setGoal(data.relationship_goal ?? "");
          setSelectedLangs(Array.isArray(data.languages) ? data.languages : []);
        }
      } finally {
        setProfileLoading(false);
      }
    })();
  }, []);

  const toggleLang = (l: string) => {
    setSelectedLangs((cur) => (cur.includes(l) ? cur.filter((x) => x !== l) : [...cur, l]));
  };

  const handleSubmit = () => {
    onFindMatch({
      location: location.trim() || undefined,
      preferred_gender: gender,
      relationship_goal: goal || undefined,
      languages: selectedLangs.length ? selectedLangs : undefined,
      min_shared_interests: minShared,
    });
  };

  const insufficient = credits < MATCH_COST;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-3xl mx-auto"
    >
      <FloatingHowItWorks
        title={"Compatibility Match Finder"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-pink-500 via-primary to-accent bg-clip-text text-transparent">
          Find Your Anonymous Match
        </h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          Set your preferences. Our compatibility engine ranks anonymous candidates by shared interests,
          languages, location and relationship goals — then pairs you with one of the top matches.
        </p>
      </div>

      <Card className="p-5 sm:p-6 bg-card/70 backdrop-blur-xl border border-border/50 space-y-6">
        {profileLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-pink-500" /> Location
                </Label>
                <Input
                  placeholder="e.g. Berlin, Vienna…"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground">Leave empty for worldwide matches.</p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-pink-500" /> Preferred gender
                </Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-pink-500" /> Relationship goal
                </Label>
                <Select value={goal} onValueChange={setGoal}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any goal" />
                  </SelectTrigger>
                  <SelectContent>
                    {GOALS.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-pink-500" /> Languages
              </Label>
              <div className="flex flex-wrap gap-2">
                {COMMON_LANGUAGES.map((l) => {
                  const active = selectedLangs.includes(l);
                  return (
                    <button
                      key={l}
                      type="button"
                      onClick={() => toggleLang(l)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        active
                          ? "bg-pink-500/15 text-pink-500 border-pink-500/40 shadow-[0_0_12px_hsl(var(--primary)/0.25)]"
                          : "bg-muted/30 text-muted-foreground border-border/50 hover:border-pink-500/30"
                      }`}
                    >
                      {l}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground">
                Candidates must share at least one selected language.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5 text-pink-500" /> Minimum shared interests
                </Label>
                <Badge variant="secondary" className="text-xs">
                  ≥ {minShared}
                </Badge>
              </div>
              <Slider
                value={[minShared]}
                onValueChange={(v) => setMinShared(v[0] ?? 0)}
                min={0}
                max={6}
                step={1}
              />
              <p className="text-[10px] text-muted-foreground">
                Higher = stricter compatibility. We automatically relax this if no one qualifies.
              </p>
              {myProfile?.interests?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {myProfile.interests.slice(0, 10).map((i: string) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                    >
                      {i}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-border/40 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Cost per match</span>
                <Badge className="bg-primary/15 text-primary border-primary/30">{MATCH_COST} credits</Badge>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={loading || insufficient}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-90 text-white font-bold"
                size="lg"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {loading ? "Finding your match…" : insufficient ? `Need ${MATCH_COST} credits` : "Find Anonymous Match"}
              </Button>
              {insufficient && (
                <p className="text-[11px] text-center text-muted-foreground">
                  You currently have {credits} credit{credits === 1 ? "" : "s"}. Visit the Credit Store to top up.
                </p>
              )}
            </div>
          </>
        )}
      </Card>

      <Card className="p-4 bg-card/40 backdrop-blur-sm border border-border/40">
        <div className="flex items-start gap-3">
          <Search className="h-4 w-4 text-pink-500 mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <strong className="text-foreground">How compatibility works:</strong> we filter active anonymous profiles
            by your preferences, then score each candidate by shared interests, language overlap and relationship
            goal alignment. The top-ranked pool is randomized so every match feels fresh — never the same person twice.
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
