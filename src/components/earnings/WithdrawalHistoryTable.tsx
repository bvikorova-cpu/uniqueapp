import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCreatorPayouts, KIND_LABELS } from "@/hooks/useCreatorPayouts";
import { History } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

/** Cross-hub withdrawal history (musician, chef, instructor, etc.). */
export function WithdrawalHistoryTable() {
  const { rows, totals, loading } = useCreatorPayouts();

  return (
    <>
      <FloatingHowItWorks title={"Withdrawal History Table - How it works"} steps={[{ title: 'Open', desc: 'Access the Withdrawal History Table section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Withdrawal History Table.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-amber-500/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <History className="h-4 w-4 text-amber-500" /> Withdrawal history (all hubs)
        </CardTitle>
        <div className="flex gap-2 text-[11px] text-muted-foreground pt-1">
          <span>Pending €{totals.pending.toFixed(2)}</span>
          <span>· Paid €{totals.paid.toFixed(2)}</span>
          <span>· Rejected €{totals.rejected.toFixed(2)}</span>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-xs text-muted-foreground py-4">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-6">No withdrawals yet</div>
        ) : (
          <div className="rounded-md border max-h-80 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Hub</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.slice(0, 30).map((r) => (
                  <TableRow key={`${r.kind}-${r.id}`}>
                    <TableCell className="text-xs">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{KIND_LABELS[r.kind]}</Badge></TableCell>
                    <TableCell className="font-bold">€{Number(r.amount).toFixed(2)}</TableCell>
                    <TableCell><Badge variant="secondary" className="text-[10px]">{r.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
}
