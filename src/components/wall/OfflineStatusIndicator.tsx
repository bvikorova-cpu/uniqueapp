import { WifiOff, CloudUpload } from "lucide-react";
import { useOfflineQueue } from "@/hooks/useOfflineQueue";
import { Badge } from "@/components/ui/badge";

export function OfflineStatusIndicator() {
  const { online, pendingCount } = useOfflineQueue();

  if (online && pendingCount === 0) return null;

  return (
    <div className="flex items-center gap-2">
      {!online && (
        <Badge variant="destructive" className="gap-1">
          <WifiOff className="h-3 w-3" />
          Offline
        </Badge>
      )}
      {pendingCount > 0 && (
        <Badge variant="secondary" className="gap-1">
          <CloudUpload className="h-3 w-3" />
          {pendingCount} pending
        </Badge>
      )}
    </div>
  );
}
