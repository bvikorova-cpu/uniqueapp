import { useState, useEffect } from "react";
import { Pin, PinOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  submissionId: string;
  isOwner: boolean;
}

export default function MegatalentPinButton({ submissionId, isOwner }: Props) {
  const [pinned, setPinned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id ?? null;
      if (cancelled) return;
      setUserId(uid);
      // Public read: pin exists for this submission?
      const ownerId = uid;
      if (!ownerId && !isOwner) {
        // viewer not logged in; check if anyone (owner) pinned this submission
        const { data } = await supabase.from("mt_pinned_submissions").select("id").eq("submission_id", submissionId).limit(1).maybeSingle();
        if (!cancelled) setPinned(!!data);
        return;
      }
      const { data } = await supabase.from("mt_pinned_submissions").select("id").eq("submission_id", submissionId).limit(1).maybeSingle();
      if (!cancelled) setPinned(!!data);
    })();
    return (
    <>
      <FloatingHowItWorks title={"Megatalent Pin Button - How it works"} steps={[{ title: 'Open', desc: 'Access the Megatalent Pin Button section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Megatalent Pin Button.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => { cancelled = true; };
  }, [submissionId, isOwner]);

  if (!isOwner) {
    if (!pinned) return null;
    return (
      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-semibold">
        <Pin className="h-3 w-3" />
        Pinned
      </div>
    );
  }

  const toggle = async () => {
    if (!userId) {
      toast.error("Login required");
      return;
    }
    setLoading(true);
    try {
      if (pinned) {
        const { error } = await supabase.from("mt_pinned_submissions").delete().eq("submission_id", submissionId).eq("user_id", userId);
        if (error) throw error;
        setPinned(false);
        toast.success("Unpinned");
      } else {
        const { error } = await supabase.from("mt_pinned_submissions").insert({ user_id: userId, submission_id: submissionId });
        if (error) throw error;
        setPinned(true);
        toast.success("Pinned to your profile");
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={toggle} disabled={loading} className="h-7 px-2 gap-1">
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
      <span className="text-xs">{pinned ? "Unpin" : "Pin"}</span>
    </Button>
  );
}
