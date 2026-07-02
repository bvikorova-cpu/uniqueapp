import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export default function IQDataReset() {
  const reset = () => {
    if (!confirm("Delete all IQ data?")) return;
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("iq_")) keys.push(k);
    }
    keys.forEach(k => localStorage.removeItem(k));
    toast.success(`Removed ${keys.length} keys. Reload to apply.`);
  };
  return (
    <>
      <FloatingHowItWorks title="How IQData Reset works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Trash2 className="w-5 h-5" />Reset Data</CardTitle></CardHeader>
      <CardContent>
        <Button onClick={reset} variant="destructive" className="w-full">Delete All IQ Data</Button>
      </CardContent>
    </Card>
    </>
    );
}
