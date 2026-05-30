import { useState } from "react";
import { usePostTemplates } from "@/hooks/usePostTemplates";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Search } from "lucide-react";

interface PostTemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (content: string) => void;
}

export const PostTemplatesDialog = ({
  open,
  onOpenChange,
  onSelectTemplate,
}: PostTemplatesDialogProps) => {
  const { templates, applyTemplate, isLoading } = usePostTemplates();
  const [search, setSearch] = useState("");

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.content.toLowerCase().includes(search.toLowerCase()) ||
      t.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelectTemplate = (template: typeof templates[0]) => {
    applyTemplate(template.id);
    onSelectTemplate(template.content);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Post Templates
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <ScrollArea className="h-[400px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-muted-foreground">Loading templates...</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-all text-left group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {template.thumbnail && (
                            <span className="text-2xl">{template.thumbnail}</span>
                          )}
                          <h4 className="font-semibold">{template.name}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {template.content}
                        </p>
                        {template.tags && template.tags.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {template.tags.map((tag, i) => (
                              <span
                                key={i}
                                className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {template.uses_count} uses
                      </span>
                    </div>
                  </button>
                ))}
                {filteredTemplates.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">
                    No templates found
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
