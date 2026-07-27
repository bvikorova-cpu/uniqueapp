import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Users, Plus, KeyRound, Copy, ArrowRight, BookOpen, Brain, Layers, Trophy } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { Link, useNavigate, useParams } from "react-router-dom";

const __HIW_STUDYGROUPS_STEPS = [
  { title: 'Join or create a group', desc: 'Pick a subject and invite friends or open it to everyone.' },
  { title: 'Share notes & decks', desc: 'Members can pool notes, flashcards and quizzes.' },
  { title: 'Group challenges', desc: 'Compete or cooperate on weekly group goals.' },
  { title: 'Group chat', desc: 'Ask questions and celebrate wins together.' }
];
const __HIW_STUDYGROUPS = { title: 'Study Groups', intro: 'Learn together in small focused groups.', steps: __HIW_STUDYGROUPS_STEPS };


export default function StudyGroups() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId?: string }>();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(groupId ?? null);

  const { data: groups = [] } = useQuery({
    queryKey: ["study-groups"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data: memberships, error } = await supabase
        .from("education_study_group_members")
        .select("group_id, role, education_study_groups(*)")
        .eq("user_id", user.id);
      if (error) throw error;
      return (memberships ?? []).map((m: any) => ({ ...m.education_study_groups, role: m.role }));
    } });

  useEffect(() => {
    if (groupId && groupId !== selectedGroupId) setSelectedGroupId(groupId);
    if (!selectedGroupId && groups.length > 0) setSelectedGroupId(groups[0].id);
    if (selectedGroupId && groups.length > 0 && !groups.some((group: any) => group.id === selectedGroupId)) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, groupId, selectedGroupId]);

  const selectedGroup = groups.find((group: any) => group.id === selectedGroupId) ?? null;

  const { data: memberCount = 0 } = useQuery({
    queryKey: ["study-group-members-count", selectedGroupId],
    enabled: Boolean(selectedGroupId),
    queryFn: async () => {
      if (!selectedGroupId) return 0;
      const { count, error } = await supabase
        .from("education_study_group_members")
        .select("id", { count: "exact", head: true })
        .eq("group_id", selectedGroupId);
      if (error) throw error;
      return count ?? 0;
    }
  });

  const create = useMutation({
    mutationFn: async (p: { name: string; description: string; subject: string; is_private: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data: g, error } = await supabase
        .from("education_study_groups")
        .insert({ ...p, owner_id: user.id })
        .select()
        .single();
      if (error) throw error;
      const { error: memberError } = await supabase.from("education_study_group_members").insert({ group_id: g.id, user_id: user.id, role: "owner" });
      if (memberError) throw memberError;
      return g;
    },
    onSuccess: (group) => { setSelectedGroupId(group.id); navigate(`/education/study-groups/${group.id}`); qc.invalidateQueries({ queryKey: ["study-groups"] }); toast.success("Group created"); },
    onError: (e: any) => toast.error(e?.message ?? "Failed to create group") });

  const join = useMutation({
    mutationFn: async (code: string) => {
      const { data: g, error } = await supabase
        .from("education_study_groups")
        .select("id")
        .eq("invite_code", code.trim().toLowerCase())
        .maybeSingle();
      if (error || !g) throw new Error("Invalid invite code");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error: e2 } = await supabase.from("education_study_group_members").insert({ group_id: g.id, user_id: user.id });
      if (e2) {
        if (e2.code === "23505") return g;
        throw e2;
      }
      return g;
    },
    onSuccess: (group) => { setSelectedGroupId(group.id); navigate(`/education/study-groups/${group.id}`); qc.invalidateQueries({ queryKey: ["study-groups"] }); toast.success("Group opened"); },
    onError: (e: any) => toast.error(e?.message ?? "Failed") });

  const [openCreate, setOpenCreate] = useState(false);
  const [openJoin, setOpenJoin] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [subject, setSubject] = useState("");
  const [code, setCode] = useState("");

  return (
    <>
      <FloatingHowItWorks title={__HIW_STUDYGROUPS.title} intro={__HIW_STUDYGROUPS.intro} steps={__HIW_STUDYGROUPS.steps} />
      <Helmet><title>Study Groups · Education</title></Helmet>
      <div className="container mx-auto px-4 pt-20 pb-12 max-w-5xl">
        <div className="flex items-center justify-between mb-6 gap-2 flex-wrap sm:flex-nowrap">
          <h1 className="text-xl sm:text-3xl font-black flex items-center gap-2 min-w-0 shrink"><Users className="w-6 h-6 sm:w-7 sm:h-7 text-primary shrink-0" /> <span className="truncate">Study Groups</span></h1>
          <div className="flex gap-2 shrink-0">
            <Dialog open={openJoin} onOpenChange={setOpenJoin}>
              <DialogTrigger asChild><Button variant="outline" size="sm"><KeyRound className="w-4 h-4 mr-1" /> Join</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Join group with code</DialogTitle></DialogHeader>
                <Input placeholder="Invite code" value={code} onChange={(e) => setCode(e.target.value)} />
                <Button onClick={async () => { await join.mutateAsync(code); setOpenJoin(false); setCode(""); }} disabled={!code.trim() || join.isPending}>{join.isPending ? "Joining..." : "Join"}</Button>
              </DialogContent>
            </Dialog>
            <Dialog open={openCreate} onOpenChange={setOpenCreate}>
              <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" /> New</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create study group</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                  <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
                  <Textarea placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} />
                  <Button onClick={async () => { await create.mutateAsync({ name, description: desc, subject, is_private: false }); setOpenCreate(false); setName(""); setDesc(""); setSubject(""); }} disabled={!name.trim() || create.isPending}>{create.isPending ? "Creating..." : "Create"}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {selectedGroup && (
          <Card className="mb-6 border-primary/20 bg-primary/5 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="secondary">Inside group</Badge>
                    <Badge variant="outline" className="capitalize">{selectedGroup.role}</Badge>
                    <Badge variant="outline">{memberCount} member{memberCount === 1 ? "" : "s"}</Badge>
                  </div>
                  <h2 className="text-2xl font-black break-words">{selectedGroup.name}</h2>
                  {selectedGroup.subject && <p className="text-sm text-muted-foreground mt-1">{selectedGroup.subject}</p>}
                  {selectedGroup.description && <p className="text-sm text-muted-foreground mt-3 max-w-2xl">{selectedGroup.description}</p>}
                </div>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => { navigator.clipboard.writeText(selectedGroup.invite_code); toast.success("Invite code copied"); }}
                >
                  <Copy className="w-4 h-4 mr-2" /> {selectedGroup.invite_code}
                </Button>
              </div>

              <Separator className="my-5" />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Button asChild variant="secondary" className="h-auto justify-start p-4">
                  <Link to="/education/notes" className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 shrink-0" />
                    <span className="text-left"><span className="block font-semibold">Group notes</span><span className="block text-xs text-muted-foreground">Write and share study notes</span></span>
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="h-auto justify-start p-4">
                  <Link to="/education/flashcards" className="flex items-center gap-3">
                    <Layers className="w-5 h-5 shrink-0" />
                    <span className="text-left"><span className="block font-semibold">Flashcards</span><span className="block text-xs text-muted-foreground">Practice together</span></span>
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="h-auto justify-start p-4">
                  <Link to="/education/tutor" className="flex items-center gap-3">
                    <Brain className="w-5 h-5 shrink-0" />
                    <span className="text-left"><span className="block font-semibold">AI tutor</span><span className="block text-xs text-muted-foreground">Ask for help</span></span>
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="h-auto justify-start p-4">
                  <Link to="/education/daily" className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 shrink-0" />
                    <span className="text-left"><span className="block font-semibold">Challenge</span><span className="block text-xs text-muted-foreground">Earn XP</span></span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {groups.length === 0 ? (
          <Card className="backdrop-blur-xl bg-card/80">
            <CardContent className="p-10 text-center text-muted-foreground">No groups yet. Create one or join with a code.</CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {groups.map((g: any) => (
              <Card key={g.id} className={`backdrop-blur-xl bg-card/80 transition ${g.id === selectedGroupId ? "border-primary shadow-md" : "hover:border-primary/40"}`}>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold break-words">{g.name}</h3>
                    <Badge variant={g.id === selectedGroupId ? "default" : "outline"}>{g.id === selectedGroupId ? "Open" : "Group"}</Badge>
                  </div>
                  {g.subject && <p className="text-xs text-muted-foreground mb-2">{g.subject}</p>}
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{g.description}</p>
                  <div className="flex items-center justify-between text-xs gap-2">
                    <span className="text-muted-foreground capitalize">{g.role}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-xs"
                      onClick={() => { navigator.clipboard.writeText(g.invite_code); toast.success("Code copied"); }}
                    >
                      <Copy className="w-3 h-3" /> {g.invite_code}
                    </Button>
                  </div>
                  <Button className="w-full" variant={g.id === selectedGroupId ? "secondary" : "default"} onClick={() => { setSelectedGroupId(g.id); navigate(`/education/study-groups/${g.id}`); }}>
                    Open group <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
