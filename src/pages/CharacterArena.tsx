import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CharacterCreditsDisplay } from "@/components/character/CharacterCreditsDisplay";
import { CharacterCreator } from "@/components/character/CharacterCreator";
import { CharacterBattleArena } from "@/components/character/CharacterBattleArena";
import { CharacterSocialFeed } from "@/components/character/CharacterSocialFeed";
import { CharacterGallery } from "@/components/character/CharacterGallery";
import { TournamentHub } from "@/components/character/TournamentHub";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CharacterArena = () => {
  return (
    <div className="min-h-screen bg-background p-2 sm:p-4">
      <div className="container mx-auto max-w-7xl pt-20">
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-2">
            ⚔️ Character Creator Arena
          </h1>
          <p className="text-muted-foreground text-sm sm:text-lg px-2">
            Create legendary characters, battle for supremacy, and build your social empire
          </p>
        </div>

        {/* Feature Description */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">What is Character Creator Arena?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm sm:text-base text-muted-foreground">
            <p>
              Character Creator Arena is an AI-powered platform where you can create unique fictional characters with AI-generated backstories and images, then battle them against other players' creations.
            </p>
            
            <div>
              <h4 className="font-semibold text-foreground mb-2">How to Use:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Create:</strong> Design your character with a name, category, and description. Choose Basic (5 credits) or Premium (15 credits) for enhanced AI generation.</li>
                <li><strong>Battle:</strong> Select two characters and watch them fight! Winners gain experience and climb the leaderboard.</li>
                <li><strong>Social:</strong> Share your characters, like others' creations, and build your following in the community.</li>
                <li><strong>Gallery:</strong> Browse all your created characters and view their stats, backstories, and battle records.</li>
                <li><strong>Tournament:</strong> Enter tournaments to compete for prizes and glory against the best characters.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Key Features:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>AI-generated unique backstories and character images</li>
                <li>6 character categories: Superhero, Anime, Fantasy, Sci-Fi, Cartoon, Villain</li>
                <li>Real-time battles with AI-generated commentary</li>
                <li>Experience and leveling system for characters</li>
                <li>Social features: likes, comments, and character sharing</li>
                <li>Tournaments with competitive rankings</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="mb-6">
          <CharacterCreditsDisplay />
        </div>

        <Tabs defaultValue="creator" className="w-full">
          <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 sm:gap-2 h-auto bg-muted p-1 sm:p-2">
            <TabsTrigger value="creator" className="text-xs sm:text-sm">Create 🎨</TabsTrigger>
            <TabsTrigger value="battle" className="text-xs sm:text-sm">Battle ⚔️</TabsTrigger>
            <TabsTrigger value="social" className="text-xs sm:text-sm">Social 📱</TabsTrigger>
            <TabsTrigger value="gallery" className="text-xs sm:text-sm">Gallery 🖼️</TabsTrigger>
            <TabsTrigger value="tournament" className="text-xs sm:text-sm col-span-2 sm:col-span-1">Tournament 🏆</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="creator">
              <CharacterCreator />
            </TabsContent>

            <TabsContent value="battle">
              <CharacterBattleArena />
            </TabsContent>

            <TabsContent value="social">
              <CharacterSocialFeed />
            </TabsContent>

            <TabsContent value="gallery">
              <CharacterGallery />
            </TabsContent>

            <TabsContent value="tournament">
              <TournamentHub />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default CharacterArena;
