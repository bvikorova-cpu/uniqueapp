import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { kidsCall } from "@/hooks/useKidsRouter";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const __HIW_KIDSSHAREVIEW_STEPS = [
  { title: 'Share safely', desc: 'Only the creation is visible — no personal data.' },
  { title: 'Send the link', desc: 'Grandparents, family and friends can view without an account.' },
  { title: 'Kids stay private', desc: 'No comments or messaging on shared views.' }
];
const __HIW_KIDSSHAREVIEW = { title: 'Kids Share View', intro: "A safe public view for sharing a kid's creation.", steps: __HIW_KIDSSHAREVIEW_STEPS };


export default function KidsShareView() {
  const { token } = useParams();
  const [item, setItem] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    kidsCall("shares.public_get", { token }).then((r: any) => setItem(r.item)).catch(e => setError(e.message));
  }, [token]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 p-8">
      <FloatingHowItWorks title={__HIW_KIDSSHAREVIEW.title} intro={__HIW_KIDSSHAREVIEW.intro} steps={__HIW_KIDSSHAREVIEW.steps} />
      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          {error && <div className="text-destructive">{error}</div>}
          {item && (<>
            <Badge>{item.kind}</Badge>
            <h1 className="text-3xl font-bold mt-3">{item.title}</h1>
            <pre className="mt-4 p-3 bg-muted rounded text-sm overflow-auto">{JSON.stringify(item.payload, null, 2)}</pre>
            <div className="text-xs text-muted-foreground mt-4">Shared {new Date(item.created_at).toLocaleString()}</div>
          </>)}
          {!item && !error && <div>Loading…</div>}
        </Card>
      </div>
    </div>
  );
}
