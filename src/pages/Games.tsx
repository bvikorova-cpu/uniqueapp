import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gamepad2, Trophy, Star } from "lucide-react";
import { CandyCrush } from "@/components/games/CandyCrush";
import { BarbieGame } from "@/components/games/BarbieGame";
import { MinecraftGame } from "@/components/games/MinecraftGame";
import { StarTrekGame } from "@/components/games/StarTrekGame";
import { CSIGame } from "@/components/games/CSIGame";
import { AngryBirdsGame } from "@/components/games/AngryBirdsGame";
import { FashionDesignerGame } from "@/components/games/FashionDesignerGame";
import { DreamhouseGame } from "@/components/games/DreamhouseGame";

const Games = () => {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  if (activeGame === "candy") {
    return <CandyCrush onBack={() => setActiveGame(null)} />;
  }

  if (activeGame === "barbie") {
    return <BarbieGame onBack={() => setActiveGame(null)} />;
  }

  if (activeGame === "minecraft") {
    return <MinecraftGame onBack={() => setActiveGame(null)} />;
  }

  if (activeGame === "startrek") {
    return <StarTrekGame onBack={() => setActiveGame(null)} />;
  }

  if (activeGame === "csi") {
    return <CSIGame onBack={() => setActiveGame(null)} />;
  }

  if (activeGame === "angrybirds") {
    return <AngryBirdsGame onBack={() => setActiveGame(null)} />;
  }

  if (activeGame === "fashion") {
    return <FashionDesignerGame onBack={() => setActiveGame(null)} />;
  }

  if (activeGame === "dreamhouse") {
    return <DreamhouseGame onBack={() => setActiveGame(null)} />;
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Online Hry
          </h1>
          <p className="text-muted-foreground text-lg">
            Vyber si svoju obľúbenú hru a hraj zadarmo!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Candy Crush Card */}
          <Card className="hover:shadow-elegant transition-all cursor-pointer group" onClick={() => setActiveGame("candy")}>
            <CardHeader>
              <div className="h-40 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                <div className="grid grid-cols-3 gap-2">
                  {["🍬", "🍭", "🍫"].map((candy, i) => (
                    <div key={i} className="text-4xl animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
                      {candy}
                    </div>
                  ))}
                </div>
              </div>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Candy Crush
              </CardTitle>
              <CardDescription>
                Klasická 3-match hra s farebnými cukríkmi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-muted-foreground">20 úrovní</span>
                </div>
              </div>
              <Button className="w-full" variant="default">
                <Gamepad2 className="h-4 w-4 mr-2" />
                Hrať
              </Button>
            </CardContent>
          </Card>

          {/* Barbie Card */}
          <Card className="hover:shadow-elegant transition-all cursor-pointer group" onClick={() => setActiveGame("barbie")}>
            <CardHeader>
              <div className="h-40 bg-gradient-to-br from-pink-400 to-rose-400 rounded-lg mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                <div className="text-6xl">👗</div>
              </div>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-pink-500" />
                Barbie Summer Nails
              </CardTitle>
              <CardDescription>
                Umelecký dizajn nechtov na leto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-muted-foreground">15 úrovní</span>
                </div>
              </div>
              <Button className="w-full" variant="default">
                <Gamepad2 className="h-4 w-4 mr-2" />
                Hrať
              </Button>
            </CardContent>
          </Card>

          {/* Minecraft Card */}
          <Card className="hover:shadow-elegant transition-all cursor-pointer group" onClick={() => setActiveGame("minecraft")}>
            <CardHeader>
              <div className="h-40 bg-gradient-to-br from-green-600 to-emerald-700 rounded-lg mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                <div className="grid grid-cols-3 gap-1">
                  {["🟫", "🟩", "⬛"].map((block, i) => (
                    <div key={i} className="text-3xl">
                      {block}
                    </div>
                  ))}
                </div>
              </div>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-emerald-500" />
                Mini Minecraft
              </CardTitle>
              <CardDescription>
                Postav svoj svet z kociek
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-muted-foreground">10 úrovní</span>
                </div>
              </div>
              <Button className="w-full" variant="default">
                <Gamepad2 className="h-4 w-4 mr-2" />
                Hrať
              </Button>
            </CardContent>
          </Card>

          {/* Star Trek Card */}
          <Card className="hover:shadow-elegant transition-all cursor-pointer group" onClick={() => setActiveGame("startrek")}>
            <CardHeader>
              <div className="h-40 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-lg mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                <div className="text-6xl">🚀</div>
              </div>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-purple-500" />
                Star Trek
              </CardTitle>
              <CardDescription>
                Vesmírne misie a bitky s nepriateľmi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-muted-foreground">10 úrovní</span>
                </div>
              </div>
              <Button className="w-full" variant="default">
                <Gamepad2 className="h-4 w-4 mr-2" />
                Hrať
              </Button>
            </CardContent>
          </Card>

          {/* CSI Card */}
          <Card className="hover:shadow-elegant transition-all cursor-pointer group" onClick={() => setActiveGame("csi")}>
            <CardHeader>
              <div className="h-40 bg-gradient-to-br from-slate-700 to-blue-800 rounded-lg mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                <div className="text-6xl">🔍</div>
              </div>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-blue-500" />
                CSI Detektív
              </CardTitle>
              <CardDescription>
                Vyšetruj prípady a hľadaj stopy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-muted-foreground">10 úrovní</span>
                </div>
              </div>
              <Button className="w-full" variant="default">
                <Gamepad2 className="h-4 w-4 mr-2" />
                Hrať
              </Button>
            </CardContent>
          </Card>

          {/* Angry Birds Card */}
          <Card className="hover:shadow-elegant transition-all cursor-pointer group" onClick={() => setActiveGame("angrybirds")}>
            <CardHeader>
              <div className="h-40 bg-gradient-to-br from-sky-400 to-cyan-600 rounded-lg mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                <div className="flex gap-2">
                  <div className="text-5xl">🐦</div>
                  <div className="text-5xl">🐷</div>
                </div>
              </div>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-red-500" />
                Angry Birds
              </CardTitle>
              <CardDescription>
                Odpaľuj vtáky na prasiatka a ich stavby
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-muted-foreground">10 úrovní</span>
                </div>
              </div>
              <Button className="w-full" variant="default">
                <Gamepad2 className="h-4 w-4 mr-2" />
                Hrať
              </Button>
            </CardContent>
          </Card>

          {/* Fashion Designer Card */}
          <Card className="hover:shadow-elegant transition-all cursor-pointer group" onClick={() => setActiveGame("fashion")}>
            <CardHeader>
              <div className="h-40 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                <div className="text-6xl">👗</div>
              </div>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-purple-500" />
                Fashion Designer Gala
              </CardTitle>
              <CardDescription>
                Navrhuj večerné šaty a vytvor módne kolekcie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-muted-foreground">Neobmedzené dizajny</span>
                </div>
              </div>
              <Button className="w-full" variant="default">
                <Gamepad2 className="h-4 w-4 mr-2" />
                Hrať
              </Button>
            </CardContent>
          </Card>

          {/* Barbie Dreamhouse Card */}
          <Card className="hover:shadow-elegant transition-all cursor-pointer group" onClick={() => setActiveGame("dreamhouse")}>
            <CardHeader>
              <div className="h-40 bg-gradient-to-br from-pink-300 to-purple-400 rounded-lg mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                <div className="text-6xl">🏠</div>
              </div>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-pink-500" />
                Barbie Dreamhouse
              </CardTitle>
              <CardDescription>
                Dobrodružstvá v Barbieinom dome snov
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-muted-foreground">18 aktivít</span>
                </div>
              </div>
              <Button className="w-full" variant="default">
                <Gamepad2 className="h-4 w-4 mr-2" />
                Hrať
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Games;
