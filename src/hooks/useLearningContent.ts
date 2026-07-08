import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PurchasedContent {
  id: string;
  content_id: string;
  content_type: string;
  title: string;
  price: number;
  purchase_date: string;
  status: string;
}

interface LearningProgress {
  id: string;
  content_id: string;
  content_type: string;
  progress_percentage: number;
  completed_modules: number[];
  current_module: number;
  time_spent_minutes: number;
  last_accessed: string;
  completed_at: string | null;
}

interface Certificate {
  id: string;
  content_id: string;
  content_type: string;
  title: string;
  certificate_url: string | null;
  certificate_number: string;
  issue_date: string;
  instructor_name: string | null;
  completion_score: number | null;
}

export const useLearningContent = () => {
  const { toast } = useToast();
  const [purchased, setPurchased] = useState<PurchasedContent[]>([]);
  const [progress, setProgress] = useState<Map<string, LearningProgress>>(new Map());
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPurchasedContent();
  }, []);

  const loadPurchasedContent = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const [purchasedData, progressData, certificatesData] = await Promise.all([
        supabase
          .from('purchased_learning_content')
          .select('*')
          .eq('user_id', user.id)
          .order('purchase_date', { ascending: false }),
        supabase
          .from('learning_progress')
          .select('*')
          .eq('user_id', user.id),
        supabase
          .from('learning_certificates')
          .select('*')
          .eq('user_id', user.id)
          .order('issue_date', { ascending: false })
      ]);

      if (purchasedData.data) {
        setPurchased(purchasedData.data);
      }

      if (progressData.data) {
        const progressMap = new Map();
        progressData.data.forEach((p) => {
          progressMap.set(`${p.content_type}-${p.content_id}`, p);
        });
        setProgress(progressMap);
      }

      if (certificatesData.data) {
        setCertificates(certificatesData.data);
      }
    } catch (error) {
      console.error('Error loading learning content:', error);
      toast({
        title: "Error",
        description: "Failed to load your content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isPurchased = (contentId: string, contentType: string) => {
    return purchased.some(
      (p) => p.content_id === contentId && p.content_type === contentType && p.status === 'active'
    );
  };

  const getProgress = (contentId: string, contentType: string): LearningProgress | undefined => {
    return progress.get(`${contentType}-${contentId}`);
  };

  const purchaseContent = async (
    contentId: string,
    contentType: string,
    title: string,
    price: number
  ) => {
    try {
      // Re-validate session against Auth server (getUser), not just local storage
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes?.user) {
        toast({
          title: "Please log in",
          description: "Your session expired. Sign in to complete the purchase.",
          variant: "destructive",
        });
        return null;
      }

      const amount = Math.max(50, Math.round(Number(price) * 100)); // EUR cents, min €0.50
      const { data, error } = await supabase.functions.invoke('create-learning-payment', {
        body: {
          contentId,
          contentType,
          title,
          price,
          amount,
          productName: title,
          product: 'learning',
          successUrl: `${window.location.origin}${window.location.pathname}?purchase=success`,
          cancelUrl: `${window.location.origin}${window.location.pathname}?purchase=cancelled`,
        },
      });

      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      const url = (data as any)?.url;
      if (url) {
        window.open(url, '_blank');
        return url;
      }

      toast({
        title: "Checkout error",
        description: "The payment provider did not return a checkout URL. Please try again.",
        variant: "destructive",
      });
      return null;
    } catch (error) {
      console.error('Purchase error:', error);
      const msg = error instanceof Error ? error.message : String(error);
      const friendly = /Failed to send|network|fetch/i.test(msg)
        ? "Could not reach the payment service. Check your connection and that you are logged in, then try again."
        : msg || "Unknown error";
      toast({
        title: "Purchase Failed",
        description: friendly,
        variant: "destructive",
      });
      return null;
    }
  };

  const verifyPurchase = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-learning-payment', {
        body: { session_id: sessionId },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Purchase Confirmed!",
          description: "You now have access to this content",
        });
        await loadPurchasedContent();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateProgress = async (
    contentId: string,
    contentType: string,
    progressPercentage: number,
    currentModule: number,
    completedModules: number[]
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const isCompleted = progressPercentage >= 100;

      const { error } = await supabase
        .from('learning_progress')
        .upsert({
          user_id: user.id,
          content_id: contentId,
          content_type: contentType,
          progress_percentage: progressPercentage,
          current_module: currentModule,
          completed_modules: completedModules,
          completed_at: isCompleted ? new Date().toISOString() : null,
          last_accessed: new Date().toISOString(),
        }, {
          onConflict: 'user_id,content_id,content_type'
        });

      if (error) throw error;

      await loadPurchasedContent();
      return true;
    } catch (error) {
      console.error('Progress update error:', error);
      return false;
    }
  };

  const generateCertificate = async (
    contentId: string,
    contentType: string,
    title: string,
    instructorName: string,
    completionScore?: number
  ) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase.functions.invoke('generate-certificate', {
        body: { contentId, contentType, title, instructorName, completionScore },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Certificate Generated!",
          description: `Certificate ${data.certificate.certificate_number} has been created`,
        });
        await loadPurchasedContent();
        return data.certificate;
      }

      return null;
    } catch (error) {
      console.error('Certificate generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    purchased,
    progress,
    certificates,
    loading,
    isPurchased,
    getProgress,
    purchaseContent,
    verifyPurchase,
    updateProgress,
    generateCertificate,
    refresh: loadPurchasedContent,
  };
};
