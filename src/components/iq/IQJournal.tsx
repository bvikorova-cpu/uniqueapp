import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { NotebookPen } from "lucide-react";
import { toast } from "sonner";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_journal";

export default function IQJournal() {
  const [entries, setEntries] = useState<{ at: number; text: string }[]>([]);
  const [text, setText] = useState("");
  useEffect(() => { setEntries(JSON.parse(localStorage.getItem(KEY) || "[]")); }, []);
  const add = () => {
    const v = text.trim();
    if (!v) return;
    const next = [{ at: Date.now(), text: v }, ...entries].slice(0, 10);
    setEntries(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    setText("");
    toast.success("Saved");
  };
  return (
    <>
      <FloatingHowItWorks title="How IQJournal works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><NotebookPen className="w-5 h-5" />Training Journal</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <Textarea value={text} onChange={e => setText(e.target.value)} placeholder="Today's reflection..." rows={2} />
        <Button size="sm" onClick={add}>Add Entry</Button>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {entries.map(e => (
            <div key={e.at} className="text-sm p-2 rounded bg-muted/40">
              <div className="text-xs text-muted-foreground">{new Date(e.at).toLocaleDateString()}</div>
              {e.text}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    </>
    );
}
