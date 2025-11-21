import { RestaurantAnalyzer as RestaurantAnalyzerComponent } from '@/components/cooking/RestaurantAnalyzer';
import { CookingCreditsDisplay } from '@/components/cooking/CookingCreditsDisplay';

const RestaurantAnalyzer = () => {
  return (
    <div className="container mx-auto px-4 pt-20 pb-8 max-w-4xl">
      <div className="mb-6">
        <CookingCreditsDisplay />
      </div>
      <RestaurantAnalyzerComponent />
    </div>
  );
};

export default RestaurantAnalyzer;
