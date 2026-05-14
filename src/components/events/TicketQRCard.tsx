import { QRCodeSVG } from "qrcode.react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket, CheckCircle2 } from "lucide-react";
import type { EventTicket } from "@/hooks/useEventTickets";

interface Props {
  ticket: EventTicket;
  eventTitle?: string;
}

export const TicketQRCard = ({ ticket, eventTitle }: Props) => {
  const checkedIn = !!ticket.checked_in_at;

  return (
    <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-background to-pink-500/10">
      <div className="p-4 flex items-center gap-2 border-b border-border/50">
        <Ticket className="h-5 w-5 text-primary" />
        <div className="flex-1">
          <h4 className="font-bold text-sm">{eventTitle || "Event Ticket"}</h4>
          {ticket.seat_label && <p className="text-xs text-muted-foreground">Seat: {ticket.seat_label}</p>}
        </div>
        {checkedIn && (
          <Badge variant="secondary" className="gap-1 bg-emerald-500/20 text-emerald-300">
            <CheckCircle2 className="h-3 w-3" /> Checked in
          </Badge>
        )}
      </div>
      <div className="flex items-center justify-center p-6 bg-white">
        <QRCodeSVG value={ticket.qr_token} size={180} level="H" />
      </div>
      <div className="p-3 text-center text-[10px] font-mono text-muted-foreground break-all">
        {ticket.qr_token.slice(0, 24)}…
      </div>
    </Card>
  );
};
