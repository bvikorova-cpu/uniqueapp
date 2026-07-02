import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Heart, Search, Check, X } from "lucide-react";
import {
  useFamilyRelationships,
  type FamilyRelationKind,
} from "@/hooks/useFamilyRelationships";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const RELATION_LABELS: Record<FamilyRelationKind, string> = {
  spouse: "Spouse",
  partner: "Partner",
  parent: "Parent",
  child: "Child",
  sibling: "Sibling",
  grandparent: "Grandparent",
  grandchild: "Grandchild",
  cousin: "Cousin",
  in_law: "In-law",
  other: "Family",
};

interface Props {
  userId: string;
  currentUserId: string | null;
  isOwnProfile: boolean;
}

export function FamilySection({ userId, currentUserId, isOwnProfile }: Props) {
  const { list, propose, setStatus, remove } = useFamilyRelationships(userId);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<{ id: string; name: string } | null>(null);
  const [kind, setKind] = useState<FamilyRelationKind>("sibling");

  const { data: searchResults = [] } = useQuery({
    queryKey: ["family-search", q],
    enabled: q.length >= 2,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .ilike("full_name", `%${q}%`)
        .neq("id", currentUserId || "")
        .limit(10);
      return data ?? [];
    },
  });

  const items = list.data ?? [];
  const confirmed = items.filter((i) => i.status === "confirmed");
  const pendingForMe = items.filter(
    (i) =>
      i.status === "pending" &&
      i.requested_by !== currentUserId &&
      (i.user_id === currentUserId || i.related_user_id === currentUserId)
  );

  return (
    <>
      <FloatingHowItWorks title={"Family Section - How it works"} steps={[{ title: 'Open', desc: 'Access the Family Section section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Family Section.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2">
          <Heart className="h-4 w-4 text-rose-500" />
          Family
        </h3>
        {isOwnProfile && currentUserId && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add family member</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Person</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="Search by name..."
                      value={picked ? picked.name : q}
                      onChange={(e) => {
                        setPicked(null);
                        setQ(e.target.value);
                      }}
                    />
                  </div>
                  {!picked && q.length >= 2 && (
                    <div className="mt-2 max-h-40 overflow-auto rounded-md border">
                      {searchResults.map((p: any) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setPicked({ id: p.id, name: p.full_name ?? "User" });
                            setQ("");
                          }}
                          className="w-full flex items-center gap-2 p-2 hover:bg-muted text-left"
                        >
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={p.avatar_url ?? undefined} />
                            <AvatarFallback>{p.full_name?.[0] ?? "?"}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{p.full_name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <Label>Relationship</Label>
                  <Select value={kind} onValueChange={(v) => setKind(v as FamilyRelationKind)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(RELATION_LABELS).map(([k, l]) => (
                        <SelectItem key={k} value={k}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  disabled={!picked || propose.isPending}
                  onClick={async () => {
                    if (!picked || !currentUserId) return;
                    await propose.mutateAsync({
                      currentUserId,
                      otherUserId: picked.id,
                      kind,
                    });
                    setPicked(null);
                    setOpen(false);
                  }}
                >
                  Send request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isOwnProfile && pendingForMe.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
            Pending requests
          </p>
          {pendingForMe.map((r) => (
            <div key={r.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/40">
              <Avatar className="h-8 w-8">
                <AvatarImage src={r.profile?.avatar_url ?? undefined} />
                <AvatarFallback>{r.profile?.full_name?.[0] ?? "?"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-xs">
                <div className="font-semibold">{r.profile?.full_name ?? "User"}</div>
                <div className="text-muted-foreground">{RELATION_LABELS[r.kind]}</div>
              </div>
              <Button size="icon" className="h-7 w-7" onClick={() => setStatus.mutate({ id: r.id, status: "confirmed" })}>
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setStatus.mutate({ id: r.id, status: "rejected" })}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {confirmed.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No family members yet
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {confirmed.map((r) => (
            <FamilyCard key={r.id} item={r} isOwner={isOwnProfile} onRemove={() => remove.mutate(r.id)} />
          ))}
        </div>
      )}
    </Card>
    </>
  );
}

function FamilyCard({
  item,
  isOwner,
  onRemove,
}: {
  item: any;
  isOwner: boolean;
  onRemove: () => void;
}) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/40">
      <Avatar
        className="h-9 w-9 cursor-pointer"
        onClick={() => item.profile && navigate(`/profile/${item.profile.id}`)}
      >
        <AvatarImage src={item.profile?.avatar_url ?? undefined} />
        <AvatarFallback>{item.profile?.full_name?.[0] ?? "?"}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate">{item.profile?.full_name ?? "User"}</div>
        <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
          {RELATION_LABELS[item.kind as FamilyRelationKind]}
        </Badge>
      </div>
      {isOwner && (
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onRemove}>
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
