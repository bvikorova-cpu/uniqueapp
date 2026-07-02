import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Send } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const formSchema = z.object({
  company_name: z.string().trim().min(2, "Company name must be at least 2 characters").max(100, "Company name can be at most 100 characters"),
  contact_name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name can be at most 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email can be at most 255 characters"),
  phone: z.string().trim().optional(),
  package_type: z.string().min(1, "Please select a package type"),
  event_type: z.string().trim().optional(),
  expected_attendees: z.coerce.number().int().positive().optional(),
  event_date: z.string().optional(),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000, "Message can be at most 1000 characters"),
});

type FormValues = z.infer<typeof formSchema>;

interface CorporateInquiryFormProps {
  defaultPackage?: string;
  defaultCategory?: string;
}

export function CorporateInquiryForm({ defaultPackage, defaultCategory }: CorporateInquiryFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: "",
      contact_name: "",
      email: "",
      phone: "",
      package_type: defaultPackage || "",
      event_type: defaultCategory || "",
      expected_attendees: undefined,
      event_date: "",
      message: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from("corporate_inquiries").insert({
        user_id: user?.id || null,
        company_name: values.company_name,
        contact_name: values.contact_name,
        email: values.email,
        phone: values.phone || null,
        package_type: values.package_type,
        event_type: values.event_type || null,
        expected_attendees: values.expected_attendees || null,
        event_date: values.event_date || null,
        message: values.message,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Inquiry sent!",
        description: "We will contact you soon with an individual offer.",
      });

      form.reset();
    } catch (error: any) {
      console.error("Error submitting inquiry:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send inquiry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Corporate Inquiry Form - How it works"} steps={[{ title: 'Open', desc: 'Access the Corporate Inquiry Form section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Corporate Inquiry Form.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card>
      <CardHeader>
        <CardTitle>Request a Quote</CardTitle>
        <CardDescription>
          Fill out the form and we will contact you with an individual offer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Your company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person *</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 xxx xxx xxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="package_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Package Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select package" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="startup">Startup (€15)</SelectItem>
                        <SelectItem value="business">Business (€30)</SelectItem>
                        <SelectItem value="corporate_premium">Corporate Premium (€60)</SelectItem>
                        <SelectItem value="mini_restaurant">Mini Restaurant (€5/month)</SelectItem>
                        <SelectItem value="standard_restaurant">Standard Restaurant (€12/month)</SelectItem>
                        <SelectItem value="chain_restaurant">Chain Restaurant (€25/location)</SelectItem>
                        <SelectItem value="wedding_basic">Wedding Basic (€20)</SelectItem>
                        <SelectItem value="wedding_premium">Wedding Premium (€40)</SelectItem>
                        <SelectItem value="event_organizer">Event Organizer</SelectItem>
                        <SelectItem value="custom">Custom Solution</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="event_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g. wedding, corporate event..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expected_attendees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Attendees</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Approximate count" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="event_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your requirements and needs..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
              <Send className="mr-2 h-4 w-4" />
              {isSubmitting ? "Sending..." : "Send Inquiry"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
    </>
  );
}