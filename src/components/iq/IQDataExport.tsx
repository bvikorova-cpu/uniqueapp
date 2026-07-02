import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export default function IQDataExport() {
  const exportAll = () => {
    const data: Record<string, string | null> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("iq_")) data[k] = localStorage.getItem(k);
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `iq-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported");
  };
  return (
    <>
      <FloatingHowItWorks title="How IQData Export works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Download className="w-5 h-5" />Export Data</CardTitle></CardHeader>
      <CardContent>
        <Button onClick={exportAll} className="w-full">Download JSON</Button>
      </CardContent>
    </Card>
    </>
    );
}
