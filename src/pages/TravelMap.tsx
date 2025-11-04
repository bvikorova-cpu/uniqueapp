import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Star, Flag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Country {
  id: number;
  name: string;
  emoji: string;
  capital: string;
  continent: string;
  funFact: string;
  stamps: number;
  color: string;
}

const countries: Country[] = [
  {
    id: 1,
    name: "France",
    emoji: "🇫🇷",
    capital: "Paris",
    continent: "Europe",
    funFact: "Home to the Eiffel Tower and delicious croissants!",
    stamps: 0,
    color: "from-blue-100 to-red-100"
  },
  {
    id: 2,
    name: "Japan",
    emoji: "🇯🇵",
    capital: "Tokyo",
    continent: "Asia",
    funFact: "Land of sushi, anime, and cherry blossoms!",
    stamps: 0,
    color: "from-red-100 to-white"
  },
  {
    id: 3,
    name: "Egypt",
    emoji: "🇪🇬",
    capital: "Cairo",
    continent: "Africa",
    funFact: "Home to the ancient pyramids and the Sphinx!",
    stamps: 0,
    color: "from-yellow-100 to-orange-100"
  },
  {
    id: 4,
    name: "Brazil",
    emoji: "🇧🇷",
    capital: "Brasília",
    continent: "South America",
    funFact: "Famous for the Amazon rainforest and carnival!",
    stamps: 0,
    color: "from-green-100 to-yellow-100"
  },
  {
    id: 5,
    name: "Australia",
    emoji: "🇦🇺",
    capital: "Canberra",
    continent: "Oceania",
    funFact: "Home to kangaroos, koalas, and the Great Barrier Reef!",
    stamps: 0,
    color: "from-blue-100 to-green-100"
  },
  {
    id: 6,
    name: "Canada",
    emoji: "🇨🇦",
    capital: "Ottawa",
    continent: "North America",
    funFact: "Land of maple syrup, hockey, and the Northern Lights!",
    stamps: 0,
    color: "from-red-100 to-white"
  }
];

const TravelMap = () => {
  const navigate = useNavigate();
  const [visitedCountries, setVisitedCountries] = useState<Set<number>>(new Set());
  const [totalStamps, setTotalStamps] = useState(0);

  const visitCountry = (countryId: number) => {
    if (!visitedCountries.has(countryId)) {
      setVisitedCountries(new Set(visitedCountries).add(countryId));
      setTotalStamps(totalStamps + 1);
      toast.success("New stamp collected! 🎉");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4">
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
          <h1 className="text-5xl font-bold text-teal-700 mb-2">
            🌍 Virtual Travel Map 🗺️
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Collect passport stamps from around the world!
          </p>
          <Badge className="bg-teal-500 text-white text-xl px-6 py-3">
            <Star className="w-5 h-5 mr-2 inline" />
            Stamps Collected: {totalStamps}/{countries.length}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {countries.map((country) => {
            const isVisited = visitedCountries.has(country.id);
            return (
              <Card
                key={country.id}
                className={`bg-gradient-to-br ${country.color} border-4 ${
                  isVisited ? "border-teal-400" : "border-gray-300"
                } shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer`}
                onClick={() => visitCountry(country.id)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-3xl mb-2">
                        {country.emoji} {country.name}
                      </CardTitle>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          <MapPin className="w-4 h-4 inline mr-1" />
                          Capital: {country.capital}
                        </p>
                        <p className="text-sm text-gray-600">
                          <Flag className="w-4 h-4 inline mr-1" />
                          Continent: {country.continent}
                        </p>
                      </div>
                    </div>
                    {isVisited && (
                      <Badge className="bg-teal-500 text-white">
                        <Star className="w-4 h-4 mr-1 inline" />
                        Visited
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-700">
                      💡 <strong>Fun Fact:</strong> {country.funFact}
                    </p>
                  </div>

                  <Button
                    className={`w-full ${
                      isVisited
                        ? "bg-gray-400 hover:bg-gray-500"
                        : "bg-teal-500 hover:bg-teal-600"
                    } text-white`}
                    onClick={(e) => {
                      e.stopPropagation();
                      visitCountry(country.id);
                    }}
                  >
                    {isVisited ? "✓ Stamp Collected" : "Get Passport Stamp"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {totalStamps === countries.length && (
          <Card className="mt-8 bg-gradient-to-r from-yellow-100 to-orange-100 border-4 border-yellow-400">
            <CardContent className="text-center py-8">
              <h2 className="text-4xl font-bold text-yellow-700 mb-4">
                🎉 Congratulations! 🎉
              </h2>
              <p className="text-2xl text-gray-700">
                You've traveled the world and collected all stamps!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TravelMap;
