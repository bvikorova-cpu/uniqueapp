import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload, Sparkles, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProfileData {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  birth_date: string | null;
  phone: string | null;
  website: string | null;
  interests: string[] | null;
  occupation: string | null;
  company: string | null;
}

const EditProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingAvatar, setGeneratingAvatar] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    id: "",
    full_name: "",
    email: "",
    avatar_url: "",
    bio: "",
    location: "",
    birth_date: "",
    phone: "",
    website: "",
    interests: [],
    occupation: "",
    company: "",
  });
  const [newInterest, setNewInterest] = useState("");
  const [avatarDescription, setAvatarDescription] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          navigate("/auth");
        } else {
          setUser(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      setProfile({
        id: data.id,
        full_name: data.full_name || "",
        email: data.email || "",
        avatar_url: data.avatar_url || "",
        bio: data.bio || "",
        location: data.location || "",
        birth_date: data.birth_date || "",
        phone: data.phone || "",
        website: data.website || "",
        interests: data.interests || [],
        occupation: data.occupation || "",
        company: data.company || "",
      });
    } catch (error: any) {
      toast({
        title: "Chyba pri načítaní profilu",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          bio: profile.bio,
          location: profile.location,
          birth_date: profile.birth_date || null,
          phone: profile.phone,
          website: profile.website,
          interests: profile.interests,
          occupation: profile.occupation,
          company: profile.company,
          avatar_url: profile.avatar_url,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profil uložený",
        description: "Váš profil bol úspešne aktualizovaný",
      });

      navigate("/feed");
    } catch (error: any) {
      toast({
        title: "Chyba pri ukladaní profilu",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;

    const file = e.target.files[0];
    setUploadingImage(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      setProfile({ ...profile, avatar_url: publicUrl });

      toast({
        title: "Fotka nahraná",
        description: "Vaša profilová fotka bola úspešne nahraná",
      });
    } catch (error: any) {
      toast({
        title: "Chyba pri nahrávaní fotky",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleGenerateAvatar = async () => {
    if (!avatarDescription.trim()) {
      toast({
        title: "Chýba popis",
        description: "Prosím zadajte popis pre AI avatar",
        variant: "destructive",
      });
      return;
    }

    setGeneratingAvatar(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-avatar", {
        body: { description: avatarDescription },
      });

      if (error) throw error;

      if (data.imageUrl) {
        // Convert base64 to blob and upload
        const base64Response = await fetch(data.imageUrl);
        const blob = await base64Response.blob();
        
        const fileName = `${user!.id}/${Date.now()}.png`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, blob, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);

        setProfile({ ...profile, avatar_url: publicUrl });
        setAvatarDescription("");

        toast({
          title: "AI avatar vytvorený",
          description: "Váš AI avatar bol úspešne vygenerovaný",
        });
      }
    } catch (error: any) {
      toast({
        title: "Chyba pri generovaní avatara",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGeneratingAvatar(false);
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !profile.interests?.includes(newInterest.trim())) {
      setProfile({
        ...profile,
        interests: [...(profile.interests || []), newInterest.trim()],
      });
      setNewInterest("");
    }
  };

  const removeInterest = (interest: string) => {
    setProfile({
      ...profile,
      interests: profile.interests?.filter((i) => i !== interest) || [],
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/feed")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Späť
        </Button>

        <h1 className="text-4xl font-bold mb-8 bg-gradient-primary bg-clip-text text-transparent">
          Upraviť profil
        </h1>

        <Card className="p-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-32 w-32">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-4xl">
                {profile.full_name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex gap-2">
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <Button variant="outline" disabled={uploadingImage} asChild>
                  <span>
                    {uploadingImage ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Nahrať fotku
                  </span>
                </Button>
              </Label>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* AI Avatar Generation */}
            <div className="w-full space-y-2">
              <Label>Alebo vygenerujte AI avatar</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Opíšte ako má avatar vyzerať..."
                  value={avatarDescription}
                  onChange={(e) => setAvatarDescription(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleGenerateAvatar()}
                />
                <Button
                  onClick={handleGenerateAvatar}
                  disabled={generatingAvatar || !avatarDescription.trim()}
                >
                  {generatingAvatar ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">Celé meno</Label>
              <Input
                id="full_name"
                value={profile.full_name || ""}
                onChange={(e) =>
                  setProfile({ ...profile, full_name: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email || ""}
                disabled
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="bio">O mne</Label>
              <Textarea
                id="bio"
                rows={4}
                placeholder="Napíšte niečo o sebe..."
                value={profile.bio || ""}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="occupation">Povolanie</Label>
              <Input
                id="occupation"
                placeholder="Napr. Vývojár softvéru"
                value={profile.occupation || ""}
                onChange={(e) =>
                  setProfile({ ...profile, occupation: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="company">Spoločnosť</Label>
              <Input
                id="company"
                placeholder="Napr. Google"
                value={profile.company || ""}
                onChange={(e) =>
                  setProfile({ ...profile, company: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="location">Lokalita</Label>
              <Input
                id="location"
                placeholder="Napr. Bratislava, Slovensko"
                value={profile.location || ""}
                onChange={(e) =>
                  setProfile({ ...profile, location: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="birth_date">Dátum narodenia</Label>
              <Input
                id="birth_date"
                type="date"
                value={profile.birth_date || ""}
                onChange={(e) =>
                  setProfile({ ...profile, birth_date: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefón</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+421 XXX XXX XXX"
                value={profile.phone || ""}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="website">Webová stránka</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://example.com"
                value={profile.website || ""}
                onChange={(e) =>
                  setProfile({ ...profile, website: e.target.value })
                }
              />
            </div>

            {/* Interests */}
            <div>
              <Label htmlFor="interests">Záujmy</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  id="interests"
                  placeholder="Pridať záujem..."
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addInterest()}
                />
                <Button onClick={addInterest} variant="outline">
                  Pridať
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.interests?.map((interest) => (
                  <Badge
                    key={interest}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeInterest(interest)}
                  >
                    {interest} ×
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Uložiť zmeny
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/feed")}
            >
              Zrušiť
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EditProfile;
