import { FoodScanner as FoodScannerComponent } from '@/components/cooking/FoodScanner';
import { CookingCreditsDisplay } from '@/components/cooking/CookingCreditsDisplay';

const FoodScanner = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <CookingCreditsDisplay />
      </div>
      <FoodScannerComponent />
    </div>
  );
};

export default FoodScanner;
