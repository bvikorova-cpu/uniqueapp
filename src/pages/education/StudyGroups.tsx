import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, KeyRound, Copy } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const __HIW_STUDYGROUPS_STEPS = [
  { title: 'Join or create a group', desc: 'Pick a subject and invite friends or open it to everyone.' },
  { title: 'Share notes & decks', desc: 'Members can pool notes, flashcards and quizzes.' },
  { title: 'Group challenges', desc: 'Compete or cooperate on weekly group goals.' },
  { title: 'Group chat', desc: 'Ask questions and celebrate wins together.' }
];
const __HIW_STUDYGROUPS = { title: 'Study Groups', intro: 'Learn together in small focused groups.', steps: __HIW_STUDYGROUPS_STEPS };


export default function StudyGroups() {
  const qc = useQueryClient();

  const { data: groups = [] } = useQuery({
    queryKey: ["study-groups"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data: memberships } = await supabase
        .from("education_study_group_members")
        .select("group_id, role, education_study_groups(*)")
        .eq("user_id", user.id);
      return (memberships ?? []).map((m: any) => ({ ...m.education_study_groups, role: m.role }));
    },
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
      await supabase.from("education_study_group_members").insert({ group_id: g.id, user_id: user.id, role: "owner" });
      return g;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["study-groups"] }); toast.success("Group created"); },
  });

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
      if (e2) throw e2;
      return g;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["study-groups"] }); toast.success("Joined!"); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

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
                <Button onClick={async () => { await join.mutateAsync(code); setOpenJoin(false); setCode(""); }} disabled={!code}>Join</Button>
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
                  <Button onClick={async () => { await create.mutateAsync({ name, description: desc, subject, is_private: false }); setOpenCreate(false); setName(""); setDesc(""); setSubject(""); }} disabled={!name}>Create</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {groups.length === 0 ? (
          <Card className="backdrop-blur-xl bg-card/80">
            <CardContent className="p-10 text-center text-muted-foreground">No groups yet. Create one or join with a code.</CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {groups.map((g: any) => (
              <Card key={g.id} className="backdrop-blur-xl bg-card/80">
                <CardContent className="p-5">
                  <h3 className="font-bold">{g.name}</h3>
                  {g.subject && <p className="text-xs text-muted-foreground mb-2">{g.subject}</p>}
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{g.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground capitalize">{g.role}</span>
                    <button
                      className="flex items-center gap-1 hover:text-primary"
                      onClick={() => { navigator.clipboard.writeText(g.invite_code); toast.success("Code copied"); }}
                    >
                      <Copy className="w-3 h-3" /> {g.invite_code}
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
