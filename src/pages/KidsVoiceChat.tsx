import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Volume2, Mic, MicOff } from "lucide-react";

export default function KidsVoiceChat() {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 via-emerald-100 to-teal-100">
      <div className="container mx-auto px-4 pt-24 pb-12">
        <Button
          variant="ghost"
          onClick={() => navigate("/kids-channel")}
          className="mb-6 hover:bg-white/50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Kids Channel
        </Button>

        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-green-700 mb-4">
              🎤 Talk to Characters!
            </h1>
            <p className="text-xl text-gray-700">
              Have real conversations with your favorite story characters using your voice!
            </p>
          </div>

          <Card className="p-8 bg-white/90 backdrop-blur-sm">
            <div className="text-center space-y-6">
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-full w-32 h-32 mx-auto flex items-center justify-center">
                <Volume2 className="w-16 h-16 text-green-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-800">
                Coming Soon!
              </h2>

              <p className="text-gray-600 max-w-2xl mx-auto">
                We're working on an amazing voice chat feature that will let you talk to story characters.
                Soon you'll be able to have real conversations and create interactive stories with your voice!
              </p>

              <div className="grid gap-4 max-w-md mx-auto text-left">
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <Mic className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-gray-800">Voice Recognition</p>
                    <p className="text-sm text-gray-600">Speak naturally and characters will understand you</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <Volume2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-gray-800">Character Voices</p>
                    <p className="text-sm text-gray-600">Hear characters speak back to you with unique voices</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <MicOff className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-gray-800">Safe & Fun</p>
                    <p className="text-sm text-gray-600">Kid-friendly conversations in a safe environment</p>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                onClick={() => navigate("/kids-channel")}
              >
                Explore Other Features
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
