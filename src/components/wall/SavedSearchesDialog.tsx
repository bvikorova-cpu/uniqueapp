import { useState } from "react";
import { Bookmark, Search as SearchIcon, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSavedSearches } from "@/hooks/useSavedSearches";

interface Props {
  onSelect?: (query: string) => void;
  trigger?: React.ReactNode;
}

export const SavedSearchesDialog = ({ onSelect, trigger }: Props) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [label, setLabel] = useState("");
  const { searches, saveSearch, removeSearch } = useSavedSearches();

  const submit = () => {
    if (!q.trim()) return;
    saveSearch({ query: q, label });
    setQ(""); setLabel("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <Bookmark className="w-4 h-4 mr-2" /> Saved searches
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Saved searches</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Input placeholder="Query" value={q} onChange={(e) => setQ(e.target.value)} />
          <Input placeholder="Label (optional)" value={label} onChange={(e) => setLabel(e.target.value)} />
          <Button onClick={submit} className="w-full">Save</Button>
        </div>
        <ScrollArea className="h-[260px]">
          <div className="space-y-1">
            {searches.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                <button
                  className="flex items-center gap-2 text-sm flex-1 text-left"
                  onClick={() => { onSelect?.(s.query); setOpen(false); }}
                >
                  <SearchIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{s.label || s.query}</span>
                  {s.label && <span className="text-xs text-muted-foreground">{s.query}</span>}
                </button>
                <Button size="icon" variant="ghost" onClick={() => removeSearch(s.id)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
