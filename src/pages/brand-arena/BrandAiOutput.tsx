import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AiMarkdown } from "@/components/common/AiMarkdown";

/** Strips ```json fences and parses nested JSON strings recursively. */
function normalize(value: any, depth = 0): any {
  if (depth > 5) return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/^\s*```(?:json|markdown)?\s*/i, "").replace(/```\s*$/, "").trim();
    if (/^[[{]/.test(cleaned)) {
      try {
        return normalize(JSON.parse(cleaned), depth + 1);
      } catch {
        return cleaned;
      }
    }
    return cleaned;
  }
  if (Array.isArray(value)) return value.map((v) => normalize(v, depth + 1));
  if (value && typeof value === "object") {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) out[k] = normalize(v, depth + 1);
    return out;
  }
  return value;
}

const label = (k: string) =>
  k.replace(/[_-]/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());

function Value({ v }: { v: any }) {
  if (v === null || v === undefined || v === "") return <span className="text-muted-foreground">—</span>;
  if (typeof v === "boolean") return <Badge variant={v ? "default" : "secondary"}>{v ? "Yes" : "No"}</Badge>;
  if (typeof v === "number") return <span className="font-semibold">{v}</span>;
  if (typeof v === "string") return <AiMarkdown content={v} className="text-sm leading-relaxed" />;
  if (Array.isArray(v)) {
    if (v.every((i) => typeof i !== "object" || i === null)) {
      return (
        <div className="flex flex-wrap gap-1.5">
          {v.map((i, idx) => (
            <Badge key={idx} variant="outline" className="font-normal">{String(i)}</Badge>
          ))}
        </div>
      );
    }
    return (
      <div className="space-y-2">
        {v.map((i, idx) => (
          <div key={idx} className="rounded-lg border bg-background/60 p-3">
            <Fields data={i} />
          </div>
        ))}
      </div>
    );
  }
  return <Fields data={v} />;
}

function Fields({ data }: { data: Record<string, any> }) {
  return (
    <div className="space-y-3">
      {Object.entries(data).map(([k, v]) => {
        const isConfidence = /^(confidence|score|probability)$/i.test(k) && typeof v === "number";
        return (
          <div key={k} className="space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label(k)}</div>
            {isConfidence ? (
              <div className="flex items-center gap-3">
                <Progress value={Math.max(0, Math.min(100, v))} className="h-2 flex-1" />
                <span className="text-sm font-bold text-primary">{v}%</span>
              </div>
            ) : (
              <Value v={v} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function BrandAiOutput({ output }: { output: any }) {
  const data = normalize(output);
  return (
    <Card className="border-primary/20 bg-muted/30">
      <CardContent className="pt-4">
        {typeof data === "string" ? (
          <AiMarkdown content={data} className="text-sm leading-relaxed" />
        ) : Array.isArray(data) ? (
          <Value v={data} />
        ) : data && typeof data === "object" ? (
          <Fields data={data} />
        ) : (
          <span className="text-sm text-muted-foreground">No result.</span>
        )}
      </CardContent>
    </Card>
  );
}

export default BrandAiOutput;
