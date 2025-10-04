import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, Plus, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface AddRecipeFormProps {
  onSuccess: () => void;
}

export const AddRecipeForm = ({ onSuccess }: AddRecipeFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "",
    time: "",
    servings: "",
    calories: "",
    ingredients: [""],
    instructions: [""],
    tags: "",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const addIngredient = () => {
    setFormData({ ...formData, ingredients: [...formData.ingredients, ""] });
  };

  const removeIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index),
    });
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const addInstruction = () => {
    setFormData({ ...formData, instructions: [...formData.instructions, ""] });
  };

  const removeInstruction = (index: number) => {
    setFormData({
      ...formData,
      instructions: formData.instructions.filter((_, i) => i !== index),
    });
  };

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData({ ...formData, instructions: newInstructions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Musíte byť prihlásený");
        return;
      }

      let imageUrl = "";
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("media")
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("media")
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      const { error } = await supabase.from("recipes").insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        difficulty: formData.difficulty,
        time: formData.time,
        servings: parseInt(formData.servings),
        calories: parseInt(formData.calories),
        ingredients: formData.ingredients.filter((i) => i.trim() !== ""),
        instructions: formData.instructions.filter((i) => i.trim() !== ""),
        tags: formData.tags.split(",").map((t) => t.trim()).filter((t) => t !== ""),
        image_url: imageUrl,
        is_active: true,
      });

      if (error) throw error;

      toast.success("Recept úspešne pridaný!");
      setFormData({
        title: "",
        description: "",
        category: "",
        difficulty: "",
        time: "",
        servings: "",
        calories: "",
        ingredients: [""],
        instructions: [""],
        tags: "",
      });
      setImageFile(null);
      setImagePreview("");
      onSuccess();
    } catch (error: any) {
      toast.error("Chyba pri pridávaní receptu: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-lg border">
      <h2 className="text-2xl font-bold">Pridať nový recept</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Názov receptu</label>
          <Input
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Napr. Gulášová polievka"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Popis</label>
          <Textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Stručný popis receptu"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Kategória</label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Vyberte kategóriu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Polievky">Polievky</SelectItem>
                <SelectItem value="Hlavné jedlá">Hlavné jedlá</SelectItem>
                <SelectItem value="Dezerty">Dezerty</SelectItem>
                <SelectItem value="Šaláty">Šaláty</SelectItem>
                <SelectItem value="Predjedlá">Predjedlá</SelectItem>
                <SelectItem value="Nápoje">Nápoje</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Obtiažnosť</label>
            <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Vyberte obtiažnosť" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ľahké">Ľahké</SelectItem>
                <SelectItem value="Stredné">Stredné</SelectItem>
                <SelectItem value="Náročné">Náročné</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Čas prípravy</label>
            <Input
              required
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              placeholder="Napr. 45 min"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Počet porcií</label>
            <Input
              required
              type="number"
              value={formData.servings}
              onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
              placeholder="4"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Kalórie (na porciu)</label>
            <Input
              required
              type="number"
              value={formData.calories}
              onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
              placeholder="350"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Fotka receptu</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90">
              <Upload className="h-4 w-4" />
              Nahrať fotku
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-md" />
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Ingrediencie</label>
            <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
              <Plus className="h-4 w-4 mr-1" /> Pridať
            </Button>
          </div>
          <div className="space-y-2">
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  required
                  value={ingredient}
                  onChange={(e) => updateIngredient(index, e.target.value)}
                  placeholder={`Ingrediencia ${index + 1}`}
                />
                {formData.ingredients.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeIngredient(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Postup prípravy</label>
            <Button type="button" variant="outline" size="sm" onClick={addInstruction}>
              <Plus className="h-4 w-4 mr-1" /> Pridať krok
            </Button>
          </div>
          <div className="space-y-2">
            {formData.instructions.map((instruction, index) => (
              <div key={index} className="flex gap-2">
                <Textarea
                  required
                  value={instruction}
                  onChange={(e) => updateInstruction(index, e.target.value)}
                  placeholder={`Krok ${index + 1}`}
                  rows={2}
                />
                {formData.instructions.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeInstruction(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tagy (oddelené čiarkou)</label>
          <Input
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="napr. vegetariánske, rýchle, zdravé"
          />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Ukladám..." : "Pridať recept"}
      </Button>
    </form>
  );
};
