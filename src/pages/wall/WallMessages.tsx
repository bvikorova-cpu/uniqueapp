import { Card } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

export default function WallMessages() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      <Card className="p-8 text-center">
        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-semibold mb-2">Messages</h2>
        <p className="text-muted-foreground">Your messages will appear here</p>
      </Card>
    </div>
  );
}
