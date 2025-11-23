import { Card } from "@/components/ui/card";
import { Flag } from "lucide-react";

export default function WallPages() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      <Card className="p-8 text-center">
        <Flag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-semibold mb-2">Pages</h2>
        <p className="text-muted-foreground">Your pages will appear here</p>
      </Card>
    </div>
  );
}
