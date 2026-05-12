import { ShieldCheck } from "lucide-react";

export function RolloverPolicyBanner() {
  return (
    <div className="max-w-5xl mx-auto mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex items-center gap-3">
      <ShieldCheck className="h-6 w-6 text-emerald-500 flex-shrink-0" />
      <div>
        <p className="font-bold text-sm">Credits never expire suddenly</p>
        <p className="text-xs text-muted-foreground">Every credit is valid <strong>12 months</strong> from purchase. Unused credits roll over to next month automatically.</p>
      </div>
    </div>
  );
}
