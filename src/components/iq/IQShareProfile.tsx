import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
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
    <>
      <FloatingHowItWorks title="How IQShare Profile works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Share2 className="w-5 h-5" />Share Profile</CardTitle></CardHeader>
      <CardContent>
        <Button onClick={share} className="w-full">Share My Score</Button>
      </CardContent>
    </Card>
    </>
    );
}
