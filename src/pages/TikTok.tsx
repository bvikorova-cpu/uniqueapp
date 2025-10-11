import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, MessageCircle, Share2, Upload, UserPlus, UserMinus, Send, Plus, Camera, Video, StopCircle, Bookmark, Eye, Flag, Download, Facebook, Instagram, Mail, Link2, Twitter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Video {
  id: string;
  user_id: string;
  title: string | null;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  likes_count: number;
  comments_count: number;
  views_count: number;
  created_at: string;
}

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface Comment {
  id: string;
  video_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

const TikTok = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [selectedVideoComments, setSelectedVideoComments] = useState<string | null>(null);
  const [comments, setComments] = useState<Map<string, Comment[]>>(new Map());
  const [newComment, setNewComment] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [bookmarkedVideos, setBookmarkedVideos] = useState<Set<string>>(new Set());
  const [savedVideos, setSavedVideos] = useState<Set<string>>(new Set());
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const viewedVideos = useRef<Set<string>>(new Set());
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
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

  useEffect(() => {
    if (user) {
      fetchVideos();
      fetchLikedVideos();
      fetchFollowing();
    }
  }, [user]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          const videoId = video.getAttribute('data-video-id');
          
          if (entry.isIntersecting) {
            video.play().catch(() => {});
            
            // Track view after 3 seconds
            if (videoId && !viewedVideos.current.has(videoId)) {
              setTimeout(async () => {
                if (entry.isIntersecting) {
                  viewedVideos.current.add(videoId);
                  await supabase
                    .from("videos")
                    .update({ views_count: videos.find(v => v.id === videoId)!.views_count + 1 })
                    .eq("id", videoId);
                }
              }, 3000);
            }
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.7 }
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, [videos]);

  const fetchVideos = async () => {
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching videos:", error);
      return;
    }

    setVideos(data || []);
    
    const userIds = [...new Set(data?.map(v => v.user_id) || [])];
    const profilesData = await Promise.all(
      userIds.map(async (userId) => {
        const { data } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .eq("id", userId)
          .maybeSingle();
        return data;
      })
    );

    const profilesMap = new Map();
    profilesData.forEach((profile) => {
      if (profile) profilesMap.set(profile.id, profile);
    });
    setProfiles(profilesMap);
  };

  const fetchLikedVideos = async () => {
    const { data } = await supabase
      .from("video_likes")
      .select("video_id")
      .eq("user_id", user.id);

    setLikedVideos(new Set(data?.map(l => l.video_id) || []));
  };

  const fetchFollowing = async () => {
    const { data } = await supabase
      .from("user_follows")
      .select("following_id")
      .eq("follower_id", user.id);

    setFollowing(new Set(data?.map(f => f.following_id) || []));
  };

  const toggleLike = async (videoId: string) => {
    if (likedVideos.has(videoId)) {
      await supabase
        .from("video_likes")
        .delete()
        .eq("video_id", videoId)
        .eq("user_id", user.id);
      
      setLikedVideos(prev => {
        const newSet = new Set(prev);
        newSet.delete(videoId);
        return newSet;
      });
    } else {
      await supabase
        .from("video_likes")
        .insert({ video_id: videoId, user_id: user.id });
      
      setLikedVideos(prev => new Set([...prev, videoId]));
    }
  };

  const toggleBookmark = (videoId: string) => {
    setBookmarkedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
        toast({ title: "Odstránené zo záložiek" });
      } else {
        newSet.add(videoId);
        toast({ title: "Pridané do záložiek" });
      }
      return newSet;
    });
  };

  const toggleSave = (videoId: string) => {
    setSavedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
        toast({ title: "Odstránené z uložených" });
      } else {
        newSet.add(videoId);
        toast({ title: "Uložené do obľúbených" });
      }
      return newSet;
    });
  };

  const handleReport = (videoId: string) => {
    toast({
      title: "Video nahlásené",
      description: "Ďakujeme za nahlásenie. Skontrolujeme obsah.",
    });
  };

  const handleDownload = async (video: Video) => {
    try {
      const response = await fetch(video.video_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${video.title || 'video'}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({ title: "Video sťahuje sa..." });
    } catch (error) {
      toast({
        title: "Chyba",
        description: "Nepodarilo sa stiahnuť video",
        variant: "destructive",
      });
    }
  };

  const toggleFollow = async (userId: string) => {
    if (following.has(userId)) {
      await supabase
        .from("user_follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", userId);
      
      setFollowing(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    } else {
      await supabase
        .from("user_follows")
        .insert({ follower_id: user.id, following_id: userId });
      
      setFollowing(prev => new Set([...prev, userId]));
    }
  };

  const startRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" }, 
        audio: true 
      });
      
      setStream(mediaStream);
      
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = mediaStream;
        previewVideoRef.current.play();
      }

      const recorder = new MediaRecorder(mediaStream, {
        mimeType: 'video/webm;codecs=vp8,opus'
      });

      const chunks: BlobPart[] = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedBlob(blob);
        
        if (previewVideoRef.current) {
          previewVideoRef.current.srcObject = null;
          previewVideoRef.current.src = URL.createObjectURL(blob);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa spustiť kameru",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
  };

  const handleUpload = async () => {
    const fileToUpload = uploadFile || (recordedBlob ? new File([recordedBlob], `recording-${Date.now()}.webm`, { type: 'video/webm' }) : null);

    if (!fileToUpload) {
      toast({
        title: "Chyba",
        description: "Vyberte video súbor alebo nahrajte video",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Chyba",
        description: "Musíte byť prihlásený",
        variant: "destructive",
      });
      return;
    }

    // Check file size (50MB limit)
    const maxSizeInBytes = 50 * 1024 * 1024;
    if (fileToUpload.size > maxSizeInBytes) {
      const fileSizeInMB = (fileToUpload.size / (1024 * 1024)).toFixed(2);
      toast({
        title: "Video je príliš veľké",
        description: `Súbor má ${fileSizeInMB}MB. Max. 50MB. Prosím zvýšte limit v Supabase Storage Settings.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const fileExt = fileToUpload.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("videos")
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        toast({
          title: "Chyba pri nahrávaní",
          description: uploadError.message || "Nepodarilo sa nahrať video do storage",
          variant: "destructive",
        });
        return;
      }

      console.log("File uploaded successfully, getting public URL");

      const { data: { publicUrl } } = supabase.storage
        .from("videos")
        .getPublicUrl(filePath);

      console.log("Public URL:", publicUrl);

      const videoData = {
        user_id: user.id,
        title: uploadTitle || "Bez názvu",
        description: uploadDescription || null,
        video_url: publicUrl,
      };

      console.log("Inserting to database:", videoData);

      const { data: dbData, error: dbError } = await supabase
        .from("videos")
        .insert(videoData)
        .select();

      console.log("Database insert response:", { dbData, dbError });

      if (dbError) {
        console.error("Database insert error:", dbError);
        toast({
          title: "Chyba pri ukladaní",
          description: dbError.message || "Nepodarilo sa uložiť video do databázy",
          variant: "destructive",
        });
        return;
      }

      console.log("Video saved to database successfully");

      toast({
        title: "Úspech",
        description: "Video bolo úspešne nahrané",
      });

      setUploadDialogOpen(false);
      setUploadFile(null);
      setUploadTitle("");
      setUploadDescription("");
      setRecordedBlob(null);
      fetchVideos();
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Chyba",
        description: error instanceof Error ? error.message : "Neočakávaná chyba pri nahrávaní",
        variant: "destructive",
      });
    }
  };

  const togglePlayPause = (index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const fetchComments = async (videoId: string) => {
    const { data } = await supabase
      .from("video_comments")
      .select("*")
      .eq("video_id", videoId)
      .order("created_at", { ascending: false });

    if (data) {
      setComments(prev => new Map(prev).set(videoId, data));
    }
  };

  const addComment = async (videoId: string) => {
    if (!newComment.trim()) return;

    const { error } = await supabase
      .from("video_comments")
      .insert({
        video_id: videoId,
        user_id: user.id,
        content: newComment.trim(),
      });

    if (!error) {
      setNewComment("");
      fetchComments(videoId);
      fetchVideos();
      toast({
        title: "Komentár pridaný",
      });
    }
  };

  const shareToFacebook = (video: Video) => {
    const shareUrl = `${window.location.origin}/tiktok?video=${video.id}`;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareToTwitter = (video: Video) => {
    const shareUrl = `${window.location.origin}/tiktok?video=${video.id}`;
    const text = video.title || "Pozri si toto video!";
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareToEmail = (video: Video) => {
    const shareUrl = `${window.location.origin}/tiktok?video=${video.id}`;
    const subject = video.title || "Pozri si toto video!";
    const body = `${video.description || ""}\n\n${shareUrl}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const copyLink = async (video: Video) => {
    const shareUrl = `${window.location.origin}/tiktok?video=${video.id}`;
    await navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Odkaz skopírovaný",
      description: "Odkaz bol skopírovaný do schránky",
    });
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Kruhové tlačidlo pre nahratie videa - dolná časť v strede */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50">
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              size="icon"
              className="h-16 w-16 rounded-full shadow-elegant bg-primary hover:bg-primary/90 hover:scale-110 transition-all duration-300"
            >
              <Plus className="h-8 w-8" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nahrať nové video</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">
                  <Upload className="h-4 w-4 mr-2" />
                  Nahrať súbor
                </TabsTrigger>
                <TabsTrigger value="record">
                  <Camera className="h-4 w-4 mr-2" />
                  Nahrávať online
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload" className="space-y-4">
                <div>
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Názov videa"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Popis videa"
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button onClick={handleUpload} className="w-full" disabled={!uploadFile}>
                  Nahrať
                </Button>
              </TabsContent>
              
              <TabsContent value="record" className="space-y-4">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    ref={previewVideoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                  />
                </div>
                
                <div className="flex gap-2 justify-center">
                  {!isRecording && !recordedBlob && (
                    <Button onClick={startRecording} className="flex-1">
                      <Video className="h-4 w-4 mr-2" />
                      Spustiť nahrávanie
                    </Button>
                  )}
                  
                  {isRecording && (
                    <Button onClick={stopRecording} variant="destructive" className="flex-1">
                      <StopCircle className="h-4 w-4 mr-2" />
                      Zastaviť nahrávanie
                    </Button>
                  )}
                  
                  {recordedBlob && (
                    <Button 
                      onClick={() => {
                        setRecordedBlob(null);
                        if (previewVideoRef.current) {
                          previewVideoRef.current.src = '';
                        }
                      }} 
                      variant="outline"
                    >
                      Nahrať znova
                    </Button>
                  )}
                </div>
                
                {recordedBlob && (
                  <>
                    <div>
                      <Input
                        placeholder="Názov videa"
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <Textarea
                        placeholder="Popis videa"
                        value={uploadDescription}
                        onChange={(e) => setUploadDescription(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <Button onClick={handleUpload} className="w-full">
                      Nahrať video
                    </Button>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <div className="h-[calc(100vh-4rem)] overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
        {videos.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Upload className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Zatiaľ nie sú žiadne videá. Buď prvý kto niečo nahrá!</p>
            </div>
          </div>
        ) : (
          videos.map((video, index) => {
            const profile = profiles.get(video.user_id);
            const isLiked = likedVideos.has(video.id);
            const isFollowing = following.has(video.user_id);

            return (
              <div
                key={video.id}
                className="h-[calc(100vh-4rem)] snap-start relative bg-black"
              >
                <video
                  ref={(el) => (videoRefs.current[index] = el)}
                  src={video.video_url}
                  data-video-id={video.id}
                  className="w-full h-full object-contain"
                  loop
                  playsInline
                  onClick={() => togglePlayPause(index)}
                />

                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 pointer-events-none" />

                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <div className="flex items-start gap-3 mb-2">
                    <Avatar className="h-12 w-12 border-2 border-white">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback>{profile?.full_name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{profile?.full_name || "Používateľ"}</p>
                      {video.description && (
                        <p className="text-sm opacity-90 mt-1">{video.description}</p>
                      )}
                    </div>
                    {video.user_id !== user?.id && (
                      <Button
                        size="sm"
                        variant={isFollowing ? "secondary" : "default"}
                        onClick={() => toggleFollow(video.user_id)}
                        className="rounded-full"
                      >
                        {isFollowing ? (
                          <UserMinus className="h-4 w-4" />
                        ) : (
                          <UserPlus className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="absolute right-4 bottom-20 flex flex-col gap-6">
                  <button
                    onClick={() => toggleLike(video.id)}
                    className="flex flex-col items-center gap-1 text-white transition-transform hover:scale-110"
                  >
                    <div className={`p-3 rounded-full bg-black/30 backdrop-blur-sm transition-all ${isLiked ? 'scale-110' : ''}`}>
                      <Heart
                        className={`h-7 w-7 transition-all ${isLiked ? 'fill-red-500 text-red-500' : ''}`}
                      />
                    </div>
                    <span className="text-sm font-semibold">{video.likes_count}</span>
                  </button>

                  <Sheet>
                    <SheetTrigger asChild>
                      <button 
                        onClick={() => {
                          setSelectedVideoComments(video.id);
                          fetchComments(video.id);
                        }}
                        className="flex flex-col items-center gap-1 text-white transition-transform hover:scale-110"
                      >
                        <div className="p-3 rounded-full bg-black/30 backdrop-blur-sm">
                          <MessageCircle className="h-7 w-7" />
                        </div>
                        <span className="text-sm font-semibold">{video.comments_count}</span>
                      </button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[70vh]">
                      <SheetHeader>
                        <SheetTitle>Komentáre ({video.comments_count})</SheetTitle>
                      </SheetHeader>
                      <ScrollArea className="h-[calc(70vh-140px)] mt-4">
                        <div className="space-y-4 pr-4">
                          {(comments.get(video.id) || []).map((comment) => {
                            const commentProfile = profiles.get(comment.user_id);
                            return (
                              <div key={comment.id} className="flex gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={commentProfile?.avatar_url || undefined} />
                                  <AvatarFallback>{commentProfile?.full_name?.[0] || "U"}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold">{commentProfile?.full_name || "Používateľ"}</p>
                                  <p className="text-sm text-muted-foreground">{comment.content}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                      <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                        <Input
                          placeholder="Napíš komentár..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addComment(video.id)}
                        />
                        <Button onClick={() => addComment(video.id)} size="icon">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </SheetContent>
                  </Sheet>

                  <Sheet>
                    <SheetTrigger asChild>
                      <button className="flex flex-col items-center gap-1 text-white transition-transform hover:scale-110">
                        <div className="p-3 rounded-full bg-black/30 backdrop-blur-sm">
                          <Share2 className="h-7 w-7" />
                        </div>
                        <span className="text-xs font-semibold">Zdieľať</span>
                      </button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-auto">
                      <SheetHeader>
                        <SheetTitle>Zdieľať video</SheetTitle>
                      </SheetHeader>
                      <div className="grid grid-cols-2 gap-4 mt-6 pb-6">
                        <Button
                          variant="outline"
                          className="flex flex-col gap-2 h-24"
                          onClick={() => shareToFacebook(video)}
                        >
                          <Facebook className="h-8 w-8 text-blue-600" />
                          <span className="text-sm">Facebook</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="flex flex-col gap-2 h-24"
                          onClick={() => shareToTwitter(video)}
                        >
                          <Twitter className="h-8 w-8 text-sky-500" />
                          <span className="text-sm">Twitter</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="flex flex-col gap-2 h-24"
                          onClick={() => shareToEmail(video)}
                        >
                          <Mail className="h-8 w-8 text-red-500" />
                          <span className="text-sm">Email</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="flex flex-col gap-2 h-24"
                          onClick={() => copyLink(video)}
                        >
                          <Link2 className="h-8 w-8 text-green-600" />
                          <span className="text-sm">Kopírovať odkaz</span>
                        </Button>
                      </div>
                    </SheetContent>
                  </Sheet>

                  <button
                    onClick={() => toggleBookmark(video.id)}
                    className="flex flex-col items-center gap-1 text-white transition-transform hover:scale-110"
                  >
                    <div className={`p-3 rounded-full bg-black/30 backdrop-blur-sm transition-all ${bookmarkedVideos.has(video.id) ? 'scale-110' : ''}`}>
                      <Bookmark
                        className={`h-7 w-7 transition-all ${bookmarkedVideos.has(video.id) ? 'fill-yellow-500 text-yellow-500' : ''}`}
                      />
                    </div>
                    <span className="text-xs font-semibold">Záložka</span>
                  </button>

                  <button
                    onClick={() => toggleSave(video.id)}
                    className="flex flex-col items-center gap-1 text-white transition-transform hover:scale-110"
                  >
                    <div className={`p-3 rounded-full bg-black/30 backdrop-blur-sm transition-all ${savedVideos.has(video.id) ? 'scale-110' : ''}`}>
                      <Heart
                        className={`h-7 w-7 transition-all ${savedVideos.has(video.id) ? 'fill-pink-500 text-pink-500' : ''}`}
                      />
                    </div>
                    <span className="text-xs font-semibold">Uložiť</span>
                  </button>

                  <button
                    onClick={() => handleDownload(video)}
                    className="flex flex-col items-center gap-1 text-white transition-transform hover:scale-110"
                  >
                    <div className="p-3 rounded-full bg-black/30 backdrop-blur-sm">
                      <Download className="h-7 w-7" />
                    </div>
                    <span className="text-xs font-semibold">Stiahnuť</span>
                  </button>

                  <div className="flex flex-col items-center gap-1 text-white">
                    <div className="p-3 rounded-full bg-black/30 backdrop-blur-sm">
                      <Eye className="h-7 w-7" />
                    </div>
                    <span className="text-xs font-semibold">{video.views_count}</span>
                  </div>

                  <button
                    onClick={() => handleReport(video.id)}
                    className="flex flex-col items-center gap-1 text-white transition-transform hover:scale-110"
                  >
                    <div className="p-3 rounded-full bg-black/30 backdrop-blur-sm">
                      <Flag className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-semibold">Nahlásiť</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TikTok;
