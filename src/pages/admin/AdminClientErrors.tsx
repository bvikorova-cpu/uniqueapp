import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";

interface ErrorRow {
  id: string;
  level: string;
  source: string;
  message: string;
  stack: string | null;
  url: string | null;
  route: string | null;
  user_agent: string | null;
  context: unknown;
  user_id: string | null;
  created_at: string;
}

export default function AdminClientErrors() {
  const [rows, setRows] = useState<ErrorRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("client_error_events" as never)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (!error && data) setRows(data as unknown as ErrorRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = filter
    ? rows.filter((r) =>
        [r.message, r.source, r.route ?? "", r.url ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(filter.toLowerCase()),
      )
    : rows;

  const bySource = filtered.reduce<Record<string, number>>((acc, r) => {
    acc[r.source] = (acc[r.source] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="container mx-auto max-w-6xl p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Client Error Reports</h1>
          <p className="text-sm text-muted-foreground">
            Every runtime error from the frontend, edge invocations, Stripe checkout,
            auth, and unhandled rejections is logged here.
          </p>
        </div>
        <Button onClick={load} disabled={loading} size="sm" variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(bySource).map(([src, n]) => (
          <Badge
            key={src}
            variant="secondary"
            className="cursor-pointer"
            onClick={() => setFilter(src)}
          >
            {src} · {n}
          </Badge>
        ))}
        {filter && (
          <Button size="sm" variant="ghost" onClick={() => setFilter("")}>
            Clear filter
          </Button>
        )}
      </div>

      <input
        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        placeholder="Filter by message, source, route…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      <div className="space-y-2">
        {filtered.length === 0 && !loading && (
          <p className="text-sm text-muted-foreground">No errors logged. 🎉</p>
        )}
        {filtered.map((r) => (
          <Card key={r.id}>
            <CardHeader className="py-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Badge variant={r.level === "error" ? "destructive" : "secondary"}>
                  {r.level}
                </Badge>
                <span className="text-muted-foreground">{r.source}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleString()}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <p className="text-sm break-words">{r.message}</p>
              {r.route && (
                <p className="text-xs text-muted-foreground">Route: {r.route}</p>
              )}
              {r.stack && (
                <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded bg-muted p-2 text-[11px]">
                  {r.stack}
                </pre>
              )}
              {r.context ? (
                <pre className="max-h-32 overflow-auto whitespace-pre-wrap rounded bg-muted/60 p-2 text-[11px]">
                  {JSON.stringify(r.context, null, 2)}
                </pre>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
