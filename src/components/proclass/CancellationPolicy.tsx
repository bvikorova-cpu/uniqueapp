import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Clock, CheckCircle2, XCircle } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface CancellationPolicyProps {
  /** Hours before start when full refund still applies. Default 48h. */
  fullRefundHours?: number;
  /** Hours before start when partial (50%) refund applies. Default 24h. */
  partialRefundHours?: number;
  /** Optional class start timestamp to compute current tier. */
  classStartAt?: string;
}

export function CancellationPolicy({
  fullRefundHours = 48,
  partialRefundHours = 24,
  classStartAt,
}: CancellationPolicyProps) {
  let currentTier: "full" | "partial" | "none" | null = null;
  if (classStartAt) {
    const hoursLeft = (new Date(classStartAt).getTime() - Date.now()) / 3_600_000;
    if (hoursLeft >= fullRefundHours) currentTier = "full";
    else if (hoursLeft >= partialRefundHours) currentTier = "partial";
    else currentTier = "none";
  }

  const Row = ({ icon, label, value, active }: any) => (
    <div className={`flex items-start gap-3 p-2 rounded ${active ? "bg-primary/10 border border-primary/30" : ""}`}>
      {icon}
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs opacity-70">{value}</p>
      </div>
    </div>
  );

  return (
    <>
      <FloatingHowItWorks title={"Cancellation Policy - How it works"} steps={[{ title: 'Open', desc: 'Access the Cancellation Policy section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Cancellation Policy.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h3 className="font-semibold text-sm">Cancellation Policy</h3>
        </div>
        <Row
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />}
          label={`Full refund — more than ${fullRefundHours}h before start`}
          value="100% returned to your credits / card"
          active={currentTier === "full"}
        />
        <Row
          icon={<Clock className="w-4 h-4 text-amber-400 mt-0.5" />}
          label={`Partial refund — ${partialRefundHours}–${fullRefundHours}h before start`}
          value="50% refund (rest goes to instructor as compensation)"
          active={currentTier === "partial"}
        />
        <Row
          icon={<XCircle className="w-4 h-4 text-red-400 mt-0.5" />}
          label={`No refund — less than ${partialRefundHours}h before start`}
          value="Slot is held and instructor is paid in full"
          active={currentTier === "none"}
        />
      </CardContent>
    </Card>
    </>
  );
}
