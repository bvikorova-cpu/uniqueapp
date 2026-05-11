import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

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
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Trash2 className="w-5 h-5" />Reset Data</CardTitle></CardHeader>
      <CardContent>
        <Button onClick={reset} variant="destructive" className="w-full">Delete All IQ Data</Button>
      </CardContent>
    </Card>
  );
}
