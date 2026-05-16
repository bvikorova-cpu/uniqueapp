import { useState, useEffect } from "react";
import { Pin, PinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  submissionId: string;
  isOwner: boolean;
}

export default function MegatalentPinButton({ submissionId, isOwner }: Props) {
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    try {
      const key = "mt_pinned_submissions";
      const arr = JSON.parse(localStorage.getItem(key) || "[]");
      setPinned(arr.includes(submissionId));
    } catch {}
  }, [submissionId]);

  if (!isOwner) {
    if (!pinned) return null;
    return (
      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-semibold">
        <Pin className="h-3 w-3" />
        Pinned
      </div>
    );
  }

  const toggle = () => {
    try {
      const key = "mt_pinned_submissions";
      const arr: string[] = JSON.parse(localStorage.getItem(key) || "[]");
      const next = pinned ? arr.filter((id) => id !== submissionId) : [...arr, submissionId];
      localStorage.setItem(key, JSON.stringify(next));
      setPinned(!pinned);
      toast.success(pinned ? "Unpinned" : "Pinned to your profile");
    } catch {}
  };

  return (
    <Button variant="ghost" size="sm" onClick={toggle} className="h-7 px-2 gap-1">
      {pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
      <span className="text-xs">{pinned ? "Unpin" : "Pin"}</span>
    </Button>
  );
}
