import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, Calendar } from "lucide-react";
import { differenceInDays } from "date-fns";

export function CouponExpiryHeatmap({ expiry }: { expiry: string | null | undefined }) {
  if (!expiry) return null;
  const days = differenceInDays(new Date(expiry), new Date());

  if (days < 0) return <Badge variant="outline" className="border-rose-500/50 text-rose-500 gap-1"><AlertTriangle className="w-3 h-3" /> Expired</Badge>;
  if (days === 0) return <Badge className="bg-rose-500 hover:bg-rose-500 gap-1"><Clock className="w-3 h-3" /> Today!</Badge>;
  if (days <= 3) return <Badge className="bg-orange-500 hover:bg-orange-500 gap-1"><Clock className="w-3 h-3" /> {days}d left</Badge>;
  if (days <= 7) return <Badge className="bg-amber-500 hover:bg-amber-500 gap-1"><Clock className="w-3 h-3" /> This week</Badge>;
  if (days <= 30) return <Badge variant="secondary" className="gap-1"><Calendar className="w-3 h-3" /> {days}d</Badge>;
  return <Badge variant="outline" className="gap-1 text-emerald-600"><Calendar className="w-3 h-3" /> {days}d</Badge>;
}
