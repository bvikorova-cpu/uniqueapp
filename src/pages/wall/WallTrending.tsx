import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function WallTrending() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      <Card className="p-8 text-center">
        <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-semibold mb-2">Trending</h2>
        <p className="text-muted-foreground">Trending posts will appear here</p>
      </Card>
    </div>
  );
}
