import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload, X, FileText, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface DocumentUpload {
  id: string;
  type: string;
  name: string;
  file?: File;
  url?: string;
}

const DOCUMENT_TYPES = {
  business_license: "Business License",
  tax_certificate: "Tax Certificate",
  company_registration: "Company Registration",
  proof_of_address: "Proof of Address",
  other: "Other Document",
};

export function EmployerVerificationForm({ userId }: { userId: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    company_name: "",
    company_registration_number: "",
    company_address: "",
    company_website: "",
    company_phone: "",
  });
  const [documents, setDocuments] = useState<DocumentUpload[]>([]);
  const [uploading, setUploading] = useState(false);

  // Fetch existing verification
  const { data: verification, isLoading } = useQuery({
    queryKey: ['employer-verification', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employer_verifications')
        .select('*, employer_verification_documents(*)')
        .eq('employer_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  // Submit verification mutation
  const submitVerification = useMutation({
    mutationFn: async () => {
      if (!formData.company_name || !formData.company_address || !formData.company_phone) {
        throw new Error("Please fill in all required fields");
      }

      if (documents.length === 0) {
        throw new Error("Please upload at least one verification document");
      }

      setUploading(true);

      // Create or update verification record
      const verificationData: any = {
        employer_id: userId,
        company_name: formData.company_name,
        company_registration_number: formData.company_registration_number || null,
        company_address: formData.company_address,
        company_website: formData.company_website || null,
        company_phone: formData.company_phone,
        verification_status: 'pending',
      };

      const { data: verificationRecord, error: verificationError } = await supabase
        .from('employer_verifications')
        .upsert(verificationData)
        .select()
        .single();

      if (verificationError) throw verificationError;

      // Upload documents
      for (const doc of documents) {
        if (doc.file) {
          const fileExt = doc.file.name.split('.').pop();
          const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('employer-verification-docs')
            .upload(fileName, doc.file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('employer-verification-docs')
            .getPublicUrl(fileName);

          const { error: docError } = await supabase
            .from('employer_verification_documents')
            .insert({
              verification_id: verificationRecord.id,
              document_type: doc.type,
              document_name: doc.name,
              document_url: publicUrl,
            });

          if (docError) throw docError;
        }
      }

      return verificationRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-verification'] });
      toast({
        title: "Verification Submitted",
        description: "Your verification request has been submitted for admin review",
      });
      setDocuments([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setUploading(false);
    },
  });

  const handleFileSelect = (type: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    setDocuments([...documents, {
      id: Math.random().toString(36),
      type,
      name: file.name,
      file,
    }]);
  };

  const removeDocument = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  if (isLoading) {
    return (
      <>
        <FloatingHowItWorks title="How Employer Verification Form works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
        <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
      </>
      );
  }

  // Show status if verification exists
  if (verification) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verification Status</CardTitle>
          <CardDescription>Your employer verification request</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{verification.company_name}</h3>
              <p className="text-sm text-muted-foreground">{verification.company_address}</p>
            </div>
            <Badge variant={
              verification.verification_status === 'approved' ? 'default' :
              verification.verification_status === 'rejected' ? 'destructive' :
              verification.verification_status === 'requires_resubmission' ? 'secondary' :
              'outline'
            }>
              {verification.verification_status === 'approved' && <CheckCircle className="h-4 w-4 mr-1" />}
              {verification.verification_status === 'pending' && <Clock className="h-4 w-4 mr-1" />}
              {verification.verification_status === 'rejected' && <XCircle className="h-4 w-4 mr-1" />}
              {verification.verification_status === 'requires_resubmission' && <AlertCircle className="h-4 w-4 mr-1" />}
              {verification.verification_status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          {verification.verification_status === 'rejected' && verification.rejection_reason && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Rejection Reason:</strong> {verification.rejection_reason}
              </AlertDescription>
            </Alert>
          )}

          {verification.verification_status === 'requires_resubmission' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Resubmission Required:</strong> {verification.rejection_reason}
              </AlertDescription>
            </Alert>
          )}

          {verification.admin_notes && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-semibold mb-1">Admin Notes:</p>
              <p className="text-sm text-muted-foreground">{verification.admin_notes}</p>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="font-semibold">Uploaded Documents</h4>
            {verification.employer_verification_documents?.map((doc: any) => (
              <div key={doc.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                <FileText className="h-4 w-4" />
                <span className="text-sm flex-1">{doc.document_name}</span>
                <Badge variant="outline">{DOCUMENT_TYPES[doc.document_type as keyof typeof DOCUMENT_TYPES]}</Badge>
              </div>
            ))}
          </div>

          {(verification.verification_status === 'rejected' || verification.verification_status === 'requires_resubmission') && (
            <Button onClick={() => {
              setFormData({
                company_name: verification.company_name,
                company_registration_number: verification.company_registration_number || "",
                company_address: verification.company_address,
                company_website: verification.company_website || "",
                company_phone: verification.company_phone,
              });
              // Would need to allow resubmission here
            }}>
              Resubmit Verification
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employer Verification</CardTitle>
        <CardDescription>
          Submit your company documents for verification to access employer features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="company_name">Company Name *</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              placeholder="e.g. Tech Solutions Ltd."
            />
          </div>

          <div>
            <Label htmlFor="registration">Company Registration Number</Label>
            <Input
              id="registration"
              value={formData.company_registration_number}
              onChange={(e) => setFormData({ ...formData, company_registration_number: e.target.value })}
              placeholder="e.g. 12345678"
            />
          </div>

          <div>
            <Label htmlFor="address">Company Address *</Label>
            <Textarea
              id="address"
              value={formData.company_address}
              onChange={(e) => setFormData({ ...formData, company_address: e.target.value })}
              placeholder="Full company address"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="website">Company Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.company_website}
              onChange={(e) => setFormData({ ...formData, company_website: e.target.value })}
              placeholder="https://www.company.com"
            />
          </div>

          <div>
            <Label htmlFor="phone">Company Phone *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.company_phone}
              onChange={(e) => setFormData({ ...formData, company_phone: e.target.value })}
              placeholder="+421 900 123 456"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Upload Verification Documents *</h3>
          <p className="text-sm text-muted-foreground">
            Please upload at least one document to verify your company (Business License, Tax Certificate, Company Registration, or Proof of Address)
          </p>

          {Object.entries(DOCUMENT_TYPES).map(([type, label]) => (
            <div key={type} className="space-y-2">
              <Label htmlFor={`doc-${type}`}>{label}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id={`doc-${type}`}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileSelect(type, e.target.files)}
                  className="flex-1"
                />
              </div>
            </div>
          ))}

          {documents.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Selected Documents:</h4>
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm flex-1">{doc.name}</span>
                  <Badge variant="outline">{DOCUMENT_TYPES[doc.type as keyof typeof DOCUMENT_TYPES]}</Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeDocument(doc.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button
          onClick={() => submitVerification.mutate()}
          disabled={uploading || submitVerification.isPending}
          className="w-full"
        >
          {uploading ? (
            <>
              <Upload className="h-4 w-4 mr-2 animate-spin" />
              Uploading Documents...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Submit for Verification
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
