import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface PropertyExpirationBadgeProps {
  expiresAt: string | null;
  status: string;
}

export function PropertyExpirationBadge({ expiresAt, status }: PropertyExpirationBadgeProps) {
  if (status !== 'active' || !expiresAt) return null;

  const now = new Date();
  const expires = new Date(expiresAt);
  const daysLeft = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) return null;

  const variant = daysLeft <= 3 ? 'destructive' : daysLeft <= 7 ? 'secondary' : 'outline';

  return (
    <Badge variant={variant} className="gap-1">
      <Clock className="h-3 w-3" />
      {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
    </Badge>
  );
}
