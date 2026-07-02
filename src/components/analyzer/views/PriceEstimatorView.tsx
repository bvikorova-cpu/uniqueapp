import { DollarSign } from "lucide-react";
import { AnalyzerToolLayout } from "../AnalyzerToolLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export const PriceEstimatorView = ({ onBack }: { onBack: () => void }) => {
  const [category, setCategory] = useState("general");
  const [condition, setCondition] = useState("good");

  return (
    <>
      <FloatingHowItWorks title={"Price Estimator View - How it works"} steps={[{ title: 'Open', desc: 'Access the Price Estimator View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Price Estimator View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <AnalyzerToolLayout
      title="AI Price Estimator"
      description="Get accurate price estimates for any item — electronics, cars, antiques, fashion & more"
      icon={<DollarSign className="w-7 h-7" />}
      action="price-estimator"
      creditCost={3}
      placeholder="Describe the item you want to price (e.g., 2020 MacBook Pro 16-inch, M1 Max, 32GB RAM, good condition with minor scratches on bottom)"
      gradient="from-emerald-600 to-cyan-600"
      onBack={onBack}
      buildBody={(input) => ({ description: input, category, condition })}
    >
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm font-medium mb-1 block text-muted-foreground">Category</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="border-cyan-500/20"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="vehicles">Vehicles</SelectItem>
              <SelectItem value="fashion">Fashion & Luxury</SelectItem>
              <SelectItem value="antiques">Antiques & Art</SelectItem>
              <SelectItem value="collectibles">Collectibles</SelectItem>
              <SelectItem value="real-estate">Real Estate</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block text-muted-foreground">Condition</label>
          <Select value={condition} onValueChange={setCondition}>
            <SelectTrigger className="border-cyan-500/20"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New / Sealed</SelectItem>
              <SelectItem value="like-new">Like New</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
              <SelectItem value="poor">Poor / Damaged</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </AnalyzerToolLayout>
    </>
  );
};
