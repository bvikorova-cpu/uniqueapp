import { Card, CardContent } from "@/components/ui/card";
import { Smartphone } from "lucide-react";

export function AlternativePayMethods() {
  return (
    <Card className="max-w-5xl mx-auto mb-6 bg-muted/30">
      <CardContent className="p-4 flex items-center gap-3">
        <Smartphone className="h-5 w-5 text-primary flex-shrink-0" />
        <p className="text-sm text-muted-foreground">
          Pay with <strong>Apple Pay</strong>, <strong>Google Pay</strong>, <strong>Link</strong>, or any major card —
          all enabled automatically at checkout.
        </p>
      </CardContent>
    </Card>
  );
}
