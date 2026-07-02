import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Plus, Search, Shield, Crown, MessageCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { userId: string; }

export default function CollectorGuilds({ userId }: Props) {
  const [guildName, setGuildName] = useState("");
  const [guildDesc, setGuildDesc] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: guilds, isLoading } = useQuery({
    queryKey: ["collector-guilds"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_feed")
        .select("*")
        .eq("activity_type", "guild_created")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data?.map((g: any) => ({
        id: g.id,
        name: (g.metadata as any)?.name || "Unknown Guild",
        description: (g.metadata as any)?.description || "",
        creatorId: g.user_id,
        members: (g.metadata as any)?.members || 1,
        isOwner: g.user_id === userId,
      })) || [];
    },
  });

  const createGuild = useMutation({
    mutationFn: async () => {
      if (!guildName.trim()) throw new Error("Guild name required");
      const { error } = await supabase.from("activity_feed").insert({
        user_id: userId,
        activity_type: "guild_created",
        metadata: { name: guildName, description: guildDesc, members: 1 },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collector-guilds"] });
      setGuildName("");
      setGuildDesc("");
      toast.success("Guild created successfully!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const joinGuild = useMutation({
    mutationFn: async (guildId: string) => {
      const { error } = await supabase.from("activity_feed").insert({
        user_id: userId,
        activity_type: "guild_joined",
        target_id: guildId,
        target_type: "guild",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Joined guild!");
      queryClient.invalidateQueries({ queryKey: ["collector-guilds"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = guilds?.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <>
      <FloatingHowItWorks title={"Collector Guilds - How it works"} steps={[{ title: 'Open', desc: 'Access the Collector Guilds section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Collector Guilds.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-sky-500/10 to-blue-500/10 border-sky-500/20">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-8 w-8 text-sky-400" />
          <div>
            <h2 className="text-2xl font-bold">Collector Guilds</h2>
            <p className="text-sm text-muted-foreground">Join community groups for exclusive trading perks and events</p>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="browse" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse" className="gap-2 text-xs sm:text-sm"><Search className="h-3 w-3 sm:h-4 sm:w-4" /> Browse</TabsTrigger>
          <TabsTrigger value="my-guilds" className="gap-2 text-xs sm:text-sm"><Users className="h-3 w-3 sm:h-4 sm:w-4" /> My Guilds</TabsTrigger>
          <TabsTrigger value="create" className="gap-2 text-xs sm:text-sm"><Plus className="h-3 w-3 sm:h-4 sm:w-4" /> Create</TabsTrigger>
        </TabsList>

        <TabsContent value="browse">
          <div className="space-y-4">
            <Input placeholder="Search guilds..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Loading guilds...</p>
            ) : filtered && filtered.length > 0 ? (
              <div className="space-y-3">
                {filtered.map(guild => (
                  <Card key={guild.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold">{guild.name}</h3>
                          {guild.isOwner && <Badge variant="secondary" className="text-[10px]">Owner</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{guild.description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-[10px]"><Users className="h-3 w-3 mr-1" /> {guild.members} members</Badge>
                        </div>
                      </div>
                      {!guild.isOwner && (
                        <Button size="sm" onClick={() => joinGuild.mutate(guild.id)} disabled={joinGuild.isPending}>
                          Join
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No guilds found. Create the first one!</p>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="my-guilds">
          <Card className="p-8 text-center">
            <Crown className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">
              {guilds?.some(g => g.isOwner) ? "You own guilds — check Browse tab" : "You haven't joined any guilds yet"}
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-lg">Create a Guild</h3>
            <Input placeholder="Guild name" value={guildName} onChange={e => setGuildName(e.target.value)} />
            <Textarea placeholder="Guild description (goals, trading focus, etc.)" value={guildDesc} onChange={e => setGuildDesc(e.target.value)} rows={3} />
            <Button onClick={() => createGuild.mutate()} disabled={!guildName.trim() || createGuild.isPending} className="w-full">
              Create Guild
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </>
  );
}
