import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function WallGroups() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      <Card className="p-8 text-center">
        <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-semibold mb-2">Groups</h2>
        <p className="text-muted-foreground">Your groups will appear here</p>
      </Card>
    </div>
  );
}
