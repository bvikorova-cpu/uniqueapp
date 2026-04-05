import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { MyPurchases } from "@/components/stock-library/MyPurchases";

interface MyPurchasesViewProps {
  onBack: () => void;
}

export function MyPurchasesView({ onBack }: MyPurchasesViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
        <h2 className="text-2xl font-bold flex items-center gap-2"><ShoppingBag className="w-6 h-6 text-teal-500" /> My Purchases</h2>
      </div>
      <MyPurchases />
    </div>
  );
}
