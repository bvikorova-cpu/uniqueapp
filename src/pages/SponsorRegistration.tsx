import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, Loader2, CheckCircle, Trophy, Star, Crown, Zap, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(2, "Brand name must be at least 2 characters"),
  category: z.string().min(1, "Please select a category"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  website: z.string().url("Please enter a valid URL"),
  logo: z.string().min(1, "Please upload a logo"),
});

type FormData = z.infer<typeof formSchema>;

const TIERS = [
  {
    id: "bronze",
    name: "Bronze",
    price: "€200",
    period: "/month",
    icon: Trophy,
    color: "from-amber-600 to-amber-800",
    features: ["Basic brand visibility", "Monthly votes tracking", "Community exposure"],
  },
  {
    id: "silver",
    name: "Silver",
    price: "€500",
    period: "/month",
    icon: Star,
    color: "from-gray-400 to-gray-600",
    features: ["Enhanced visibility", "Priority listing", "Analytics dashboard", "Featured badge"],
  },
  {
    id: "gold",
    name: "Gold",
    price: "€1,500",
    period: "/month",
    icon: Crown,
    color: "from-yellow-400 to-yellow-600",
    features: ["Premium placement", "Custom branding", "Advanced analytics", "Marketing support"],
  },
  {
    id: "platinum",
    name: "Platinum",
    price: "€3,000",
    period: "/month",
    icon: Zap,
    color: "from-purple-500 to-pink-600",
    features: ["Top priority placement", "Full customization", "Dedicated support", "Exclusive features"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "by agreement",
    icon: Building2,
    color: "from-amber-400 via-yellow-500 to-amber-600",
    custom: true,
    features: [
      "Custom packages tailored to your brand",
      "Negotiated pricing (6-figure deals welcome)",
      "Global campaigns & exclusive partnerships",
      "Dedicated account manager & white-label",
      "Direct API access & co-branded events",
      "Designed for Pepsi, Gucci, LVMH-scale brands",
    ],
  },
];

const CATEGORIES = [
  "Technology",
  "Fashion",
  "Food & Beverage",
  "Health & Wellness",
  "Entertainment",
  "Education",
  "Finance",
  "Sports",
  "Travel",
  "Automotive",
  "Other",
];

export default function SponsorRegistration() {
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      description: "",
      website: "",
      logo: "",
    },
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to upload logo");
        return;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `brand-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("brand-assets")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("brand-assets")
        .getPublicUrl(filePath);

      form.setValue("logo", publicUrl);
      toast.success("Logo uploaded successfully");
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!selectedTier) {
      toast.error("Please select a sponsorship tier");
      return;
    }

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to continue");
        navigate("/auth");
        return;
      }

      const response = await supabase.functions.invoke("create-brand-sponsorship", {
        body: {
          tier: selectedTier,
          brandData: {
            name: data.name,
            logo: data.logo,
            category: data.category,
            description: data.description,
            website: data.website,
          },
        },
      });

      if (response.error) throw response.error;

      if (response.data?.url) {
        { const __w = window.open(response.data.url, "_blank", "noopener,noreferrer"); if (!__w) { const __w = window.open(response.data.url, "_blank", "noopener,noreferrer"); if (!__w) window.location.href = response.data.url; } }
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Error creating sponsorship:", error);
      toast.error("Failed to create sponsorship. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/brand-battle")}
          className="mb-6 text-white hover:bg-white/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Brand Battle
        </Button>

        <Card className="bg-black/40 backdrop-blur-lg border-purple-500/50 p-8 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 mb-4">
              Become a Brand Sponsor
            </h1>
            <p className="text-xl text-gray-300">
              Join the battle and showcase your brand to our community
            </p>
          </div>

          {/* Tier Selection */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Choose Your Sponsorship Tier
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {TIERS.map((tier) => {
                const Icon = tier.icon;
                const isSelected = selectedTier === tier.id;
                return (
                  <Card
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`relative p-6 cursor-pointer transition-all hover:scale-105 ${
                      isSelected
                        ? "ring-4 ring-purple-500 bg-gradient-to-br from-purple-900/50 to-pink-900/50"
                        : "bg-black/40 hover:bg-black/60"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute -top-3 -right-3">
                        <CheckCircle className="h-8 w-8 text-green-500 fill-green-500" />
                      </div>
                    )}
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4 mx-auto`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white text-center mb-2">
                      {tier.name}
                    </h3>
                    <div className="text-center mb-4">
                      <span className="text-3xl font-bold text-white">{tier.price}</span>
                      <span className="text-gray-400">{tier.period}</span>
                    </div>
                    <ul className="space-y-2">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-gray-300 flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Brand Details Form */}
          <div className="bg-black/20 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Brand Details</h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Brand Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your Brand Name"
                            className="bg-black/40 border-purple-500/30 text-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-black/40 border-purple-500/30 text-white">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CATEGORIES.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Website URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://yourbrand.com"
                          className="bg-black/40 border-purple-500/30 text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Brand Logo</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <Label
                              htmlFor="logo-upload"
                              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                            >
                              <Upload className="h-4 w-4" />
                              {uploading ? "Uploading..." : "Upload Logo"}
                            </Label>
                            <input
                              id="logo-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                              disabled={uploading}
                            />
                            {field.value && (
                              <span className="text-green-500 text-sm">Logo uploaded ✓</span>
                            )}
                          </div>
                          {field.value && (
                            <img
                              src={field.value}
                              alt="Brand logo preview"
                              className="w-32 h-32 object-contain rounded-lg bg-white/10 p-2"
                            />
                          )}
                          <FormDescription className="text-gray-400">
                            Upload your brand logo (max 5MB, PNG or JPG recommended)
                          </FormDescription>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Brand Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about your brand..."
                          className="bg-black/40 border-purple-500/30 text-white min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-gray-400">
                        This will be displayed on your brand card in the battle arena
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-center pt-6">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={!selectedTier || submitting || uploading}
                    className="text-xl px-12 py-6 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white font-bold shadow-2xl"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Proceed to Checkout
                        <ArrowLeft className="ml-2 h-5 w-5 rotate-180" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </Card>
      </div>
    </div>
  );
}
