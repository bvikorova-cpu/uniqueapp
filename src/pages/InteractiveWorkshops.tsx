import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Users, Calendar, Clock, Award, Zap, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

type Workshop = {
  id: string;
  slug: string;
  title: string;
  description: string;
  instructor: string;
  price_cents: number;
  duration: string;
  schedule: string;
  start_date: string | null;
  max_participants: number;
  level: string;
  image_url: string | null;
  skills: string[];
  includes: string[];
};

const InteractiveWorkshops = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [joining, setJoining] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<{ kind: "custom_request" | "topic"; open: boolean; content: string }>({
    kind: "topic",
    open: false,
    content: "",
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const { data: workshops, isLoading } = useQuery({
    queryKey: ["interactive-workshops"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("interactive_workshops" as any)
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Workshop[];
    },
  });

  const { data: enrollments } = useQuery({
    queryKey: ["interactive-workshop-enrollments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("interactive_workshop_enrollments" as any)
        .select("workshop_id,user_id");
      if (error) throw error;
      return (data ?? []) as unknown as { workshop_id: string; user_id: string }[];
    },
  });

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    const mine = new Set<string>();
    (enrollments ?? []).forEach((e) => {
      c[e.workshop_id] = (c[e.workshop_id] || 0) + 1;
      if (userId && e.user_id === userId) mine.add(e.workshop_id);
    });
    return { c, mine };
  }, [enrollments, userId]);

  const handleJoin = async (w: Workshop) => {
    if (!userId) {
      toast({ title: "Sign in required", description: "Please sign in to enroll.", variant: "destructive" });
      return;
    }
    setJoining(w.id);
    const alreadyEnrolled = counts.mine.has(w.id);
    try {
      if (alreadyEnrolled) {
        const { error } = await supabase
          .from("interactive_workshop_enrollments" as any)
          .delete()
          .eq("workshop_id", w.id)
          .eq("user_id", userId);
        if (error) throw error;
        toast({ title: "Enrollment cancelled", description: w.title });
      } else {
        const { error } = await supabase
          .from("interactive_workshop_enrollments" as any)
          .insert({ workshop_id: w.id, user_id: userId, status: "pending" });
        if (error) throw error;
        toast({ title: "Reserved your seat", description: `${w.title} — €${w.price_cents / 100}` });
      }
      qc.invalidateQueries({ queryKey: ["interactive-workshop-enrollments"] });
    } catch (e: any) {
      toast({ title: "Something went wrong", description: e?.message, variant: "destructive" });
    } finally {
      setJoining(null);
    }
  };

  const submitSuggestion = async () => {
    const content = suggestion.content.trim();
    if (content.length < 3) return;
    const { error } = await supabase
      .from("workshop_topic_suggestions" as any)
      .insert({ user_id: userId, kind: suggestion.kind, content });
    if (error) {
      toast({ title: "Couldn't send", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Thanks!", description: "Our team will review your suggestion." });
    setSuggestion({ ...suggestion, open: false, content: "" });
  };

  const availability = (id: string, max: number) => {
    const current = counts.c[id] || 0;
    const spotsLeft = Math.max(0, max - current);
    if (spotsLeft === 0) return { text: "Fully booked", color: "text-red-500", full: true, current };
    if (spotsLeft <= 3) return { text: `Only ${spotsLeft} spots left!`, color: "text-red-500", full: false, current };
    if (spotsLeft <= 5) return { text: `${spotsLeft} spots remaining`, color: "text-yellow-500", full: false, current };
    return { text: `${spotsLeft} spots available`, color: "text-green-500", full: false, current };
  };

  return (
    <>
      <FloatingHowItWorks
        title="How Interactive Workshops work"
        intro="Small-group live workshops with expert instructors."
        steps={[
          { title: "Browse workshops", desc: "Filter by topic, level and schedule." },
          { title: "Reserve your seat", desc: "One click enroll — seat count updates live." },
          { title: "Attend live", desc: "Join sessions at the scheduled time." },
          { title: "Suggest topics", desc: "Missing something? Send a topic or custom request." },
        ]}
      />
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 mt-16">
            <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Interactive Workshops
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Hands-on learning in small groups with expert instructors. Build real skills through practice.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : !workshops?.length ? (
            <Card className="p-10 text-center text-muted-foreground">No workshops available right now — check back soon.</Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {workshops.map((workshop) => {
                const av = availability(workshop.id, workshop.max_participants);
                const mine = counts.mine.has(workshop.id);
                return (
                  <Card key={workshop.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 flex flex-col">
                    <div className="h-48 overflow-hidden relative">
                      {workshop.image_url && (
                        <img src={workshop.image_url} alt={workshop.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      )}
                      <div className="absolute top-4 left-4"><Badge variant="secondary">{workshop.level}</Badge></div>
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-primary"><Zap className="w-3 h-3 mr-1" /> Interactive</Badge>
                      </div>
                      {mine && <div className="absolute bottom-4 right-4"><Badge className="bg-success">Enrolled</Badge></div>}
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold mb-2">{workshop.title}</h3>
                      <p className="text-muted-foreground mb-4 flex-1">{workshop.description}</p>

                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex items-center gap-2"><Award className="w-4 h-4 text-primary" /><span className="font-semibold">{workshop.instructor}</span></div>
                        {workshop.start_date && (
                          <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /><span>Starts {new Date(workshop.start_date).toLocaleDateString()}</span></div>
                        )}
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /><span>{workshop.duration} • {workshop.schedule}</span></div>
                        <div className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" /><span className={av.color}>{av.text}</span></div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-semibold mb-2">Skills you'll gain:</p>
                        <div className="flex flex-wrap gap-1">
                          {workshop.skills.map((skill, idx) => (<Badge key={idx} variant="outline" className="text-xs">{skill}</Badge>))}
                        </div>
                      </div>

                      <div className="mb-4 p-3 bg-primary/5 rounded-lg">
                        <p className="text-xs font-semibold mb-1">Includes:</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {workshop.includes.map((item, idx) => (<li key={idx}>✓ {item}</li>))}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t mt-auto">
                        <div>
                          <p className="text-2xl font-bold text-primary">€{(workshop.price_cents / 100).toFixed(0)}</p>
                          <p className="text-xs text-muted-foreground">Full workshop</p>
                        </div>
                        <Button
                          onClick={() => handleJoin(workshop)}
                          disabled={joining === workshop.id || (av.full && !mine)}
                          variant={mine ? "secondary" : "default"}
                        >
                          {joining === workshop.id ? "Saving..." : mine ? "Cancel" : av.full ? "Full" : "Reserve seat"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="mt-12">
            <Card className="p-8 bg-gradient-to-r from-primary/10 to-primary/5 text-center">
              <h3 className="text-2xl font-black mb-4">Don't see what you're looking for?</h3>
              <p className="text-muted-foreground mb-6">Request a custom workshop for your team or suggest a new topic</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" variant="outline" onClick={() => setSuggestion({ kind: "custom_request", open: true, content: "" })}>Request Custom Workshop</Button>
                <Button size="lg" onClick={() => setSuggestion({ kind: "topic", open: true, content: "" })}>Suggest a Topic</Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={suggestion.open} onOpenChange={(o) => setSuggestion((s) => ({ ...s, open: o }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{suggestion.kind === "custom_request" ? "Custom workshop request" : "Suggest a topic"}</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder={suggestion.kind === "custom_request" ? "Describe your team, goals, timing…" : "What topic would you love to learn?"}
            value={suggestion.content}
            onChange={(e) => setSuggestion((s) => ({ ...s, content: e.target.value.slice(0, 2000) }))}
            rows={5}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setSuggestion((s) => ({ ...s, open: false }))}>Cancel</Button>
            <Button onClick={submitSuggestion} disabled={suggestion.content.trim().length < 3}>Send</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InteractiveWorkshops;
