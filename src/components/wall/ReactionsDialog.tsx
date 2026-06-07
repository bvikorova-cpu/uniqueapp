import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Reaction {
  user_id: string;
  reaction_type: string;
}

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface ReactionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reactions: Reaction[];
  reactionMeta: { type: string; emoji: string; label: string }[];
}

export const ReactionsDialog = ({
  open,
  onOpenChange,
  reactions,
  reactionMeta,
}: ReactionsDialogProps) => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || reactions.length === 0) return;
    const ids = Array.from(new Set(reactions.map((r) => r.user_id)));
    const missing = ids.filter((id) => !profiles[id]);
    if (missing.length === 0) return;

    setLoading(true);
    supabase
      .rpc("get_profiles_basic", { _ids: missing })
      .then(({ data }) => {
        const map: Record<string, Profile> = { ...profiles };
        (data || []).forEach((p: Profile) => {
          map[p.id] = p;
        });
        setProfiles(map);
      })
      .then(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reactions]);

  // Build counts and tabs (only include types that exist)
  const counts: Record<string, number> = {};
  reactions.forEach((r) => {
    counts[r.reaction_type] = (counts[r.reaction_type] || 0) + 1;
  });
  const presentTypes = reactionMeta.filter((m) => counts[m.type] > 0);
  const total = reactions.length;

  const renderUserList = (items: Reaction[]) => {
    if (items.length === 0) {
      return (
        <p className="text-center text-sm text-muted-foreground py-6">
          No reactions yet
        </p>
      );
    }
    return (
      <ul className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
        {items.map((r, i) => {
          const profile = profiles[r.user_id];
          const meta = reactionMeta.find((m) => m.type === r.reaction_type);
          return (
            <li
              key={`${r.user_id}-${i}`}
              onClick={() => {
                onOpenChange(false);
                navigate(`/profile/${r.user_id}`);
              }}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors"
            >
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback>
                    {profile?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                {meta && (
                  <span className="absolute -bottom-1 -right-1 text-base bg-background rounded-full leading-none">
                    {meta.emoji}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {profile?.full_name || "User"}
                </p>
                {meta && (
                  <p className="text-xs text-muted-foreground">{meta.label}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reactions</DialogTitle>
        </DialogHeader>

        {loading && Object.keys(profiles).length === 0 ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
              <TabsTrigger value="all">All {total}</TabsTrigger>
              {presentTypes.map((m) => (
                <TabsTrigger key={m.type} value={m.type}>
                  <span className="mr-1">{m.emoji}</span>
                  {counts[m.type]}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="all" className="mt-3">
              {renderUserList(reactions)}
            </TabsContent>
            {presentTypes.map((m) => (
              <TabsContent key={m.type} value={m.type} className="mt-3">
                {renderUserList(
                  reactions.filter((r) => r.reaction_type === m.type)
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};
