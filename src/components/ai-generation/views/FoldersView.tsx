import { useEffect, useState } from "react";
import { Folder, Plus, Trash2, Tag, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface FolderData { id: string; name: string; tags: string[]; }

export const FoldersView = () => {
  const navigate = useNavigate();
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [newName, setNewName] = useState("");
  const [tagInputs, setTagInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) { setUserId(null); setLoading(false); return; }
      setUserId(user.id);
      const { data, error } = await supabase
        .from("ai_studio_folders")
        .select("id, name, tags")
        .order("created_at", { ascending: false });
      if (!active) return;
      if (error) toast.error("Could not load folders");
      else setFolders((data || []).map((f) => ({ id: f.id, name: f.name, tags: f.tags || [] })));
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const create = async () => {
    const name = newName.trim();
    if (!name || !userId || busy) return;
    setBusy(true);
    const { data, error } = await supabase
      .from("ai_studio_folders")
      .insert({ user_id: userId, name, tags: [] })
      .select("id, name, tags")
      .single();
    setBusy(false);
    if (error || !data) { toast.error("Could not create folder"); return; }
    setFolders((prev) => [{ id: data.id, name: data.name, tags: data.tags || [] }, ...prev]);
    setNewName("");
    toast.success("Folder created");
  };

  const remove = async (id: string) => {
    const prev = folders;
    setFolders(folders.filter((f) => f.id !== id));
    const { error } = await supabase.from("ai_studio_folders").delete().eq("id", id);
    if (error) { setFolders(prev); toast.error("Could not delete folder"); }
  };

  const persistTags = async (id: string, tags: string[]) => {
    const prev = folders;
    setFolders(folders.map((f) => (f.id === id ? { ...f, tags } : f)));
    const { error } = await supabase.from("ai_studio_folders").update({ tags, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) { setFolders(prev); toast.error("Could not save tags"); }
  };

  const addTag = (id: string) => {
    const tag = (tagInputs[id] || "").trim();
    if (!tag) return;
    const folder = folders.find((f) => f.id === id);
    if (!folder) return;
    void persistTags(id, [...new Set([...folder.tags, tag])]);
    setTagInputs({ ...tagInputs, [id]: "" });
  };

  const removeTag = (id: string, tag: string) => {
    const folder = folders.find((f) => f.id === id);
    if (!folder) return;
    void persistTags(id, folder.tags.filter((t) => t !== tag));
  };

  return (
    <>
      <FloatingHowItWorks title={"Folders View - How it works"} steps={[{ title: 'Create', desc: 'Type a folder name and press Create to add a project folder.' }, { title: 'Tag', desc: 'Add tags to each folder to group your AI generations.' }, { title: 'Manage', desc: 'Tap a tag to remove it, or use the bin icon to delete a folder.' }, { title: 'Synced', desc: 'Folders are saved to your account and available on every device.' }]} />
      <div className="max-w-3xl mx-auto space-y-6 pb-40">
        <div>
          <h2 className="text-2xl font-black mb-1">📁 Folders & Tags</h2>
          <p className="text-muted-foreground text-sm">Organize your AI generations into projects with tags. Saved to your account.</p>
        </div>

        {!loading && !userId ? (
          <div className="rounded-xl border border-border bg-card/80 p-6 text-center space-y-3">
            <p className="text-sm text-muted-foreground">Sign in to create and sync your folders.</p>
            <Button onClick={() => navigate("/auth")}>Sign in</Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New folder name…" onKeyDown={(e) => e.key === "Enter" && create()} />
              <Button onClick={create} disabled={busy || !newName.trim()} className="gap-1 w-full sm:w-auto">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create
              </Button>
            </div>

            <div className="space-y-3">
              {loading && <p className="text-sm text-muted-foreground text-center py-8">Loading folders…</p>}
              {!loading && folders.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No folders yet. Create one above.</p>}
              {folders.map((f) => (
                <div key={f.id} className="rounded-xl border border-border bg-card/80 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold"><Folder className="w-4 h-4 text-primary" />{f.name}</div>
                    <Button variant="ghost" size="icon" onClick={() => remove(f.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {f.tags.map((t) => (
                      <Badge key={t} variant="secondary" className="cursor-pointer" onClick={() => removeTag(f.id, t)}><Tag className="w-3 h-3 mr-1" />{t} ✕</Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input value={tagInputs[f.id] || ""} onChange={(e) => setTagInputs({ ...tagInputs, [f.id]: e.target.value })} placeholder="Add tag…" onKeyDown={(e) => e.key === "Enter" && addTag(f.id)} className="h-8 text-xs" />
                    <Button size="sm" onClick={() => addTag(f.id)}>Add</Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};
