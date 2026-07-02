import { FoodScanner as FoodScannerComponent } from '@/components/cooking/FoodScanner';
import { CookingCreditsDisplay } from '@/components/cooking/CookingCreditsDisplay';
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const FoodScanner = () => {
  return (
    <>
      <FloatingHowItWorks title="How Food Scanner works" steps={[
          { title: 'Explore the feature', desc: 'Browse the options and pick what interests you.' },
          { title: 'Interact', desc: 'Tap actions, generate content, or make a selection. AI actions cost 2-5 credits.' },
          { title: 'Review results', desc: 'Check the output, share, save or purchase where available.' },
          { title: 'Come back', desc: 'Progress and history are saved to your account.' },
        ]} />
      <div className="container mx-auto px-4 pt-20 pb-8 max-w-4xl">
      <div className="mb-6">
        <CookingCreditsDisplay />
      </div>
      <FoodScannerComponent />
    </div>
    </>
    );
};

export default FoodScanner;
