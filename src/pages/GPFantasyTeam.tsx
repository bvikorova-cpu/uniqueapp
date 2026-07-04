import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Trophy, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Driver {
  id: string;
  name: string;
  team: string;
  emoji: string;
  points: number;
}

interface Constructor {
  id: string;
  name: string;
  emoji: string;
  points: number;
}

const drivers: Driver[] = [
  { id: "VER", name: "Max Verstappen", team: "Red Bull", emoji: "🏎️", points: 575 },
  { id: "HAM", name: "Lewis Hamilton", team: "Mercedes", emoji: "🏎️", points: 520 },
  { id: "LEC", name: "Charles Leclerc", team: "Ferrari", emoji: "🏎️", points: 490 },
  { id: "NOR", name: "Lando Norris", team: "McLaren", emoji: "🏎️", points: 450 },
  { id: "SAI", name: "Carlos Sainz", team: "Ferrari", emoji: "🏎️", points: 420 },
  { id: "PER", name: "Sergio Perez", team: "Red Bull", emoji: "🏎️", points: 380 },
  { id: "RUS", name: "George Russell", team: "Mercedes", emoji: "🏎️", points: 360 },
  { id: "ALO", name: "Fernando Alonso", team: "Aston Martin", emoji: "🏎️", points: 340 }
];

const constructors: Constructor[] = [
  { id: "RBR", name: "Red Bull Racing", emoji: "🔵", points: 850 },
  { id: "MER", name: "Mercedes-AMG", emoji: "⚫", points: 780 },
  { id: "FER", name: "Ferrari", emoji: "🔴", points: 760 },
  { id: "MCL", name: "McLaren", emoji: "🟠", points: 720 }
];

const GPFantasyTeam = () => {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState("");
  const [selectedDriver1, setSelectedDriver1] = useState<string | null>(null);
  const [selectedDriver2, setSelectedDriver2] = useState<string | null>(null);
  const [selectedConstructor, setSelectedConstructor] = useState<string | null>(null);
  const [existingTeam, setExistingTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('f1_fantasy_teams')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (data) {
        setExistingTeam(data);
        setTeamName(data.team_name);
        setSelectedDriver1(data.driver1_id);
        setSelectedDriver2(data.driver2_id);
        setSelectedConstructor(data.constructor_id);
      }
    } catch (error) {
      console.error('Error loading team:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTeam = async () => {
    if (!teamName || !selectedDriver1 || !selectedDriver2 || !selectedConstructor) {
      toast.error("Please fill all fields!");
      return;
    }

    if (selectedDriver1 === selectedDriver2) {
      toast.error("Please select different drivers!");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const teamData = {
        user_id: session.user.id,
        team_name: teamName,
        driver1_id: selectedDriver1,
        driver2_id: selectedDriver2,
        constructor_id: selectedConstructor,
      };

      if (existingTeam) {
        const { error } = await supabase
          .from('f1_fantasy_teams')
          .update(teamData)
          .eq('id', existingTeam.id);

        if (error) throw error;
        toast.success("Team updated successfully! 🏆");
      } else {
        const { error } = await supabase
          .from('f1_fantasy_teams')
          .insert(teamData);

        if (error) throw error;
        toast.success("Team created successfully! 🏆");
      }

      loadTeam();
    } catch (error) {
      console.error('Error saving team:', error);
      toast.error("Failed to save team");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  const calculateTotalPoints = () => {
    let total = 0;
    if (selectedDriver1) {
      const driver = drivers.find(d => d.id === selectedDriver1);
      if (driver) total += driver.points;
    }
    if (selectedDriver2) {
      const driver = drivers.find(d => d.id === selectedDriver2);
      if (driver) total += driver.points;
    }
    if (selectedConstructor) {
      const constructor = constructors.find(c => c.id === selectedConstructor);
      if (constructor) total += constructor.points;
    }
    return total;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-black to-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/gp-racing')}
          className="mb-6 text-white hover:bg-white/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Racing
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white mb-2 animate-fade-in">
            🏁 Fantasy Team Manager
          </h1>
          <p className="text-2xl text-gray-300">Build Your Dream Racing Team</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Team Info */}
          <div className="lg:col-span-1">
            <Card className="border-4 border-red-500 bg-black/90 shadow-2xl sticky top-4">
              <CardHeader>
                <CardTitle className="text-2xl text-white text-center">
                  Your Team
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-white text-sm font-semibold mb-2 block">
                    Team Name
                  </label>
                  <Input
                    placeholder="Enter team name..."
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="border-2 border-red-500 bg-gray-900 text-white"
                  />
                </div>

                <Card className="bg-gradient-to-r from-red-900/50 to-black border-2 border-red-400">
                  <CardContent className="pt-6 text-center">
                    <Trophy className="w-12 h-12 mx-auto text-yellow-500 mb-2" />
                    <p className="text-2xl font-bold text-white mb-1">
                      {calculateTotalPoints()}
                    </p>
                    <p className="text-gray-400 text-sm">Total Points</p>
                  </CardContent>
                </Card>

                <div className="space-y-2 text-white">
                  <p className="text-sm font-semibold">Selected:</p>
                  {selectedDriver1 && (
                    <Badge className="bg-blue-600 w-full justify-start">
                      Driver 1: {drivers.find(d => d.id === selectedDriver1)?.name}
                    </Badge>
                  )}
                  {selectedDriver2 && (
                    <Badge className="bg-blue-600 w-full justify-start">
                      Driver 2: {drivers.find(d => d.id === selectedDriver2)?.name}
                    </Badge>
                  )}
                  {selectedConstructor && (
                    <Badge className="bg-purple-600 w-full justify-start">
                      Team: {constructors.find(c => c.id === selectedConstructor)?.name}
                    </Badge>
                  )}
                </div>

                <Button
                  onClick={saveTeam}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {existingTeam ? "Update Team" : "Create Team"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Driver & Constructor Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Driver 1 Selection */}
            <Card className="border-4 border-red-500 bg-black/90 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl text-white">
                  Select Driver 1
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {drivers.map((driver) => (
                    <Card
                      key={driver.id}
                      className={`cursor-pointer border-4 transition-all duration-300 hover:scale-105 ${
                        selectedDriver1 === driver.id
                          ? "border-blue-500 bg-blue-900/50"
                          : "border-gray-600 bg-gray-900"
                      }`}
                      onClick={() => setSelectedDriver1(driver.id)}
                    >
                      <CardContent className="pt-6 text-center">
                        <div className="text-5xl mb-2">{driver.emoji}</div>
                        <p className="font-bold text-white text-lg">{driver.name}</p>
                        <p className="text-gray-400 text-sm">{driver.team}</p>
                        <Badge className="mt-2 bg-yellow-500 text-black">
                          <Star className="w-4 h-4 mr-1 inline" />
                          {driver.points} pts
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Driver 2 Selection */}
            <Card className="border-4 border-red-500 bg-black/90 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl text-white">
                  Select Driver 2
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {drivers.map((driver) => (
                    <Card
                      key={driver.id}
                      className={`cursor-pointer border-4 transition-all duration-300 hover:scale-105 ${
                        selectedDriver2 === driver.id
                          ? "border-blue-500 bg-blue-900/50"
                          : "border-gray-600 bg-gray-900"
                      }`}
                      onClick={() => setSelectedDriver2(driver.id)}
                    >
                      <CardContent className="pt-6 text-center">
                        <div className="text-5xl mb-2">{driver.emoji}</div>
                        <p className="font-bold text-white text-lg">{driver.name}</p>
                        <p className="text-gray-400 text-sm">{driver.team}</p>
                        <Badge className="mt-2 bg-yellow-500 text-black">
                          <Star className="w-4 h-4 mr-1 inline" />
                          {driver.points} pts
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Constructor Selection */}
            <Card className="border-4 border-red-500 bg-black/90 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl text-white">
                  Select Constructor (Team)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {constructors.map((constructor) => (
                    <Card
                      key={constructor.id}
                      className={`cursor-pointer border-4 transition-all duration-300 hover:scale-105 ${
                        selectedConstructor === constructor.id
                          ? "border-purple-500 bg-purple-900/50"
                          : "border-gray-600 bg-gray-900"
                      }`}
                      onClick={() => setSelectedConstructor(constructor.id)}
                    >
                      <CardContent className="pt-6 text-center">
                        <div className="text-6xl mb-2">{constructor.emoji}</div>
                        <p className="font-bold text-white text-lg">{constructor.name}</p>
                        <Badge className="mt-2 bg-yellow-500 text-black">
                          <Star className="w-4 h-4 mr-1 inline" />
                          {constructor.points} pts
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GPFantasyTeam;
