import { useState } from "react";
import { FolderOpen, Plus, Loader2, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useCaseFiles, useCreateCase } from "@/hooks/useLieDetectorPro";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function CaseFilesCard() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tags, setTags] = useState("");
  const { data: cases = [] } = useCaseFiles();
  const create = useCreateCase();

  const submit = async () => {
    if (!title.trim()) return;
    await create.mutateAsync({ title, description: desc, tags: tags.split(",").map(t => t.trim()).filter(Boolean) });
    setTitle(""); setDesc(""); setTags(""); setOpen(false);
  };

  return (
    <>
      <FloatingHowItWorks title={"Case Files Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Case Files Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Case Files Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/60 backdrop-blur-sm border-yellow-500/30">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2 text-yellow-400">
          <FolderOpen className="w-5 h-5" /> Case Files Vault
          <Badge variant="outline" className="ml-auto text-[10px] border-yellow-500/40 text-yellow-300">{cases.length} open</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {!open ? (
          <Button onClick={() => setOpen(true)} size="sm" className="w-full bg-yellow-600 hover:bg-yellow-700 text-black"><Plus className="w-3 h-3 mr-1" /> New Case File</Button>
        ) : (
          <div className="space-y-2 p-2 rounded bg-black/20 border border-yellow-500/20">
            <Input placeholder="Case title" value={title} onChange={e => setTitle(e.target.value)} className="bg-background/40 text-xs h-8" />
            <Textarea placeholder="Case description / suspect notes" value={desc} onChange={e => setDesc(e.target.value)} rows={2} className="bg-background/40 text-xs" />
            <Input placeholder="Tags (comma-separated)" value={tags} onChange={e => setTags(e.target.value)} className="bg-background/40 text-xs h-8" />
            <div className="flex gap-2">
              <Button size="sm" onClick={submit} disabled={create.isPending} className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-black">
                {create.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Open Case"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </div>
        )}
        <div className="space-y-1 max-h-40 overflow-auto">
          {cases.map((c: any) => (
            <div key={c.id} className="p-2 rounded bg-black/20 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{c.title}</span>
                <Badge variant="outline" className="text-[9px]">{c.status}</Badge>
              </div>
              {c.description && <div className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{c.description}</div>}
              {c.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {c.tags.slice(0, 4).map((t: string, i: number) => (
                    <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-300 flex items-center gap-1"><Tag className="w-2 h-2" />{t}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {cases.length === 0 && <div className="text-[11px] text-muted-foreground italic text-center py-2">No cases yet — open your first one.</div>}
        </div>
      </CardContent>
    </Card>
    </>
  );
}
