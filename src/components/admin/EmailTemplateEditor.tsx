import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Save, Trash2, Mail } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Tpl {
  id: string;
  slug: string;
  language: string;
  subject: string;
  body_html: string;
  body_text: string | null;
}

export const EmailTemplateEditor = () => {
  const [tpls, setTpls] = useState<Tpl[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Tpl | null>(null);
  const [creating, setCreating] = useState(false);
  const [newSlug, setNewSlug] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("email_templates").select("*").order("slug");
    const list = (data ?? []) as Tpl[];
    setTpls(list);
    if (list.length && !activeId) { setActiveId(list[0].id); setDraft(list[0]); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const select = (id: string) => {
    setActiveId(id);
    setDraft(tpls.find(t => t.id === id) ?? null);
  };

  const save = async () => {
    if (!draft) return;
    const { error } = await supabase.from("email_templates").update({
      subject: draft.subject, body_html: draft.body_html, body_text: draft.body_text,
    }).eq("id", draft.id);
    if (error) toast.error(error.message);
    else { toast.success("Saved"); load(); }
  };

  const create = async () => {
    if (!newSlug.trim()) return;
    const { data, error } = await supabase.from("email_templates").insert({
      slug: newSlug.trim(), language: "en",
      subject: "New subject", body_html: "<p>Hello {{name}}</p>",
    }).select().single();
    if (error) toast.error(error.message);
    else { toast.success("Created"); setNewSlug(""); setCreating(false); load(); if (data) { setActiveId(data.id); setDraft(data as Tpl); } }
  };

  const remove = async () => {
    if (!draft || !confirm(`Delete ${draft.slug}?`)) return;
    const { error } = await supabase.from("email_templates").delete().eq("id", draft.id);
    if (error) toast.error(error.message);
    else { setActiveId(null); setDraft(null); load(); }
  };

  if (loading) return <div className="h-64 rounded bg-muted/40 animate-pulse" />;

  return (
    <>
      <FloatingHowItWorks title={"Email Template Editor - How it works"} steps={[{ title: 'Open', desc: 'Access the Email Template Editor section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Email Template Editor.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="grid gap-4 md:grid-cols-[260px_1fr]">
      <Card className="p-3 border-primary/20 bg-card/60 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-sm flex items-center gap-2"><Mail className="h-4 w-4" />Templates</h4>
          <Button size="sm" variant="ghost" onClick={() => setCreating(v => !v)}><Plus className="h-4 w-4" /></Button>
        </div>
        {creating && (
          <div className="space-y-2 mb-3">
            <Input placeholder="welcome_email" value={newSlug} onChange={e => setNewSlug(e.target.value)} />
            <Button size="sm" className="w-full" onClick={create}>Create</Button>
          </div>
        )}
        <div className="space-y-1 max-h-[500px] overflow-auto">
          {tpls.map(t => (
            <button key={t.id} onClick={() => select(t.id)}
              className={`w-full text-left text-xs px-2 py-2 rounded transition-colors ${
                activeId === t.id ? "bg-primary/20 text-primary" : "hover:bg-muted"
              }`}>
              <div className="font-mono font-medium">{t.slug}</div>
              <div className="text-muted-foreground">{t.language}</div>
            </button>
          ))}
          {tpls.length === 0 && <p className="text-xs text-muted-foreground py-4 text-center">No templates</p>}
        </div>
      </Card>

      <Card className="p-4 border-primary/20 bg-card/60 backdrop-blur-xl">
        {!draft ? (
          <p className="text-center text-muted-foreground py-12">Select a template to edit.</p>
        ) : (
          <Tabs defaultValue="edit">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <TabsList>
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={remove}><Trash2 className="h-4 w-4" /></Button>
                <Button size="sm" onClick={save}><Save className="h-4 w-4 mr-1" />Save</Button>
              </div>
            </div>
            <TabsContent value="edit" className="space-y-3">
              <div>
                <Label>Subject</Label>
                <Input value={draft.subject} onChange={e => setDraft({ ...draft, subject: e.target.value })} />
              </div>
              <div>
                <Label>HTML body</Label>
                <Textarea rows={12} className="font-mono text-xs"
                  value={draft.body_html} onChange={e => setDraft({ ...draft, body_html: e.target.value })} />
              </div>
              <div>
                <Label>Plain text fallback</Label>
                <Textarea rows={5} className="font-mono text-xs"
                  value={draft.body_text ?? ""} onChange={e => setDraft({ ...draft, body_text: e.target.value })} />
              </div>
              <p className="text-xs text-muted-foreground">Use <code>{"{{variable}}"}</code> placeholders. Test send via your email provider.</p>
            </TabsContent>
            <TabsContent value="preview">
              <div className="rounded border border-primary/20 p-4 bg-background">
                <div className="text-xs text-muted-foreground mb-2">Subject: {draft.subject}</div>
                <div dangerouslySetInnerHTML={{ __html: draft.body_html }} />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </Card>
    </div>
    </>
  );
};
