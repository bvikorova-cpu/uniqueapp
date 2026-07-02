import { useEffect, useState } from "react";
import { Folder, Plus, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface FolderData { id: string; name: string; tags: string[]; }
const STORAGE_KEY = "ai_image_folders_v1";

export const FoldersView = () => {
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [newName, setNewName] = useState("");
  const [tagInputs, setTagInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    try { setFolders(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")); } catch { /* noop */ }
  }, []);
  const save = (next: FolderData[]) => {
    setFolders(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };
  const create = () => {
    if (!newName.trim()) return;
    save([...folders, { id: crypto.randomUUID(), name: newName.trim(), tags: [] }]);
    setNewName(""); toast.success("Folder created");
  };
  const remove = (id: string) => save(folders.filter(f => f.id !== id));
  const addTag = (id: string) => {
    const tag = (tagInputs[id] || "").trim();
    if (!tag) return;
    save(folders.map(f => f.id === id ? { ...f, tags: [...new Set([...f.tags, tag])] } : f));
    setTagInputs({ ...tagInputs, [id]: "" });
  };
  const removeTag = (id: string, tag: string) => save(folders.map(f => f.id === id ? { ...f, tags: f.tags.filter(t => t !== tag) } : f));

  return (
    <>
      <FloatingHowItWorks title={"Folders View - How it works"} steps={[{ title: 'Open', desc: 'Access the Folders View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Folders View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black mb-1">📁 Folders & Tags</h2>
        <p className="text-muted-foreground text-sm">Organize your AI generations into projects with tags. Stored locally.</p>
      </div>

      <div className="flex gap-2">
        <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New folder name…" onKeyDown={(e) => e.key === "Enter" && create()} />
        <Button onClick={create} className="gap-1"><Plus className="w-4 h-4" /> Create</Button>
      </div>

      <div className="space-y-3">
        {folders.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No folders yet. Create one above.</p>}
        {folders.map(f => (
          <div key={f.id} className="rounded-xl border border-border bg-card/80 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold"><Folder className="w-4 h-4 text-primary" />{f.name}</div>
              <Button variant="ghost" size="icon" onClick={() => remove(f.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {f.tags.map(t => (
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
    </div>
    </>
  );
};
