import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Mic, Play, Save, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Puppet {
  id: number;
  name: string;
  emoji: string;
  color: string;
}

const availablePuppets: Puppet[] = [
  { id: 1, name: "Princess", emoji: "👸", color: "from-pink-200 to-pink-300" },
  { id: 2, name: "Knight", emoji: "🤴", color: "from-blue-200 to-blue-300" },
  { id: 3, name: "Dragon", emoji: "🐉", color: "from-red-200 to-red-300" },
  { id: 4, name: "Wizard", emoji: "🧙", color: "from-purple-200 to-purple-300" },
  { id: 5, name: "Fairy", emoji: "🧚", color: "from-green-200 to-green-300" },
  { id: 6, name: "Monster", emoji: "👾", color: "from-yellow-200 to-yellow-300" }
];

const PuppetTheater = () => {
  const navigate = useNavigate();
  const [selectedPuppets, setSelectedPuppets] = useState<Puppet[]>([]);
  const [storyTitle, setStoryTitle] = useState("");
  const [storyScript, setStoryScript] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const togglePuppet = (puppet: Puppet) => {
    if (selectedPuppets.find(p => p.id === puppet.id)) {
      setSelectedPuppets(selectedPuppets.filter(p => p.id !== puppet.id));
      toast.info(`${puppet.name} removed from your show`);
    } else {
      if (selectedPuppets.length < 4) {
        setSelectedPuppets([...selectedPuppets, puppet]);
        toast.success(`${puppet.name} added to your show!`);
      } else {
        toast.error("Maximum 4 puppets per show!");
      }
    }
  };

  const handleRecord = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast.success("Recording started! 🎤");
    } else {
      toast.success("Recording saved! ✓");
    }
  };

  const handleSave = () => {
    if (!storyTitle || selectedPuppets.length === 0) {
      toast.error("Add a title and select at least one puppet!");
      return;
    }
    toast.success("Your puppet show has been saved! 🎭");
  };

  const handleShare = () => {
    if (!storyTitle) {
      toast.error("Save your show first!");
      return;
    }
    toast.success("Show shared with friends! 🎉");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 p-4">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/kids-channel')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Kids Channel
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-rose-700 mb-2">
            🎭 Puppet Theater Maker 🎪
          </h1>
          <p className="text-xl text-gray-600">
            Create your own puppet show!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left side - Puppet Selection */}
          <Card className="border-4 border-rose-300 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-rose-700">
                Choose Your Puppets
                <Badge className="ml-3 bg-rose-500 text-white">
                  {selectedPuppets.length}/4 selected
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {availablePuppets.map((puppet) => {
                  const isSelected = selectedPuppets.find(p => p.id === puppet.id);
                  return (
                    <Card
                      key={puppet.id}
                      className={`bg-gradient-to-br ${puppet.color} cursor-pointer border-4 transition-all duration-300 hover:scale-105 ${
                        isSelected ? "border-rose-600 shadow-xl" : "border-gray-300"
                      }`}
                      onClick={() => togglePuppet(puppet)}
                    >
                      <CardContent className="text-center p-6">
                        <div className="text-6xl mb-2">{puppet.emoji}</div>
                        <p className="font-bold text-gray-700">{puppet.name}</p>
                        {isSelected && (
                          <Badge className="mt-2 bg-rose-600 text-white">
                            Selected ✓
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {selectedPuppets.length > 0 && (
                <div className="mt-6 p-4 bg-white rounded-lg border-2 border-rose-200">
                  <p className="font-semibold text-rose-700 mb-2">Your Cast:</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedPuppets.map((puppet) => (
                      <Badge key={puppet.id} className="text-lg bg-rose-500 text-white">
                        {puppet.emoji} {puppet.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right side - Story Creation */}
          <Card className="border-4 border-rose-300 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-rose-700">
                Create Your Story
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Show Title
                </label>
                <Input
                  placeholder="Enter your show title..."
                  value={storyTitle}
                  onChange={(e) => setStoryTitle(e.target.value)}
                  className="text-lg border-2 border-rose-200"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Story Script
                </label>
                <Textarea
                  placeholder="Write your puppet show story here..."
                  value={storyScript}
                  onChange={(e) => setStoryScript(e.target.value)}
                  className="min-h-[200px] border-2 border-rose-200"
                />
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleRecord}
                  className={`w-full ${
                    isRecording ? "bg-red-500 hover:bg-red-600" : "bg-rose-500 hover:bg-rose-600"
                  } text-white py-6 text-lg`}
                >
                  <Mic className="w-5 h-5 mr-2" />
                  {isRecording ? "Stop Recording" : "Record Voice"}
                </Button>

                <Button
                  onClick={handleSave}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-6 text-lg"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Save Show
                </Button>

                <Button
                  onClick={handleShare}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-6 text-lg"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share with Friends
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stage Preview */}
        {selectedPuppets.length > 0 && (
          <Card className="mt-6 border-4 border-rose-300 shadow-xl bg-gradient-to-b from-purple-100 to-pink-100">
            <CardHeader>
              <CardTitle className="text-2xl text-rose-700 text-center">
                🎬 Stage Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-b from-blue-200 to-green-200 rounded-lg p-8 min-h-[300px] flex items-end justify-around">
                {selectedPuppets.map((puppet, index) => (
                  <div
                    key={puppet.id}
                    className="text-8xl animate-bounce"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    {puppet.emoji}
                  </div>
                ))}
              </div>
              <div className="text-center mt-4">
                <Button className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-4 text-lg">
                  <Play className="w-5 h-5 mr-2" />
                  Play Show
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PuppetTheater;
