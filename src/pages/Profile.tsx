import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Mail, ArrowLeft, MapPin, Phone, Globe, Briefcase, Building2, Calendar, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PostCard from "@/components/feed/PostCard";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  bio: string | null;
  location: string | null;
  birth_date: string | null;
  phone: string | null;
  website: string | null;
  interests: string[] | null;
  occupation: string | null;
  company: string | null;
}

interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  media: Array<{
    id: string;
    file_url: string;
    file_type: string;
  }>;
  profiles: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUserId(session?.user?.id || null);
    });
  }, []);

  useEffect(() => {
    const fetchProfileAndPosts = async () => {
      if (!userId) return;

      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch user's posts
        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select(`
            *,
            media (*)
          `)
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (postsError) throw postsError;
        
        // Add profiles data to posts
        const postsWithProfiles = (postsData || []).map(post => ({
          ...post,
          profiles: {
            id: profileData.id,
            full_name: profileData.full_name,
            avatar_url: profileData.avatar_url
          }
        }));
        
        setPosts(postsWithProfiles);
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

    fetchProfileAndPosts();
  }, [userId, toast]);

  const handleRefresh = async () => {
    if (!userId || !profile) return;
    
    const { data: postsData } = await supabase
      .from("posts")
      .select(`
        *,
        media (*)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    // Add profiles data to posts
    const postsWithProfiles = (postsData || []).map(post => ({
      ...post,
      profiles: {
        id: profile.id,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url
      }
    }));
    
    setPosts(postsWithProfiles);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Profil nenájdený</p>
          <Button onClick={() => navigate("/feed")}>
            Späť na Feed
          </Button>
        </Card>
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

        <Card className="p-6 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-3xl">
                {profile.full_name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold">
                  {profile.full_name || "Bez mena"}
                </h1>
                {currentUserId === userId && (
                  <Button variant="outline" size="sm" onClick={() => navigate("/edit-profile")}>
                    <Edit className="h-4 w-4 mr-2" />
                    Upraviť profil
                  </Button>
                )}
              </div>
              
              {profile.occupation && (
                <p className="text-lg text-muted-foreground mb-1">
                  {profile.occupation}
                  {profile.company && ` @ ${profile.company}`}
                </p>
              )}

              {profile.bio && (
                <p className="text-muted-foreground mt-3">{profile.bio}</p>
              )}
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{profile.email}</span>
              </div>
            )}

            {profile.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{profile.location}</span>
              </div>
            )}

            {profile.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{profile.phone}</span>
              </div>
            )}

            {profile.website && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {profile.website}
                </a>
              </div>
            )}

            {profile.birth_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(profile.birth_date).toLocaleDateString("sk-SK")}</span>
              </div>
            )}
          </div>

          {profile.interests && profile.interests.length > 0 && (
            <>
              <Separator className="my-4" />
              <div>
                <h3 className="text-sm font-semibold mb-2">Záujmy</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <Badge key={interest} variant="secondary">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </Card>

        <h2 className="text-xl font-semibold mb-4">Príspevky</h2>
        
        <div className="space-y-4">
          {posts.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              Tento používateľ zatiaľ nemá žiadne príspevky
            </Card>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={handleRefresh}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
