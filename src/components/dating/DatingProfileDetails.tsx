import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Ruler, Briefcase, GraduationCap, Heart, Baby, PawPrint, Cigarette, Wine, Dumbbell, Salad, Languages, Sparkles, Brain, Music, Film, BookOpen, Plane, Quote, Pencil } from "lucide-react";

export interface DatingDetails {
  height_cm?: number | null;
  job_title?: string | null;
  company?: string | null;
  education?: string | null;
  relationship_goal?: string | null;
  kids?: string | null;
  pets?: string | null;
  smoking?: string | null;
  drinking?: string | null;
  exercise?: string | null;
  diet?: string | null;
  languages?: string[] | null;
  zodiac?: string | null;
  personality_type?: string | null;
  music_taste?: string | null;
  favorite_movies?: string | null;
  favorite_books?: string | null;
  travel_style?: string | null;
  favorite_quote?: string | null;
  interests?: string[] | null;
}

const SELECTS: Record<string, string[]> = {
  relationship_goal: ["Long-term relationship", "Short-term fun", "Open to anything", "New friends", "Marriage"],
  kids: ["Don't have kids", "Have kids", "Want kids", "Don't want kids", "Not sure yet"],
  pets: ["Dog", "Cat", "Other pet", "No pets", "Want a pet", "Allergic"],
  smoking: ["Non-smoker", "Social smoker", "Regular smoker", "Trying to quit"],
  drinking: ["Never", "Socially", "Often", "Sober"],
  exercise: ["Every day", "Often", "Sometimes", "Never"],
  diet: ["Omnivore", "Vegetarian", "Vegan", "Pescatarian", "Halal", "Kosher"],
  zodiac: ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"],
  personality_type: ["INTJ", "INTP", "ENTJ", "ENTP", "INFJ", "INFP", "ENFJ", "ENFP", "ISTJ", "ISFJ", "ESTJ", "ESFJ", "ISTP", "ISFP", "ESTP", "ESFP"],
  travel_style: ["City breaks", "Beach", "Mountains", "Backpacking", "Road trips", "Luxury", "Homebody"],
};

const INTEREST_OPTIONS = [
  "Music", "Movies", "Travel", "Fitness", "Cooking", "Gaming", "Reading", "Art", "Photography",
  "Dancing", "Hiking", "Coffee", "Wine", "Pets", "Yoga", "Football", "Tech", "Fashion", "Festivals", "Nature",
];

const FIELD_META: { key: keyof DatingDetails; label: string; icon: any }[] = [
  { key: "height_cm", label: "Height", icon: Ruler },
  { key: "job_title", label: "Work", icon: Briefcase },
  { key: "education", label: "Education", icon: GraduationCap },
  { key: "relationship_goal", label: "Looking for", icon: Heart },
  { key: "kids", label: "Kids", icon: Baby },
  { key: "pets", label: "Pets", icon: PawPrint },
  { key: "smoking", label: "Smoking", icon: Cigarette },
  { key: "drinking", label: "Drinking", icon: Wine },
  { key: "exercise", label: "Exercise", icon: Dumbbell },
  { key: "diet", label: "Diet", icon: Salad },
  { key: "zodiac", label: "Zodiac", icon: Sparkles },
  { key: "personality_type", label: "Personality", icon: Brain },
  { key: "music_taste", label: "Music", icon: Music },
  { key: "favorite_movies", label: "Movies & shows", icon: Film },
  { key: "favorite_books", label: "Books", icon: BookOpen },
  { key: "travel_style", label: "Travel style", icon: Plane },
];

export function DatingDetailsGrid({ details, compact = false }: { details: DatingDetails; compact?: boolean }) {
  const rows = FIELD_META.filter((f) => {
    const v = details[f.key];
    return v !== null && v !== undefined && String(v).trim() !== "";
  });
  const langs = details.languages?.filter(Boolean) || [];
  const interests = details.interests?.filter(Boolean) || [];

  if (rows.length === 0 && langs.length === 0 && interests.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className={compact ? "grid grid-cols-1 gap-2" : "grid grid-cols-1 sm:grid-cols-2 gap-2"}>
        {rows.map(({ key, label, icon: Icon }) => {
          let value = String(details[key]);
          if (key === "height_cm") value = `${details.height_cm} cm`;
          if (key === "job_title" && details.company) value = `${details.job_title} @ ${details.company}`;
          return (
            <div key={key as string} className="flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2">
              <Icon className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className="text-sm font-medium break-words">{value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {langs.length > 0 && (
        <div className="flex items-start gap-2">
          <Languages className="h-4 w-4 mt-1 text-primary shrink-0" />
          <div className="flex flex-wrap gap-1.5">{langs.map((l) => <Badge key={l} variant="secondary" className="text-xs font-normal">{l}</Badge>)}</div>
        </div>
      )}

      {interests.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {interests.map((i) => <Badge key={i} variant="outline" className="text-xs font-normal">{i}</Badge>)}
        </div>
      )}

      {details.favorite_quote && (
        <p className="text-sm italic text-muted-foreground flex gap-2"><Quote className="h-4 w-4 shrink-0 text-primary" />{details.favorite_quote}</p>
      )}
    </div>
  );
}

export function DatingProfileDetailsCard({
  profileId,
  details,
  onSaved,
}: {
  profileId: string;
  details: DatingDetails;
  onSaved: (patch: DatingDetails) => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<DatingDetails>(details);

  const openDialog = () => { setForm(details); setOpen(true); };

  const setField = (key: keyof DatingDetails, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const toggleInterest = (v: string) => {
    const cur = form.interests || [];
    setField("interests", cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]);
  };

  const save = async () => {
    setSaving(true);
    const patch: any = {
      height_cm: form.height_cm ? Number(form.height_cm) : null,
      job_title: form.job_title || null,
      company: form.company || null,
      education: form.education || null,
      relationship_goal: form.relationship_goal || null,
      kids: form.kids || null,
      pets: form.pets || null,
      smoking: form.smoking || null,
      drinking: form.drinking || null,
      exercise: form.exercise || null,
      diet: form.diet || null,
      languages: (form.languages || []).filter(Boolean),
      zodiac: form.zodiac || null,
      personality_type: form.personality_type || null,
      music_taste: form.music_taste || null,
      favorite_movies: form.favorite_movies || null,
      favorite_books: form.favorite_books || null,
      travel_style: form.travel_style || null,
      favorite_quote: form.favorite_quote || null,
      interests: (form.interests || []).filter(Boolean),
    };
    const { error } = await supabase.from("dating_profiles").update(patch).eq("id", profileId);
    setSaving(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Saved", description: "Your details are updated" });
    onSaved(patch);
    setOpen(false);
  };

  const filled = FIELD_META.filter((f) => {
    const v = details[f.key];
    return v !== null && v !== undefined && String(v).trim() !== "";
  }).length + (details.languages?.length ? 1 : 0) + (details.interests?.length ? 1 : 0);

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold text-sm">About me</h3>
          <p className="text-xs text-muted-foreground">{filled} of {FIELD_META.length + 2} details filled in</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={openDialog}><Pencil className="h-3.5 w-3.5" />Edit details</Button>
      </div>

      {filled === 0
        ? <p className="text-sm text-muted-foreground">Add your height, work, lifestyle, languages and interests — richer profiles get shown more often.</p>
        : <DatingDetailsGrid details={details} />}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>About me</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium mb-1.5 block">Height (cm)</label><Input type="number" min={120} max={230} value={form.height_cm ?? ""} onChange={(e) => setField("height_cm", e.target.value ? parseInt(e.target.value) : null)} /></div>
              <div><label className="text-sm font-medium mb-1.5 block">Job title</label><Input value={form.job_title ?? ""} onChange={(e) => setField("job_title", e.target.value)} placeholder="Designer" /></div>
              <div><label className="text-sm font-medium mb-1.5 block">Company / school</label><Input value={form.company ?? ""} onChange={(e) => setField("company", e.target.value)} /></div>
              <div><label className="text-sm font-medium mb-1.5 block">Education</label><Input value={form.education ?? ""} onChange={(e) => setField("education", e.target.value)} placeholder="Bachelor's degree" /></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {Object.entries(SELECTS).map(([key, options]) => (
                <div key={key}>
                  <label className="text-sm font-medium mb-1.5 block capitalize">{key.replace(/_/g, " ")}</label>
                  <select
                    className="w-full p-2.5 border rounded-lg bg-background text-foreground text-sm"
                    value={(form as any)[key] ?? ""}
                    onChange={(e) => setField(key as keyof DatingDetails, e.target.value)}
                  >
                    <option value="">Not specified</option>
                    {options.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <div><label className="text-sm font-medium mb-1.5 block">Languages (comma separated)</label><Input value={(form.languages || []).join(", ")} onChange={(e) => setField("languages", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} placeholder="English, Slovak, German" /></div>
            <div className="grid grid-cols-1 gap-3">
              <div><label className="text-sm font-medium mb-1.5 block">Music taste</label><Input value={form.music_taste ?? ""} onChange={(e) => setField("music_taste", e.target.value)} placeholder="Indie, techno, jazz" /></div>
              <div><label className="text-sm font-medium mb-1.5 block">Favorite movies & shows</label><Input value={form.favorite_movies ?? ""} onChange={(e) => setField("favorite_movies", e.target.value)} /></div>
              <div><label className="text-sm font-medium mb-1.5 block">Favorite books</label><Input value={form.favorite_books ?? ""} onChange={(e) => setField("favorite_books", e.target.value)} /></div>
              <div><label className="text-sm font-medium mb-1.5 block">Favorite quote</label><Input value={form.favorite_quote ?? ""} onChange={(e) => setField("favorite_quote", e.target.value)} /></div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Interests</label>
              <div className="flex flex-wrap gap-1.5">
                {INTEREST_OPTIONS.map((i) => {
                  const active = (form.interests || []).includes(i);
                  return (
                    <button key={i} type="button" onClick={() => toggleInterest(i)}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}>
                      {i}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <Button onClick={save} disabled={saving} className="flex-1 bg-gradient-to-r from-primary to-accent">{saving ? "Saving..." : "Save details"}</Button>
              <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
