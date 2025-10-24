import { MealPlannerGenerator } from '@/components/cooking/MealPlannerGenerator';
import { CookingCreditsDisplay } from '@/components/cooking/CookingCreditsDisplay';

const MealPlanner = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <CookingCreditsDisplay />
      </div>
      <MealPlannerGenerator />
    </div>
  );
};

export default MealPlanner;
