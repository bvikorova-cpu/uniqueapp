import { Card } from "@/components/ui/card";
import { Users2 } from "lucide-react";

export default function WallFriends() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      <Card className="p-8 text-center">
        <Users2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-semibold mb-2">Friends</h2>
        <p className="text-muted-foreground">Your friends will appear here</p>
      </Card>
    </div>
  );
}
