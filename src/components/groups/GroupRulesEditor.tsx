import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollText, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  groupId: string;
  isStaff: boolean;
}

interface Rule {
  id: string;
  position: number;
  title: string;
  description: string | null;
}

export function GroupRulesEditor({ groupId, isStaff }: Props) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["group-rules", groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("group_rules")
        .select("id, position, title, description")
        .eq("group_id", groupId)
        .order("position", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Rule[];
    },
  });

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ["group-rules", groupId] });

  const create = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const nextPos = (rules[rules.length - 1]?.position ?? -1) + 1;
      const { error } = await supabase.from("group_rules").insert({
        group_id: groupId,
        position: nextPos,
        title: title.trim(),
        description: description.trim() || null,
        created_by: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Rule added");
      setTitle("");
      setDescription("");
      invalidate();
    },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("group_rules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const move = useMutation({
    mutationFn: async ({ id, dir }: { id: string; dir: "up" | "down" }) => {
      const idx = rules.findIndex((r) => r.id === id);
      const swapWith = dir === "up" ? rules[idx - 1] : rules[idx + 1];
      if (!swapWith) return;
      const a = rules[idx];
      await Promise.all([
        supabase.from("group_rules").update({ position: swapWith.position }).eq("id", a.id),
        supabase.from("group_rules").update({ position: a.position }).eq("id", swapWith.id),
      ]);
    },
    onSuccess: invalidate,
  });

  return (
    <Card className="p-4 space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <ScrollText className="h-4 w-4 text-primary" /> Group Rules
      </h3>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rules.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {isStaff ? "Add the first rule below." : "No rules set yet."}
        </p>
      ) : (
        <ol className="space-y-2">
          {rules.map((r, i) => (
            <li key={r.id} className="flex items-start gap-2 p-3 rounded-lg bg-muted/40">
              <span className="text-xs font-bold text-primary mt-1 w-5">{i + 1}.</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{r.title}</div>
                {r.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>
                )}
              </div>
              {isStaff && (
                <div className="flex flex-col gap-1">
                  <Button size="icon" variant="ghost" className="h-6 w-6" disabled={i === 0}
                    onClick={() => move.mutate({ id: r.id, dir: "up" })}>
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6" disabled={i === rules.length - 1}
                    onClick={() => move.mutate({ id: r.id, dir: "down" })}>
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>
              )}
              {isStaff && (
                <Button size="icon" variant="ghost" className="h-7 w-7"
                  onClick={() => remove.mutate(r.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </li>
          ))}
        </ol>
      )}

      {isStaff && (
        <div className="space-y-2 pt-3 border-t">
          <Input
            placeholder="Rule title (e.g. Be respectful)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Description (optional)"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button
            size="sm"
            onClick={() => create.mutate()}
            disabled={!title.trim() || create.isPending}
          >
            <Plus className="h-4 w-4 mr-1" /> Add rule
          </Button>
        </div>
      )}
    </Card>
  );
}
