import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle, Plus } from "lucide-react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface ChatCreditBannerProps {
  credits: number;
  loading?: boolean;
}

export const ChatCreditBanner = ({ credits, loading }: ChatCreditBannerProps) => {
  const navigate = useNavigate();
  const isEmpty = credits < 1;

  return (
    <>
      <FloatingHowItWorks title={"Chat Credit Banner - How it works"} steps={[{ title: 'Open', desc: 'Access the Chat Credit Banner section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Chat Credit Banner.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div
      className={`rounded-2xl border-2 p-4 mb-6 flex items-center justify-between gap-4 backdrop-blur-md shadow-lg ${
        isEmpty
          ? "bg-gradient-to-r from-orange-100 to-pink-100 border-orange-300"
          : "bg-white/80 border-purple-200"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
          isEmpty ? "bg-orange-200" : "bg-purple-100"
        }`}>
          <MessageCircle className={`h-5 w-5 ${isEmpty ? "text-orange-600" : "text-purple-600"}`} />
        </div>
        <div>
          <p className="text-sm text-gray-500">Chat credits</p>
          <p className="font-bold text-lg text-gray-800">
            {loading ? "…" : credits} {credits === 1 ? "message" : "messages"} left
          </p>
        </div>
      </div>
      <Button
        onClick={() => navigate("/kids-voice-chat-pricing")}
        size="sm"
        variant={isEmpty ? "default" : "outline"}
        className={isEmpty ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" : ""}
      >
        <Plus className="h-4 w-4 mr-1" />
        {isEmpty ? "Buy credits" : "Add more"}
      </Button>
    </div>
    </>
  );
};
