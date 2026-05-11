import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

export default function IQShareProfile() {
  const share = async () => {
    const nick = localStorage.getItem("iq_nickname") || "IQ Player";
    const score = JSON.parse(localStorage.getItem("iq_score_history") || "[]").pop() || "?";
    const text = `${nick} scored IQ ${score} on Unique IQ Platform!`;
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: "My IQ", text, url }); return; } catch {}
    }
    await navigator.clipboard.writeText(`${text} ${url}`);
    toast.success("Copied to clipboard");
  };
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Share2 className="w-5 h-5" />Share Profile</CardTitle></CardHeader>
      <CardContent>
        <Button onClick={share} className="w-full">Share My Score</Button>
      </CardContent>
    </Card>
  );
}
