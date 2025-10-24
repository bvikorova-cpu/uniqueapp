import { WinePairing as WinePairingComponent } from '@/components/cooking/WinePairing';
import { CookingCreditsDisplay } from '@/components/cooking/CookingCreditsDisplay';

const WinePairing = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <CookingCreditsDisplay />
      </div>
      <WinePairingComponent />
    </div>
  );
};

export default WinePairing;
