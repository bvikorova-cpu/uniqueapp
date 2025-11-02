import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CharacterCreditsDisplay } from "@/components/character/CharacterCreditsDisplay";
import { CharacterCreator } from "@/components/character/CharacterCreator";
import { CharacterBattleArena } from "@/components/character/CharacterBattleArena";
import { CharacterSocialFeed } from "@/components/character/CharacterSocialFeed";
import { CharacterGallery } from "@/components/character/CharacterGallery";
import { TournamentHub } from "@/components/character/TournamentHub";

const CharacterArena = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      <div className="container mx-auto max-w-7xl pt-20">
        <div className="text-center mb-6">
          <h1 className="text-5xl font-bold text-white mb-2">
            ⚔️ Character Creator Arena
          </h1>
          <p className="text-white/80 text-lg">
            Create legendary characters, battle for supremacy, and build your social empire
          </p>
        </div>

        <div className="mb-6">
          <CharacterCreditsDisplay />
        </div>

        <Tabs defaultValue="creator" className="w-full">
          <TabsList className="grid grid-cols-2 lg:grid-cols-5 gap-2 h-auto bg-white/10 p-2">
            <TabsTrigger value="creator">Create 🎨</TabsTrigger>
            <TabsTrigger value="battle">Battle ⚔️</TabsTrigger>
            <TabsTrigger value="social">Social 📱</TabsTrigger>
            <TabsTrigger value="gallery">Gallery 🖼️</TabsTrigger>
            <TabsTrigger value="tournament">Tournament 🏆</TabsTrigger>
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
