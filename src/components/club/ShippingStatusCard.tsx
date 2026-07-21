import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Truck, CheckCircle2, Pencil, Copy } from "lucide-react";
import { useState } from "react";
import { EditShippingDialog } from "./EditShippingDialog";
import type { ClubMembership } from "@/hooks/useClubMembership";
import { useToast } from "@/hooks/use-toast";

interface Props {
  membership: ClubMembership;
  onUpdated: () => void;
}

export function ShippingStatusCard({ membership, onUpdated }: Props) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  if (membership.tier !== "physical") return null;

  const status = membership.shipping_status;
  const canEdit = status === "pending";

  const icon =
    status === "delivered" ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> :
    status === "shipped"   ? <Truck className="h-5 w-5 text-amber-300" /> :
                              <Package className="h-5 w-5 text-purple-300" />;

  const label =
    status === "delivered" ? "Delivered" :
    status === "shipped"   ? "In transit" :
                              "Preparing your card";

  return (
    <>
      <Card className="p-4 space-y-3 bg-white/5 border-white/10 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <span className="font-semibold">{label}</span>
            <Badge variant="secondary" className="capitalize">{status}</Badge>
          </div>
          {canEdit && (
            <Button size="sm" variant="outline" className="text-white border-white/40 bg-white/10 hover:bg-white/20" onClick={() => setOpen(true)}>
              <Pencil className="h-4 w-4 mr-1" /> Edit
            </Button>
          )}
        </div>

        <div className="text-sm text-white/80 space-y-1">
          <div><span className="text-white/50">Recipient:</span> {membership.recipient_name ?? "—"}</div>
          <div><span className="text-white/50">Phone:</span> {membership.phone ?? "—"}</div>
          <div>
            <span className="text-white/50">Address:</span>{" "}
            {(() => {
              const a = membership.shipping_address?.address ?? membership.shipping_address ?? {};
              const parts = [a.line1, a.line2, a.postal_code, a.city, a.country].filter(Boolean);
              return parts.join(", ") || "—";
            })()}
          </div>
          {membership.shipping_note && (
            <div><span className="text-white/50">Note:</span> {membership.shipping_note}</div>
          )}
          {membership.tracking_number && (
            <div className="flex items-center gap-2">
              <span className="text-white/50">Tracking:</span>
              <code className="bg-black/30 px-1.5 py-0.5 rounded">{membership.tracking_number}</code>
              <button
                aria-label="Copy tracking"
                onClick={() => {
                  navigator.clipboard.writeText(membership.tracking_number!);
                  toast({ title: "Tracking copied" });
                }}
                className="text-white/70 hover:text-white"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          {membership.shipped_at && (
            <div className="text-xs text-white/50">
              Shipped {new Date(membership.shipped_at).toLocaleDateString()}
            </div>
          )}
        </div>

        {status === "pending" && (
          <p className="text-xs text-white/60">
            Cards are printed in weekly batches. You can update shipping details until we ship.
          </p>
        )}
      </Card>

      <EditShippingDialog
        membership={membership}
        open={open}
        onOpenChange={setOpen}
        onSaved={onUpdated}
      />
    </>
  );
}
