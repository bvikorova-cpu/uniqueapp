import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useCertificate = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateCertificate = async (courseId: string, courseName: string, studentName: string) => {
    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase.functions.invoke("generate-course-certificate", {
        body: { courseId, courseName, studentName },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Certificate generated successfully!",
      });

      return data;
    } catch (error: any) {
      console.error("Error generating certificate:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate certificate",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const getCertificate = async (courseId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("course_certificates")
        .select("*")
        .eq("course_id", courseId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching certificate:", error);
      return null;
    }
  };

  return {
    generateCertificate,
    getCertificate,
    isGenerating,
  };
};
