import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Euro, TrendingUp } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Row {
  id: string;
  track_id: string;
  amount_cents: number;
  period_start: string;
  period_end: string;
  status: string;
}

export default function MusicRoyalties() {
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("music_royalties" as any)
        .select("*")
        .order("period_end", { ascending: false });
      const list = (data as any) ?? [];
      setRows(list);
      setTotal(list.reduce((s: number, r: Row) => s + r.amount_cents, 0));
    })();
  }, []);

  const fmt = (c: number) => `€${(c / 100).toFixed(2)}`;

  return (
    <>
      <FloatingHowItWorks title="How Music Royalties works" steps={[
          { title: 'Explore the feature', desc: 'Browse the options and pick what interests you.' },
          { title: 'Interact', desc: 'Tap actions, generate content, or make a selection. AI actions cost 2-5 credits.' },
          { title: 'Review results', desc: 'Check the output, share, save or purchase where available.' },
          { title: 'Come back', desc: 'Progress and history are saved to your account.' },
        ]} />
      <div className="container max-w-3xl py-8 space-y-6">
      <header className="flex items-center gap-3">
        <TrendingUp className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Tantiémy</h1>
          <p className="text-muted-foreground">Výplaty 80/20 zo streamov a predaja.</p>
        </div>
      </header>

      <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="text-sm text-muted-foreground">Celkové zárobky</div>
        <div className="text-4xl font-bold flex items-center gap-2">
          <Euro className="w-7 h-7" /> {(total / 100).toFixed(2)}
        </div>
      </Card>

      <div className="space-y-2">
        {rows.length === 0 ? (
          <p className="text-muted-foreground">Zatiaľ žiadne výplaty.</p>
        ) : rows.map((r) => (
          <Card key={r.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{r.period_start} – {r.period_end}</div>
              <div className="text-xs text-muted-foreground">{r.status}</div>
            </div>
            <div className="font-bold">{fmt(r.amount_cents)}</div>
          </Card>
        ))}
      </div>
    </div>
    </>
    );
}
