import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const TaxDocsButton = () => {
  const [year, setYear] = useState<string>(String(new Date().getFullYear() - 1));
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("creator-tax-export", {
        body: { year: Number(year), format: "pdf", template: "dac7" },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      } else if (data?.csv) {
        const blob = new Blob([data.csv], { type: "text/csv" });
        const u = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = u;
        a.download = `tax-report-${year}.csv`;
        a.click();
        URL.revokeObjectURL(u);
      }
      toast.success(`Tax report ${year} ready`);
    } catch (e: any) {
      toast.error(e.message || "Failed to generate report");
    } finally {
      setBusy(false);
    }
  };

  const years = Array.from({ length: 4 }, (_, i) => String(new Date().getFullYear() - i));

  return (
    <>
      <FloatingHowItWorks title={"Tax Docs Button - How it works"} steps={[{ title: 'Open', desc: 'Access the Tax Docs Button section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Tax Docs Button.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-amber-500/20 bg-card/80 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileDown className="w-4 h-4 text-amber-400" />
          Tax Documents (DAC7 EU)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Download your annual earnings report formatted for EU DAC7 reporting.
        </p>
        <div className="flex gap-2">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {years.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={download} disabled={busy} size="sm" className="flex-1">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4 mr-1.5" />}
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
    </>
  );
};
