import { Card, CardContent } from "@/components/ui/card";
import { Smartphone } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function AlternativePayMethods() {
  return (
    <>
      <FloatingHowItWorks title={"Alternative Pay Methods - How it works"} steps={[{ title: 'Open', desc: 'Access the Alternative Pay Methods section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Alternative Pay Methods.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="max-w-5xl mx-auto mb-6 bg-muted/30">
      <CardContent className="p-4 flex items-center gap-3">
        <Smartphone className="h-5 w-5 text-primary flex-shrink-0" />
        <p className="text-sm text-muted-foreground">
          Pay with <strong>Apple Pay</strong>, <strong>Google Pay</strong>, <strong>Link</strong>, or any major card —
          all enabled automatically at checkout.
        </p>
      </CardContent>
    </Card>
    </>
  );
}
