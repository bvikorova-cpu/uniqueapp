import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface LogRow {
  id: string;
  admin_id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: any;
  created_at: string;
}

export const AuditLogPanel = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("admin_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) {
        console.error(error);
        toast({ title: "Failed to load audit log", variant: "destructive" });
      }
      setLogs((data as LogRow[]) || []);
      setLoading(false);
    };
    load();
  }, [toast]);

  const exportCSV = () => {
    const header = "timestamp,action,target_type,target_id,details\n";
    const rows = logs.map(l =>
      `${l.created_at},${l.action},${l.target_type || ""},${l.target_id || ""},"${JSON.stringify(l.details).replace(/"/g, '""')}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `admin-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <FloatingHowItWorks title={"Audit Log Panel - How it works"} steps={[{ title: 'Open', desc: 'Access the Audit Log Panel section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Audit Log Panel.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/70 backdrop-blur-xl border-border/40">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-5 w-5 text-purple-400" /> Audit Log
          <Badge variant="outline" className="ml-2 text-[10px]">{logs.length}</Badge>
        </CardTitle>
        <Button size="sm" variant="outline" onClick={exportCSV} disabled={logs.length === 0}>
          <Download className="h-3 w-3 mr-1" /> CSV
        </Button>
      </CardHeader>
      <CardContent className="max-h-[300px] overflow-y-auto scrollbar-hide">
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-4">Loading…</p>
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No admin actions logged yet. Actions will appear here in real time.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Action</TableHead>
                <TableHead className="text-xs">Target</TableHead>
                <TableHead className="text-xs">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="text-xs font-medium">{l.action}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {l.target_type ? `${l.target_type}${l.target_id ? `:${l.target_id.slice(0, 8)}` : ""}` : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(l.created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
    </>
  );
};
