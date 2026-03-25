import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Edit3, Lock, Globe, UserPlus, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  isEditing: boolean;
}

interface CollaborativePostEditorProps {
  onPublish?: (content: string, collaborators: string[]) => void;
}

export const CollaborativePostEditor = ({ onPublish }: CollaborativePostEditorProps) => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [inviteInput, setInviteInput] = useState("");

  const addCollaborator = () => {
    if (!inviteInput.trim()) return;
    setCollaborators((prev) => [
      ...prev,
      { id: Date.now().toString(), name: inviteInput, isEditing: false },
    ]);
    setInviteInput("");
  };

  const removeCollaborator = (id: string) => {
    setCollaborators((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
          <Users className="w-3.5 h-3.5" />
          Collab Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
              <Edit3 className="w-4 h-4 text-primary" />
            </div>
            Collaborative Post
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Collaborators */}
          <div>
            <label className="text-sm font-medium mb-2 block">Collaborators</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {collaborators.map((collab) => (
                <motion.div
                  key={collab.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-accent/30 border border-white/5"
                >
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={collab.avatar} />
                    <AvatarFallback className="text-[8px]">{collab.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium">{collab.name}</span>
                  {collab.isEditing && (
                    <motion.div
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                    />
                  )}
                  <button onClick={() => removeCollaborator(collab.id)}>
                    <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </motion.div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add collaborator username..."
                value={inviteInput}
                onChange={(e) => setInviteInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCollaborator()}
                className="flex-1 px-3 py-2 text-sm rounded-lg bg-accent/20 border border-white/5 outline-none focus:ring-1 focus:ring-primary/30"
              />
              <Button size="sm" variant="secondary" onClick={addCollaborator}>
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Collaborative editor */}
          <div className="relative">
            <Textarea
              placeholder="Start writing together..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[150px] resize-none"
            />
            {collaborators.length > 0 && (
              <div className="absolute bottom-2 right-2 flex -space-x-1.5">
                {collaborators.filter(c => c.isEditing).map((c) => (
                  <Avatar key={c.id} className="w-5 h-5 border border-background">
                    <AvatarFallback className="text-[8px] bg-emerald-500/20">{c.name[0]}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            )}
          </div>

          {/* Info badges */}
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs gap-1">
              <Globe className="w-3 h-3" />
              All collaborators can edit
            </Badge>
            <Badge variant="secondary" className="text-xs gap-1">
              <Lock className="w-3 h-3" />
              Published under all names
            </Badge>
          </div>

          <Button
            className="w-full"
            onClick={() => {
              onPublish?.(content, collaborators.map((c) => c.id));
              setOpen(false);
              setContent("");
              setCollaborators([]);
            }}
            disabled={!content.trim()}
          >
            Publish Collaborative Post
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
