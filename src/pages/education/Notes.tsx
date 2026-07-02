import { useState } from "react";
import { useNotes, useSaveNote, useAIGenerateNote } from "@/hooks/useEducationNotes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Sparkles, Plus } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const __HIW_NOTES_STEPS = [
  { title: 'Create a note', desc: 'Write freely or paste from another source.' },
  { title: 'AI summarise', desc: 'Turn long notes into concise summaries.' },
  { title: 'Generate a quiz', desc: 'Convert a note into a flashcard deck or quiz.' },
  { title: 'Organise by subject', desc: 'Tag notes to keep them searchable.' }
];
const __HIW_NOTES = { title: 'Notes', intro: 'Your personal study notebook — AI-enhanced.', steps: __HIW_NOTES_STEPS };


export default function Notes() {
  const { data: notes = [] } = useNotes();
  const save = useSaveNote();
  const ai = useAIGenerateNote();
  const [active, setActive] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [aiTopic, setAiTopic] = useState("");

  const startNew = () => { setActive({}); setTitle(""); setContent(""); };

  const handleSave = async () => {
    if (!title) return;
    await save.mutateAsync({ id: active?.id, title, content_md: content });
    toast.success("Saved");
    setActive(null);
  };

  const handleAI = async () => {
    if (!aiTopic) return;
    const r = await ai.mutateAsync(aiTopic);
    setContent((c) => (c ? c + "\n\n" : "") + r.markdown);
    setAiTopic("");
  };

  return (
    <>
      <FloatingHowItWorks title={__HIW_NOTES.title} intro={__HIW_NOTES.intro} steps={__HIW_NOTES.steps} />
      <Helmet><title>Notes · Education</title></Helmet>
      <div className="container mx-auto px-4 pt-20 pb-12 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black flex items-center gap-2"><FileText className="w-7 h-7 text-primary" /> Notes</h1>
          <Button onClick={startNew}><Plus className="w-4 h-4 mr-1" /> New note</Button>
        </div>

        {active ? (
          <Card className="backdrop-blur-xl bg-card/80">
            <CardContent className="p-5 space-y-3">
              <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <div className="flex gap-2">
                <Input placeholder="Topic for AI summary..." value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} />
                <Button variant="outline" onClick={handleAI} disabled={ai.isPending || !aiTopic}>
                  <Sparkles className="w-4 h-4 mr-1" /> AI
                </Button>
              </div>
              <Textarea
                placeholder="Markdown content..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={save.isPending}>Save</Button>
                <Button variant="ghost" onClick={() => setActive(null)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        ) : notes.length === 0 ? (
          <Card className="backdrop-blur-xl bg-card/80">
            <CardContent className="p-10 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No notes yet</p>
              <Button onClick={startNew}><Plus className="w-4 h-4 mr-1" /> Create one</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {notes.map((n: any) => (
              <Card key={n.id} className="backdrop-blur-xl bg-card/80 hover:border-primary/40 cursor-pointer" onClick={() => { setActive(n); setTitle(n.title); setContent(n.content_md); }}>
                <CardContent className="p-4">
                  <h3 className="font-bold mb-1 truncate">{n.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-3">{n.content_md.slice(0, 150)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
