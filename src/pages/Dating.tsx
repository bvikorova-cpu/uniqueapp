import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, X, MessageCircle, User, Sparkles, Send, Settings, Trash2, Upload, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DatingProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio: string | null;
  age: number;
  gender: string;
  looking_for: string;
  location: string | null;
  profile_photo_url: string | null;
  additional_photos: string[] | null;
  interests: string[] | null;
}

interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  profile?: DatingProfile;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

const Dating = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<DatingProfile | null>(null);
  const [profiles, setProfiles] = useState<DatingProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    display_name: "",
    age: 18,
    gender: "muž",
    looking_for: "žena",
    bio: "",
    location: "",
  });
  
  const [profileForm, setProfileForm] = useState({
    display_name: "",
    age: 18,
    gender: "muž",
    looking_for: "žena",
    bio: "",
    location: "",
  });

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingAdditional, setUploadingAdditional] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (user) {
      await checkSubscription(user.id);
    }
  };

  const checkSubscription = async (userId: string) => {
    const { data } = await supabase
      .from("dating_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();
    
    if (data) {
      setIsSubscribed(true);
      await loadUserProfile(userId);
      await loadProfiles();
      await loadMatches(userId);
    }
  };

  const loadUserProfile = async (userId: string) => {
    const { data } = await supabase
      .from("dating_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    
    if (data) {
      setCurrentProfile(data);
      setEditForm({
        display_name: data.display_name,
        age: data.age,
        gender: data.gender,
        looking_for: data.looking_for,
        bio: data.bio || "",
        location: data.location || "",
      });
    }
  };

  const loadProfiles = async () => {
    const { data: swipedProfiles } = await supabase
      .from("dating_swipes")
      .select("swiped_id")
      .eq("swiper_id", user?.id || "");

    const swipedIds = swipedProfiles?.map(s => s.swiped_id) || [];

    const { data } = await supabase
      .from("dating_profiles")
      .select("*")
      .eq("is_active", true)
      .neq("user_id", user?.id || "")
      .not("user_id", "in", `(${swipedIds.join(",") || "NULL"})`)
      .limit(20);

    setProfiles(data || []);
  };

  const loadMatches = async (userId: string) => {
    const { data } = await supabase
      .from("dating_matches")
      .select("*")
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    if (data) {
      const matchesWithProfiles = await Promise.all(
        data.map(async (match) => {
          const otherId = match.user1_id === userId ? match.user2_id : match.user1_id;
          const { data: profile } = await supabase
            .from("dating_profiles")
            .select("*")
            .eq("user_id", otherId)
            .single();
          return { ...match, profile };
        })
      );
      setMatches(matchesWithProfiles);
    }
  };

  const loadMessages = async (matchId: string) => {
    const { data } = await supabase
      .from("dating_messages")
      .select("*")
      .eq("match_id", matchId)
      .order("created_at", { ascending: true });

    setMessages(data || []);
  };

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: "Vyžaduje sa prihlásenie",
        description: "Pre prístup sa musíte prihlásiť",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("dating_subscriptions")
      .insert([{
        user_id: user.id,
        price: 2.00,
      }]);

    if (error) {
      toast({
        title: "Chyba",
        description: "Nepodarilo sa aktivovať predplatné",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Úspech",
        description: "Predplatné bolo aktivované",
      });
      setIsSubscribed(true);
      setShowProfileDialog(true);
    }
  };

  const handleCreateProfile = async () => {
    if (!user || !profileForm.display_name || !profileForm.bio) {
      toast({
        title: "Neúplné údaje",
        description: "Vyplňte všetky polia",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("dating_profiles")
      .insert([{
        ...profileForm,
        user_id: user.id,
      }]);

    if (error) {
      toast({
        title: "Chyba",
        description: "Nepodarilo sa vytvoriť profil",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Úspech",
        description: "Profil bol vytvorený",
      });
      setShowProfileDialog(false);
      await loadUserProfile(user.id);
      await loadProfiles();
    }
  };

  const handleSwipe = async (action: "like" | "dislike") => {
    if (!user || currentIndex >= profiles.length) return;

    const currentCard = profiles[currentIndex];

    const { error } = await supabase
      .from("dating_swipes")
      .insert([{
        swiper_id: user.id,
        swiped_id: currentCard.user_id,
        action,
      }]);

    if (error) {
      toast({
        title: "Chyba",
        description: "Nepodarilo sa uložiť swipe",
        variant: "destructive",
      });
      return;
    }

    if (action === "like") {
      // Check if it's a match
      const { data } = await supabase
        .from("dating_matches")
        .select("*")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .or(`user1_id.eq.${currentCard.user_id},user2_id.eq.${currentCard.user_id}`)
        .maybeSingle();

      if (data) {
        toast({
          title: "🎉 It's a Match!",
          description: `Máte zhodu s ${currentCard.display_name}!`,
        });
        await loadMatches(user.id);
      }
    }

    setCurrentIndex(currentIndex + 1);
  };

  const handleSendMessage = async () => {
    if (!selectedMatch || !newMessage.trim()) return;

    const { error } = await supabase
      .from("dating_messages")
      .insert([{
        match_id: selectedMatch.id,
        sender_id: user.id,
        content: newMessage,
      }]);

    if (error) {
      toast({
        title: "Chyba",
        description: "Nepodarilo sa odoslať správu",
        variant: "destructive",
      });
    } else {
      setNewMessage("");
      await loadMessages(selectedMatch.id);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user || !currentProfile || !editForm.display_name || !editForm.bio) {
      toast({
        title: "Neúplné údaje",
        description: "Vyplňte všetky polia",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("dating_profiles")
      .update({
        display_name: editForm.display_name,
        age: editForm.age,
        gender: editForm.gender,
        looking_for: editForm.looking_for,
        bio: editForm.bio,
        location: editForm.location,
      })
      .eq("id", currentProfile.id);

    if (error) {
      toast({
        title: "Chyba",
        description: "Nepodarilo sa aktualizovať profil",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Úspech",
        description: "Profil bol aktualizovaný",
      });
      setShowEditDialog(false);
      await loadUserProfile(user.id);
    }
  };

  const handleDeleteProfile = async () => {
    if (!user || !currentProfile) return;

    const { error } = await supabase
      .from("dating_profiles")
      .delete()
      .eq("id", currentProfile.id)
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Chyba",
        description: "Nepodarilo sa odstrániť profil",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Úspech",
        description: "Profil bol odstránený",
      });
      setCurrentProfile(null);
    }
  };

  const handleUploadProfilePhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !currentProfile) return;

    setUploadingPhoto(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-profile-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('dating_profiles')
        .update({ profile_photo_url: publicUrl })
        .eq('id', currentProfile.id);

      if (updateError) throw updateError;

      toast({
        title: "Úspech",
        description: "Profilová fotka bola nahratá",
      });
      
      await loadUserProfile(user.id);
    } catch (error) {
      toast({
        title: "Chyba",
        description: "Nepodarilo sa nahrať fotku",
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleUploadAdditionalPhotos = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user || !currentProfile) return;

    setUploadingAdditional(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-additional-${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      const currentPhotos = currentProfile.additional_photos || [];
      const newPhotos = [...currentPhotos, ...uploadedUrls];

      const { error: updateError } = await supabase
        .from('dating_profiles')
        .update({ additional_photos: newPhotos })
        .eq('id', currentProfile.id);

      if (updateError) throw updateError;

      toast({
        title: "Úspech",
        description: `${uploadedUrls.length} fotiek bolo nahratých`,
      });
      
      await loadUserProfile(user.id);
    } catch (error) {
      toast({
        title: "Chyba",
        description: "Nepodarilo sa nahrať fotky",
        variant: "destructive",
      });
    } finally {
      setUploadingAdditional(false);
    }
  };

  const handleRemoveAdditionalPhoto = async (photoUrl: string) => {
    if (!user || !currentProfile) return;

    const updatedPhotos = (currentProfile.additional_photos || []).filter(url => url !== photoUrl);

    const { error } = await supabase
      .from('dating_profiles')
      .update({ additional_photos: updatedPhotos })
      .eq('id', currentProfile.id);

    if (error) {
      toast({
        title: "Chyba",
        description: "Nepodarilo sa odstrániť fotku",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Úspech",
        description: "Fotka bola odstránená",
      });
      await loadUserProfile(user.id);
    }
  };

  // Subscription landing page
  if (!isSubscribed) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center space-y-8">
            <Badge className="bg-pink-500 text-white">
              <Heart className="h-4 w-4 mr-1" />
              Zoznamka
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              Nájdite svoju lásku
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Pripojte sa k tisíckam ľudí, ktorí už našli svoju polovičku. Swipujte, matchujte a chatujte!
            </p>

            <Card className="max-w-md mx-auto">
              <CardHeader className="text-center">
                <div className="text-5xl font-bold text-pink-500 mb-2">2 €</div>
                <p className="text-muted-foreground">mesačne</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-pink-500" />
                    <span>Neobmedzené swipovanie</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-pink-500" />
                    <span>Chat s matchmi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-pink-500" />
                    <span>Prémiové filtre</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-pink-500" />
                    <span>Detailné profily</span>
                  </div>
                </div>
                <Button onClick={handleSubscribe} className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                  Začať hľadať
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Profile creation dialog
  if (!currentProfile) {
    return (
      <Dialog open={showProfileDialog || !currentProfile} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Vytvorte si profil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Meno</label>
              <Input
                value={profileForm.display_name}
                onChange={(e) => setProfileForm({ ...profileForm, display_name: e.target.value })}
                placeholder="Vaše meno"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Vek</label>
              <Input
                type="number"
                value={profileForm.age}
                onChange={(e) => setProfileForm({ ...profileForm, age: parseInt(e.target.value) })}
                min={18}
                max={100}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Pohlavie</label>
              <select 
                className="w-full p-2 border rounded bg-background text-foreground"
                value={profileForm.gender}
                onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
              >
                <option value="muž">Muž</option>
                <option value="žena">Žena</option>
                <option value="iné">Iné</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Hľadám</label>
              <select 
                className="w-full p-2 border rounded bg-background text-foreground"
                value={profileForm.looking_for}
                onChange={(e) => setProfileForm({ ...profileForm, looking_for: e.target.value })}
              >
                <option value="muž">Muža</option>
                <option value="žena">Ženu</option>
                <option value="iné">Iné</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">O mne</label>
              <Textarea
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                placeholder="Napíšte niečo o sebe..."
                className="min-h-24"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Lokalita</label>
              <Input
                value={profileForm.location}
                onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                placeholder="Mesto"
              />
            </div>
            <Button onClick={handleCreateProfile} className="w-full">
              Vytvoriť profil
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <Tabs defaultValue="swipe" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto mb-8">
            <TabsTrigger value="swipe">
              <Heart className="h-4 w-4 mr-2" />
              Swipe
            </TabsTrigger>
            <TabsTrigger value="matches">
              <MessageCircle className="h-4 w-4 mr-2" />
              Matche ({matches.length})
            </TabsTrigger>
            <TabsTrigger value="profile">
              <Settings className="h-4 w-4 mr-2" />
              Môj profil
            </TabsTrigger>
          </TabsList>

          {/* Swipe Tab */}
          <TabsContent value="swipe" className="flex justify-center">
            {currentIndex < profiles.length ? (
              <Card className="w-full max-w-sm">
                <CardContent className="p-0">
                  <div 
                    className="aspect-[3/4] bg-gradient-to-br from-pink-100 to-purple-100 rounded-t-lg flex items-center justify-center cursor-pointer"
                    onClick={() => profiles[currentIndex].profile_photo_url && setLightboxImage(profiles[currentIndex].profile_photo_url)}
                  >
                    {profiles[currentIndex].profile_photo_url ? (
                      <img
                        src={profiles[currentIndex].profile_photo_url}
                        alt={profiles[currentIndex].display_name}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    ) : (
                      <User className="h-24 w-24 text-muted-foreground" />
                    )}
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold">
                        {profiles[currentIndex].display_name}, {profiles[currentIndex].age}
                      </h2>
                      {profiles[currentIndex].location && (
                        <p className="text-muted-foreground">{profiles[currentIndex].location}</p>
                      )}
                    </div>
                    {profiles[currentIndex].bio && (
                      <p className="text-sm">{profiles[currentIndex].bio}</p>
                    )}
                    <div className="flex gap-4 justify-center pt-4">
                      <Button
                        variant="outline"
                        size="lg"
                        className="rounded-full w-16 h-16 border-red-500 text-red-500 hover:bg-red-50"
                        onClick={() => handleSwipe("dislike")}
                      >
                        <X className="h-8 w-8" />
                      </Button>
                      <Button
                        size="lg"
                        className="rounded-full w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                        onClick={() => handleSwipe("like")}
                      >
                        <Heart className="h-8 w-8" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="w-full max-w-sm p-12 text-center">
                <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Už ste videli všetkých!</h3>
                <p className="text-muted-foreground">Skontrolujte neskôr nových ľudí</p>
              </Card>
            )}
          </TabsContent>

          {/* Matches Tab */}
          <TabsContent value="matches">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Vaše matche</h3>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-2">
                    {matches.map((match) => (
                      <Card
                        key={match.id}
                        className={`cursor-pointer hover:bg-accent ${
                          selectedMatch?.id === match.id ? "bg-accent" : ""
                        }`}
                        onClick={() => {
                          setSelectedMatch(match);
                          loadMessages(match.id);
                        }}
                      >
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
                            <User className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-semibold">{match.profile?.display_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {match.profile?.age} rokov
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {matches.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        Zatiaľ žiadne matche. Pokračujte v swipovaní!
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {selectedMatch && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold">{selectedMatch.profile?.display_name}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.sender_id === user?.id ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[70%] p-3 rounded-lg ${
                                message.sender_id === user?.id
                                  ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                                  : "bg-secondary"
                              }`}
                            >
                              {message.content}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Napíšte správu..."
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      />
                      <Button onClick={handleSendMessage}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">Môj profil</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowEditDialog(true)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Upraviť
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Odstrániť
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Odstrániť profil?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Táto akcia sa nedá vrátiť späť. Váš profil, všetky matche a správy budú natrvalo vymazané.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Zrušiť</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDeleteProfile}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Odstrániť profil
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-6">
                  <div 
                    className="relative h-32 w-32 rounded-lg bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center flex-shrink-0 group cursor-pointer"
                    onClick={() => currentProfile?.profile_photo_url && setLightboxImage(currentProfile.profile_photo_url)}
                  >
                    {currentProfile?.profile_photo_url ? (
                      <img
                        src={currentProfile.profile_photo_url}
                        alt={currentProfile.display_name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <User className="h-16 w-16 text-muted-foreground" />
                    )}
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Upload className="h-8 w-8 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadProfilePhoto}
                        className="hidden"
                        disabled={uploadingPhoto}
                      />
                    </label>
                  </div>
                  <div className="space-y-3 flex-1">
                    <div>
                      <label className="text-sm text-muted-foreground">Meno</label>
                      <p className="text-lg font-semibold">{currentProfile?.display_name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground">Vek</label>
                        <p className="font-medium">{currentProfile?.age} rokov</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Pohlavie</label>
                        <p className="font-medium capitalize">{currentProfile?.gender}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Hľadám</label>
                      <p className="font-medium capitalize">{currentProfile?.looking_for}</p>
                    </div>
                    {currentProfile?.location && (
                      <div>
                        <label className="text-sm text-muted-foreground">Lokalita</label>
                        <p className="font-medium">{currentProfile.location}</p>
                      </div>
                    )}
                  </div>
                </div>
                {currentProfile?.bio && (
                  <div>
                    <label className="text-sm text-muted-foreground">O mne</label>
                    <p className="mt-2 text-sm whitespace-pre-wrap">{currentProfile.bio}</p>
                  </div>
                )}
                
                {/* Additional Photos Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Ďalšie fotky</label>
                    <label className="cursor-pointer">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={uploadingAdditional}
                        asChild
                      >
                        <span>
                          <ImageIcon className="h-4 w-4 mr-2" />
                          {uploadingAdditional ? "Nahrávam..." : "Pridať fotky"}
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleUploadAdditionalPhotos}
                        className="hidden"
                        disabled={uploadingAdditional}
                      />
                    </label>
                  </div>
                  {currentProfile?.additional_photos && currentProfile.additional_photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {currentProfile.additional_photos.map((photoUrl, index) => (
                        <div key={index} className="relative aspect-square group">
                          <img
                            src={photoUrl}
                            alt={`Additional photo ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setLightboxImage(photoUrl)}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveAdditionalPhoto(photoUrl);
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {(!currentProfile?.additional_photos || currentProfile.additional_photos.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Zatiaľ žiadne ďalšie fotky
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Profile Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upraviť profil</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Meno</label>
                <Input
                  value={editForm.display_name}
                  onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                  placeholder="Vaše meno"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Vek</label>
                <Input
                  type="number"
                  value={editForm.age}
                  onChange={(e) => setEditForm({ ...editForm, age: parseInt(e.target.value) })}
                  min={18}
                  max={100}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Pohlavie</label>
                <select 
                  className="w-full p-2 border rounded bg-background text-foreground"
                  value={editForm.gender}
                  onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                >
                  <option value="muž">Muž</option>
                  <option value="žena">Žena</option>
                  <option value="iné">Iné</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Hľadám</label>
                <select 
                  className="w-full p-2 border rounded bg-background text-foreground"
                  value={editForm.looking_for}
                  onChange={(e) => setEditForm({ ...editForm, looking_for: e.target.value })}
                >
                  <option value="muž">Muža</option>
                  <option value="žena">Ženu</option>
                  <option value="iné">Iné</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">O mne</label>
                <Textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Napíšte niečo o sebe..."
                  className="min-h-24"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Lokalita</label>
                <Input
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  placeholder="Mesto"
                />
              </div>
              <Button onClick={handleUpdateProfile} className="w-full">
                Uložiť zmeny
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Lightbox Dialog */}
        <Dialog open={!!lightboxImage} onOpenChange={() => setLightboxImage(null)}>
          <DialogContent className="max-w-4xl p-0 bg-transparent border-0">
            <div className="relative">
              <img
                src={lightboxImage || ""}
                alt="Náhľad"
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                onClick={() => setLightboxImage(null)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Dating;