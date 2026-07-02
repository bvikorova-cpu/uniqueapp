import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, X, Upload, Image, Video, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface AddRecipeDialogProps {
  onRecipeAdded?: () => void;
  categories: string[];
}

export function AddRecipeDialog({ onRecipeAdded, categories }: AddRecipeDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    difficulty: "Medium",
    time: "",
    servings: 2,
    calories: 0,
    description: "",
    ingredients: [""],
    instructions: [""],
    tags: [] as string[],
    image_url: "",
    video_url: "",
  });

  const [tagInput, setTagInput] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayItemChange = (field: "ingredients" | "instructions", index: number, value: string) => {
    setFormData((prev) => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayItem = (field: "ingredients" | "instructions") => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayItem = (field: "ingredients" | "instructions", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const uploadFile = async (file: File, type: "image" | "video"): Promise<string | null> => {
    if (!user) return null;

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    setIsUploading(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from("recipe-media")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("recipe-media")
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreviewImage(e.target?.result as string);
    reader.readAsDataURL(file);

    const url = await uploadFile(file, "image");
    if (url) {
      setFormData((prev) => ({ ...prev, image_url: url }));
    }
  };

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Video must be less than 50MB",
        variant: "destructive",
      });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreviewVideo(e.target?.result as string);
    reader.readAsDataURL(file);

    const url = await uploadFile(file, "video");
    if (url) {
      setFormData((prev) => ({ ...prev, video_url: url }));
    }
  };

  const removeImage = () => {
    setPreviewImage(null);
    setFormData((prev) => ({ ...prev, image_url: "" }));
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const removeVideo = () => {
    setPreviewVideo(null);
    setFormData((prev) => ({ ...prev, video_url: "" }));
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const resetForm = () => {
    setFormData({
      title: "",
      category: "",
      difficulty: "Medium",
      time: "",
      servings: 2,
      calories: 0,
      description: "",
      ingredients: [""],
      instructions: [""],
      tags: [],
      image_url: "",
      video_url: "",
    });
    setPreviewImage(null);
    setPreviewVideo(null);
    setTagInput("");
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to add recipes",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title.trim() || !formData.category || !formData.time.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in title, category, and preparation time",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("user_recipes").insert({
        user_id: user.id,
        title: formData.title.trim(),
        category: formData.category,
        difficulty: formData.difficulty,
        time: formData.time.trim(),
        servings: formData.servings,
        calories: formData.calories || null,
        description: formData.description.trim() || null,
        ingredients: formData.ingredients.filter((i) => i.trim()),
        instructions: formData.instructions.filter((i) => i.trim()),
        tags: formData.tags,
        image_url: formData.image_url || null,
        video_url: formData.video_url || null,
        is_public: true,
      });

      if (error) throw error;

      toast({
        title: "Recipe added!",
        description: "Your recipe has been successfully added",
      });

      resetForm();
      setOpen(false);
      onRecipeAdded?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((c) => c !== "All");

  return (
    <>
      <FloatingHowItWorks title="How Add Recipe Dialog works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
          <Plus className="w-4 h-4 mr-2" />
          Add Recipe
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            Add Your Recipe
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="title">Recipe Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Homemade Pasta Carbonara"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(v) => handleInputChange("category", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={formData.difficulty} onValueChange={(v) => handleInputChange("difficulty", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="time">Preparation Time *</Label>
                <Input
                  id="time"
                  placeholder="e.g., 45 min"
                  value={formData.time}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="servings">Servings</Label>
                <Input
                  id="servings"
                  type="number"
                  min={1}
                  value={formData.servings}
                  onChange={(e) => handleInputChange("servings", parseInt(e.target.value) || 1)}
                />
              </div>

              <div>
                <Label htmlFor="calories">Calories (optional)</Label>
                <Input
                  id="calories"
                  type="number"
                  placeholder="e.g., 450"
                  value={formData.calories || ""}
                  onChange={(e) => handleInputChange("calories", parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your recipe..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Media Upload */}
            <div className="space-y-4">
              <Label>Media (Photos & Videos)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image Upload */}
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                  {previewImage ? (
                    <div className="relative">
                      <img src={previewImage} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={removeImage}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="cursor-pointer py-8 hover:bg-muted/50 transition-colors rounded-lg"
                      onClick={() => imageInputRef.current?.click()}
                    >
                      {isUploading ? (
                        <Loader2 className="h-10 w-10 mx-auto text-muted-foreground animate-spin" />
                      ) : (
                        <Image className="h-10 w-10 mx-auto text-muted-foreground" />
                      )}
                      <p className="text-sm text-muted-foreground mt-2">Click to upload image</p>
                      <p className="text-xs text-muted-foreground">Max 10MB</p>
                    </div>
                  )}
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </div>

                {/* Video Upload */}
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                  {previewVideo ? (
                    <div className="relative">
                      <video src={previewVideo} className="w-full h-40 object-cover rounded-lg" controls />
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={removeVideo}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="cursor-pointer py-8 hover:bg-muted/50 transition-colors rounded-lg"
                      onClick={() => videoInputRef.current?.click()}
                    >
                      {isUploading ? (
                        <Loader2 className="h-10 w-10 mx-auto text-muted-foreground animate-spin" />
                      ) : (
                        <Video className="h-10 w-10 mx-auto text-muted-foreground" />
                      )}
                      <p className="text-sm text-muted-foreground mt-2">Click to upload video</p>
                      <p className="text-xs text-muted-foreground">Max 50MB</p>
                    </div>
                  )}
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleVideoSelect}
                  />
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Ingredients</Label>
                <Button type="button" size="sm" variant="outline" onClick={() => addArrayItem("ingredients")}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Ingredient ${index + 1} (e.g., 200g flour)`}
                    value={ingredient}
                    onChange={(e) => handleArrayItemChange("ingredients", index, e.target.value)}
                  />
                  {formData.ingredients.length > 1 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removeArrayItem("ingredients", index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Instructions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Instructions</Label>
                <Button type="button" size="sm" variant="outline" onClick={() => addArrayItem("instructions")}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Step
                </Button>
              </div>
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-shrink-0 w-8 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <Textarea
                    placeholder={`Step ${index + 1}...`}
                    value={instruction}
                    onChange={(e) => handleArrayItemChange("instructions", index, e.target.value)}
                    rows={2}
                    className="flex-1"
                  />
                  {formData.instructions.length > 1 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removeArrayItem("instructions", index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag (e.g., quick, healthy)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || isUploading}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Recipe
                  </>
                )}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
    </>
    );
}
