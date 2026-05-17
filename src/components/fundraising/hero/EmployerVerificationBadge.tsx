import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Building2, Clock } from "lucide-react";
import { format } from "date-fns";

interface Props {
  status?: string | null;
  orgName?: string | null;
  verifierName?: string | null;
  verifiedAt?: string | null;
}

export function EmployerVerificationBadge({ status, orgName, verifierName, verifiedAt }: Props) {
  const isVerified = status === "verified";
  const isPending = status === "pending";

  return (
    <Card
      className={`p-4 border-2 ${
        isVerified
          ? "border-green-500/40 bg-green-500/5"
          : isPending
            ? "border-yellow-500/40 bg-yellow-500/5"
            : "border-border"
      }`}
    >
      <div className="flex items-start gap-3">
        {isVerified ? (
          <ShieldCheck className="w-6 h-6 text-green-600 shrink-0" />
        ) : isPending ? (
          <Clock className="w-6 h-6 text-yellow-600 shrink-0" />
        ) : (
          <Building2 className="w-6 h-6 text-muted-foreground shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h4 className="font-bold text-sm">Employer Verification</h4>
            <Badge variant={isVerified ? "default" : isPending ? "secondary" : "outline"} className="text-xs">
              {isVerified ? "Verified" : isPending ? "Pending" : "Unverified"}
            </Badge>
          </div>
          {orgName && (
            <p className="text-sm font-medium truncate">{orgName}</p>
          )}
          {isVerified && verifiedAt && (
            <p className="text-xs text-muted-foreground mt-1">
              Confirmed{verifierName ? ` by ${verifierName}` : ""} · {format(new Date(verifiedAt), "MMM d, yyyy")}
            </p>
          )}
          {!isVerified && (
            <p className="text-xs text-muted-foreground mt-1">
              {isPending
                ? "Awaiting confirmation from the listed organization."
                : "Donors should know: employer affiliation has not been confirmed."}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
