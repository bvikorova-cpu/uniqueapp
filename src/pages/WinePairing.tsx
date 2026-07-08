import { WinePairing as WinePairingComponent } from '@/components/cooking/WinePairing';
import { CookingCreditsDisplay } from '@/components/cooking/CookingCreditsDisplay';
import { FloatingHowItWorks } from '@/components/common/FloatingHowItWorks';

const WinePairing = () => {
  return (
    <div className="container mx-auto px-4 pt-20 pb-8 max-w-4xl">
      <FloatingHowItWorks
        title="How Wine Pairing works"
        intro="Get expert AI wine matches for any dish."
        steps={[
          { title: 'Enter your dish', desc: 'Type the meal you plan to serve.' },
          { title: 'Generate pairings', desc: 'AI suggests wines with reasoning (1 credit).' },
          { title: 'Review picks', desc: 'See wine type, price range and why it works.' },
          { title: 'Iterate', desc: 'Try alternate dishes for more suggestions.' },
        ]}
      />
      <div className="mb-6">
        <CookingCreditsDisplay />
      </div>
      <WinePairingComponent />
    </div>
  );
};

export default WinePairing;
