import { RecipeGenerator as RecipeGeneratorComponent } from '@/components/cooking/RecipeGenerator';
import { CookingCreditsDisplay } from '@/components/cooking/CookingCreditsDisplay';

const RecipeGenerator = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <CookingCreditsDisplay />
      </div>
      <RecipeGeneratorComponent />
    </div>
  );
};

export default RecipeGenerator;
