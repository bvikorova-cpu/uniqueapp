import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface EarningsExportProps {
  rows: Record<string, any>[];
  filename?: string;
}

/**
 * Export to CSV (or printable HTML masquerading as PDF preview).
 * No extra deps — pure browser APIs.
 */
export const EarningsExport = ({ rows, filename = "earnings" }: EarningsExportProps) => {
  const { toast } = useToast();

  const exportCSV = () => {
    if (!rows.length) {
      toast({ title: "Nothing to export", description: "No earnings rows yet.", variant: "destructive" });
      return;
    }
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        headers.map((h) => JSON.stringify(r[h] ?? "")).join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "CSV exported", description: `${rows.length} rows downloaded.` });
  };

  const exportPrint = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const headers = Object.keys(rows[0] ?? {});
    w.document.write(`
      <html><head><title>${filename}</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 40px; color: #111; }
        h1 { color: #d97706; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 8px; border-bottom: 1px solid #ddd; text-align: left; font-size: 12px; }
        th { background: #fef3c7; color: #92400e; }
      </style></head><body>
        <h1>Earnings Report</h1>
        <p>Generated ${new Date().toLocaleString()}</p>
        <table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
        <tbody>${rows.map((r) => `<tr>${headers.map((h) => `<td>${r[h] ?? ""}</td>`).join("")}</tr>`).join("")}</tbody></table>
        <script>window.print()</script>
      </body></html>
    `);
    w.document.close();
  };

  return (
    <>
      <FloatingHowItWorks title={"Earnings Export - How it works"} steps={[{ title: 'Open', desc: 'Access the Earnings Export section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Earnings Export.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-amber-500/30 hover:bg-amber-500/10">
          <Download className="h-4 w-4" /> Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportCSV}>
          <FileSpreadsheet className="h-4 w-4 mr-2" /> Download CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportPrint}>
          <FileText className="h-4 w-4 mr-2" /> Print / Save as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </>
  );
};
