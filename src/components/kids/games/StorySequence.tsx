import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Check, X } from "lucide-react";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface StorySequenceProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

const stories = [
  {
    title: "Little Red Riding Hood",
    events: [
      { id: 1, text: "Grandma was sick", order: 1 },
      { id: 2, text: "Little Red Riding Hood walked through the forest", order: 2 },
      { id: 3, text: "She met the wolf in the woods", order: 3 },
      { id: 4, text: "The wolf ran to Grandma's house", order: 4 },
      { id: 5, text: "The hunter saved Grandma", order: 5 },
    ],
  },
];

export const StorySequence = ({ onComplete, onBack }: StorySequenceProps) => {
  const [currentStory] = useState(stories[0]);
  const [shuffledEvents, setShuffledEvents] = useState(
    [...currentStory.events].sort(() => Math.random() - 0.5)
  );
  const [selectedEvents, setSelectedEvents] = useState<typeof currentStory.events>([]);
  const [isChecked, setIsChecked] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleEventClick = (event: typeof currentStory.events[0]) => {
    if (isChecked) return;
    
    if (selectedEvents.find(e => e.id === event.id)) {
      setSelectedEvents(selectedEvents.filter(e => e.id !== event.id));
    } else {
      setSelectedEvents([...selectedEvents, event]);
    }
  };

  const handleCheck = () => {
    if (selectedEvents.length !== currentStory.events.length) {
      toast.error("Select all events!");
      return;
    }

    setIsChecked(true);
    const isCorrect = selectedEvents.every((event, index) => event.order === index + 1);

    if (isCorrect) {
      const score = Math.max(100 - attempts * 20, 20);
      toast.success(`Excellent! Correct order! +${score} points`);
      setTimeout(() => onComplete(score), 2000);
    } else {
      toast.error("Wrong order! Try again.");
      setTimeout(() => {
        setIsChecked(false);
        setSelectedEvents([]);
        setAttempts(attempts + 1);
      }, 2000);
    }
  };

  const handleReset = () => {
    setSelectedEvents([]);
    setIsChecked(false);
    setShuffledEvents([...currentStory.events].sort(() => Math.random() - 0.5));
  };

  return (
    <>
      <FloatingHowItWorks title={"Story Sequence - How it works"} steps={[{ title: 'Open', desc: 'Access the Story Sequence section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Story Sequence.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="min-h-screen bg-gradient-to-b from-red-100 via-pink-100 to-purple-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack} className="hover:bg-white/50">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="text-lg font-bold text-red-600">
            Attempts: {attempts}
          </div>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm border-4 border-white/50 shadow-2xl mb-6">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold text-red-600 text-center mb-4">
              Story Sequence 📚
            </h2>
            <p className="text-center text-gray-700 mb-2">
              Arrange the events in the correct order
            </p>
            <h3 className="text-2xl font-bold text-purple-600 text-center mb-8">
              {currentStory.title}
            </h3>

            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-700 mb-4">
                Select events in the correct order:
              </h4>
              <div className="grid gap-3">
                {shuffledEvents.map((event) => {
                  const isSelected = selectedEvents.find(e => e.id === event.id);
                  const selectedIndex = selectedEvents.findIndex(e => e.id === event.id);
                  const isCorrect = isChecked && event.order === selectedIndex + 1;
                  const isWrong = isChecked && isSelected && !isCorrect;

                  return (
                    <button
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      disabled={isChecked}
                      className={`p-4 rounded-lg text-left font-semibold transition-all ${
                        isCorrect
                          ? "bg-green-200 border-4 border-green-500"
                          : isWrong
                          ? "bg-red-200 border-4 border-red-500"
                          : isSelected
                          ? "bg-purple-200 border-4 border-purple-500"
                          : "bg-white border-4 border-gray-300 hover:border-purple-300 hover:bg-purple-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex-1">{event.text}</span>
                        <div className="flex items-center gap-2">
                          {isSelected && (
                            <span className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">
                              {selectedIndex + 1}
                            </span>
                          )}
                          {isCorrect && <Check className="w-6 h-6 text-green-600" />}
                          {isWrong && <X className="w-6 h-6 text-red-600" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button
                onClick={handleCheck}
                disabled={isChecked || selectedEvents.length === 0}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                Check
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="border-2"
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};
