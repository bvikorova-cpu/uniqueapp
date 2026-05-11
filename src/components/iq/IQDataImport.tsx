import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";

export default function IQDataImport() {
  const ref = useRef<HTMLInputElement>(null);
  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const data = JSON.parse(await f.text()) as Record<string, string>;
      Object.entries(data).forEach(([k, v]) => {
        if (k.startsWith("iq_") && typeof v === "string") localStorage.setItem(k, v);
      });
      toast.success("Imported. Reload to apply.");
    } catch {
      toast.error("Invalid file");
    }
  };
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5" />Import Data</CardTitle></CardHeader>
      <CardContent>
        <input ref={ref} type="file" accept="application/json" onChange={handle} className="hidden" />
        <Button onClick={() => ref.current?.click()} variant="outline" className="w-full">Choose JSON File</Button>
      </CardContent>
    </Card>
  );
}
