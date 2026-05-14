import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function SaveJobButton({ jobId, variant = "outline", size = "sm" }: { jobId: string; variant?: any; size?: any }) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("saved_jobs").select("id").eq("user_id", user.id).eq("job_id", jobId).maybeSingle();
      setSaved(!!data);
    })();
  }, [jobId]);

  const toggle = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: "Sign in to save jobs", variant: "destructive" }); setLoading(false); return; }
    if (saved) {
      await supabase.from("saved_jobs").delete().eq("user_id", user.id).eq("job_id", jobId);
      setSaved(false);
      toast({ title: "Removed from saved" });
    } else {
      await supabase.from("saved_jobs").insert({ user_id: user.id, job_id: jobId });
      setSaved(true);
      toast({ title: "Saved!", description: "Find it under Saved Jobs" });
    }
    setLoading(false);
  };

  return (
    <Button variant={variant} size={size} onClick={toggle} disabled={loading}>
      {saved ? <BookmarkCheck className="h-4 w-4 mr-1.5 fill-primary text-primary" /> : <Bookmark className="h-4 w-4 mr-1.5" />}
      {saved ? "Saved" : "Save"}
    </Button>
  );
}
