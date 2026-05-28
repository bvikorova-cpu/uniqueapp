import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Users, Filter, Map, Download, FileBarChart, Clock, BookOpen, Sparkles, ShieldCheck, ShieldAlert, Volume2, Type, Calculator, TrendingUp, Cat, Trophy, ClipboardCheck, Share2, Plus, ArrowLeft } from "lucide-react";
import { useKidsChildren, kidsCall } from "@/hooks/useKidsRouter";
import { toast } from "sonner";

export const KIDS_FEATURES = [
  { slug: "children", title: "Family Profiles", desc: "Multi-child profiles", icon: Users, color: "from-pink-500 to-rose-500" },
  { slug: "age-filter", title: "Age Filter", desc: "6-8 · 9-10 · 11-12", icon: Filter, color: "from-purple-500 to-fuchsia-500" },
  { slug: "path", title: "Daily Learning Path", desc: "Structured day", icon: Map, color: "from-indigo-500 to-blue-500" },
  { slug: "saved", title: "Saved / Offline", desc: "Save for later", icon: Download, color: "from-sky-500 to-cyan-500" },
  { slug: "reports", title: "Parental Reports", desc: "Weekly insights", icon: FileBarChart, color: "from-teal-500 to-emerald-500" },
  { slug: "screen-time", title: "Screen Time", desc: "Daily limits + bedtime", icon: Clock, color: "from-emerald-500 to-green-500" },
  { slug: "curriculum", title: "Curriculum Levels", desc: "Math · Reading · Science", icon: BookOpen, color: "from-lime-500 to-yellow-500" },
  { slug: "recommend", title: "AI Suggestions", desc: "Personalised next steps", icon: Sparkles, color: "from-yellow-500 to-orange-500" },
  { slug: "safety", title: "AI Safety", desc: "Filters + blocklists", icon: ShieldCheck, color: "from-orange-500 to-red-500" },
  { slug: "approval", title: "Parent Approval", desc: "Review AI outputs", icon: ShieldAlert, color: "from-red-500 to-pink-500" },
  { slug: "narration", title: "Read-aloud", desc: "Voice narration", icon: Volume2, color: "from-pink-500 to-purple-500" },
  { slug: "phonics", title: "Phonics Quest", desc: "Spelling mini-game", icon: Type, color: "from-purple-500 to-indigo-500" },
  { slug: "math", title: "Math Quest", desc: "Math mini-game", icon: Calculator, color: "from-indigo-500 to-blue-500" },
  { slug: "difficulty", title: "Adaptive Difficulty", desc: "Auto-tunes per child", icon: TrendingUp, color: "from-blue-500 to-cyan-500" },
  { slug: "pet", title: "Pet Companion", desc: "Avatar + buddy pet", icon: Cat, color: "from-cyan-500 to-teal-500" },
  { slug: "economy", title: "XP · Coins · Streak", desc: "Achievement economy", icon: Trophy, color: "from-teal-500 to-emerald-500" },
  { slug: "assignments", title: "Assignments", desc: "Parent/teacher tasks", icon: ClipboardCheck, color: "from-emerald-500 to-lime-500" },
  { slug: "share", title: "Family Sharing", desc: "Secure share links", icon: Share2, color: "from-lime-500 to-yellow-500" },
];

export function ChildPicker() {
  const { children, activeId, setActive, refresh } = useKidsChildren();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState(""); const [age, setAge] = useState(8);

  const create = async () => {
    if (!name.trim()) return;
    await kidsCall("children.create", { name, age });
    setName(""); setAdding(false); await refresh();
    toast.success("Child added");
  };

  return (
    <Card className="p-4 bg-card/80 backdrop-blur border-primary/20">
      <div className="flex items-center gap-3 flex-wrap">
        <Users className="w-5 h-5 text-primary" />
        <span className="font-semibold">Active child:</span>
        {children.length === 0 ? (
          <Badge variant="secondary">No children yet</Badge>
        ) : (
          <Select value={activeId || ""} onValueChange={setActive}>
            <SelectTrigger className="w-[220px]"><SelectValue placeholder="Pick a child" /></SelectTrigger>
            <SelectContent>
              {children.map(c => <SelectItem key={c.id} value={c.id}>{c.name} · {c.age}y</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        {!adding ? (
          <Button size="sm" variant="outline" onClick={() => setAdding(true)}><Plus className="w-4 h-4 mr-1" />Add child</Button>
        ) : (
          <div className="flex items-center gap-2">
            <Input className="w-32" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
            <Input className="w-20" type="number" min={4} max={14} value={age} onChange={e => setAge(parseInt(e.target.value)||8)} />
            <Button size="sm" onClick={create}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        )}
      </div>
    </Card>
  );
}

export default function KidsHub() {
  const { activeChild } = useKidsChildren();
  const [eco, setEco] = useState<any>(null);

  useEffect(() => {
    if (!activeChild) { setEco(null); return; }
    kidsCall("economy.get", { child_id: activeChild.id }).then(r => setEco((r as any).economy)).catch(() => {});
  }, [activeChild?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-4 md:p-8 pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <Link to="/kids-channel" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"><ArrowLeft className="w-4 h-4" />Kids Channel</Link>
            <h1 className="text-4xl font-bold mt-1">Kids Hub</h1>
            <p className="text-muted-foreground">18 family-grade tools — child profiles, learning paths, parental controls and more.</p>
          </div>
          {eco && (
            <div className="flex gap-2">
              <Badge variant="secondary">XP {eco.xp}</Badge>
              <Badge variant="secondary">🪙 {eco.coins}</Badge>
              <Badge variant="secondary">🔥 {eco.streak_days}d</Badge>
            </div>
          )}
        </div>

        <ChildPicker />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {KIDS_FEATURES.map(f => {
            const Icon = f.icon;
            return (
              <Link key={f.slug} to={`/kids-channel/hub/${f.slug}`}>
                <Card className="p-5 hover:scale-[1.03] transition-transform cursor-pointer h-full bg-card/80 backdrop-blur border-primary/20">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
