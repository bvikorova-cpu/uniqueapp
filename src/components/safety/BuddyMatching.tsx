import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Heart, Sparkles, Loader2 } from "lucide-react";
import { useBuddyProfile, useBuddies } from "@/hooks/useSafetyExtras";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const TAGS = ["cyber", "school", "verbal", "exclusion", "lgbtq+", "race", "appearance", "anxiety"];

export function BuddyMatching() {
  const { profile, upsert } = useBuddyProfile();
  const { data: buddies = [] } = useBuddies();
  const [handle, setHandle] = useState(profile?.anonymous_handle || "");
  const [age, setAge] = useState(profile?.age_range || "13-17");
  const [tags, setTags] = useState<string[]>(profile?.experience_tags || []);
  const [lookingFor, setLookingFor] = useState(profile?.looking_for || "");

  const toggleTag = (t: string) => setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const requestBuddy = async (otherUserId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("Sign in required");
    const { error } = await supabase.from("safety_buddy_matches").insert({ user_a: user.id, user_b: otherUserId });
    if (error) toast.error(error.message);
    else toast.success("Buddy request sent");
  };

  return (
    <>
      <FloatingHowItWorks title={"Buddy Matching - How it works"} steps={[{ title: 'Open', desc: 'Access the Buddy Matching section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Buddy Matching.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="grid lg:grid-cols-2 gap-4">
      <Card className="border-pink-500/30 bg-gradient-to-br from-pink-500/5 to-card/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserPlus className="h-4 w-4 text-pink-400" /> Your Buddy Profile
          </CardTitle>
          <CardDescription className="text-xs">Anonymous — only your handle is shown to others.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Anonymous handle</label>
            <Input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="e.g. SilverFox42" maxLength={24} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Age range</label>
            <Input value={age} onChange={(e) => setAge(e.target.value)} placeholder="13-17 / 18-25 / 26+" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Experience tags</label>
            <div className="flex flex-wrap gap-1 mt-1">
              {TAGS.map((t) => (
                <Badge
                  key={t}
                  variant={tags.includes(t) ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => toggleTag(t)}
                >
                  {t}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Looking for</label>
            <Textarea value={lookingFor} onChange={(e) => setLookingFor(e.target.value)} placeholder="e.g. Someone who's been through cyberbullying..." rows={2} />
          </div>
          <Button
            className="w-full bg-pink-600 hover:bg-pink-500"
            onClick={() => upsert.mutate({ anonymous_handle: handle, age_range: age, experience_tags: tags, looking_for: lookingFor })}
            disabled={!handle || upsert.isPending}
          >
            {upsert.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : profile ? "Update Profile" : "Join Buddy Pool"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/40 bg-card/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-pink-400" /> Find a Buddy
          </CardTitle>
          <CardDescription className="text-xs">Anonymous peer support — connect with someone who understands.</CardDescription>
        </CardHeader>
        <CardContent>
          {buddies.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No buddies online — check back soon.</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-auto">
              {buddies.map((b: any) => {
                const overlap = (profile?.experience_tags || []).filter((t: string) => (b.experience_tags || []).includes(t)).length;
                return (
                  <div key={b.id} className="p-3 rounded-lg bg-card/40 border border-border/40">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Heart className="h-3 w-3 text-pink-400" />
                        <span className="text-sm font-bold text-foreground">{b.anonymous_handle}</span>
                        <Badge variant="outline" className="text-[10px]">{b.age_range}</Badge>
                      </div>
                      {overlap > 0 && (
                        <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px]">
                          <Sparkles className="h-2 w-2 mr-1" /> {overlap} shared
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {(b.experience_tags || []).slice(0, 4).map((t: string) => (
                        <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{b.looking_for}</p>
                    <Button size="sm" className="w-full bg-pink-600 hover:bg-pink-500 h-7 text-xs" onClick={() => requestBuddy(b.user_id)}>
                      Send Buddy Request
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
