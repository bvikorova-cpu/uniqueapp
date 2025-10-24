import { ChefChat as ChefChatComponent } from '@/components/cooking/ChefChat';
import { CookingCreditsDisplay } from '@/components/cooking/CookingCreditsDisplay';

const ChefChat = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <CookingCreditsDisplay />
      </div>
      <ChefChatComponent />
    </div>
  );
};

export default ChefChat;
