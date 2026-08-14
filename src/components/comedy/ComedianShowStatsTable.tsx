import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, Eye, Loader2, RefreshCw, Ticket, Euro } from "lucide-react";
import { format } from "date-fns";

interface Props { comedianId: string; }

interface Row {
  id: string;
  title: string;
  scheduled_at: string;
  status: string;
  viewer_count: number;
  ticketsSold: number;
  ticketRevenue: number;
  giftRevenue: number;
  netEarned: number;
}

export const ComedianShowStatsTable = ({ comedianId }: Props) => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const { data: shows } = await supabase
        .from("comedy_shows")
        .select("id, title, scheduled_at, status, viewer_count")
        .eq("comedian_id", comedianId)
        .order("scheduled_at", { ascending: false });

      const showList = shows || [];
      const showIds = showList.map((s) => s.id);

      const [ticketsRes, earningsRes] = await Promise.all([
        showIds.length
          ? supabase.from("comedy_tickets").select("show_id, price_paid").in("show_id", showIds)
          : Promise.resolve({ data: [] as any[] }),
        supabase
          .from("comedian_earnings")
          .select("source_id, source_type, net_amount")
          .eq("comedian_id", comedianId),
      ]);

      const tickets = (ticketsRes.data || []) as { show_id: string; price_paid: number | null }[];
      const earnings = (earningsRes.data || []) as { source_id: string | null; source_type: string | null; net_amount: number | null }[];

      setRows(
        showList.map((s) => {
          const st = tickets.filter((t) => t.show_id === s.id);
          const showEarnings = earnings.filter((e) => e.source_id === s.id);
          const giftRevenue = showEarnings
            .filter((e) => (e.source_type || "").includes("gift") || (e.source_type || "").includes("tip"))
            .reduce((sum, e) => sum + Number(e.net_amount || 0), 0);
          const netEarned = showEarnings.reduce((sum, e) => sum + Number(e.net_amount || 0), 0);
          return {
            id: s.id,
            title: s.title,
            scheduled_at: s.scheduled_at,
            status: s.status,
            viewer_count: s.viewer_count || 0,
            ticketsSold: st.length,
            ticketRevenue: st.reduce((sum, t) => sum + Number(t.price_paid || 0), 0),
            giftRevenue,
            netEarned,
          };
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [comedianId]);

  const totals = useMemo(() => rows.reduce(
    (acc, r) => ({
      views: acc.views + r.viewer_count,
      tickets: acc.tickets + r.ticketsSold,
      net: acc.net + r.netEarned,
      gifts: acc.gifts + r.giftRevenue,
    }),
    { views: 0, tickets: 0, net: 0, gifts: 0 },
  ), [rows]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-4 w-4 text-primary" /> Show performance
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => void load()} disabled={loading} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-lg border p-3">
            <p className="flex items-center gap-1 text-[10px] uppercase text-muted-foreground"><Eye className="h-3 w-3" /> Total views</p>
            <p className="text-xl font-black">{totals.views}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="flex items-center gap-1 text-[10px] uppercase text-muted-foreground"><Ticket className="h-3 w-3" /> Tickets sold</p>
            <p className="text-xl font-black">{totals.tickets}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="flex items-center gap-1 text-[10px] uppercase text-muted-foreground"><Euro className="h-3 w-3" /> Gifts (net)</p>
            <p className="text-xl font-black">€{totals.gifts.toFixed(2)}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="flex items-center gap-1 text-[10px] uppercase text-muted-foreground"><Euro className="h-3 w-3" /> Your earnings</p>
            <p className="text-xl font-black text-green-600">€{totals.net.toFixed(2)}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading your stats…
          </div>
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No shows yet — schedule your first show to see stats here.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Show</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Tickets</TableHead>
                  <TableHead className="text-right">Ticket sales</TableHead>
                  <TableHead className="text-right">Gifts (net)</TableHead>
                  <TableHead className="text-right">Earned (net)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="max-w-[180px] truncate font-medium">{r.title}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {format(new Date(r.scheduled_at), "MMM d, yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.status === "live" ? "default" : r.status === "ended" ? "secondary" : "outline"}>
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{r.viewer_count}</TableCell>
                    <TableCell className="text-right">{r.ticketsSold}</TableCell>
                    <TableCell className="text-right">€{r.ticketRevenue.toFixed(2)}</TableCell>
                    <TableCell className="text-right">€{r.giftRevenue.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-bold text-green-600">€{r.netEarned.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <p className="text-[11px] text-muted-foreground">
          Ticket sales show the gross amount fans paid; your earnings are the net 80% share after the platform fee.
        </p>
      </CardContent>
    </Card>
  );
};
