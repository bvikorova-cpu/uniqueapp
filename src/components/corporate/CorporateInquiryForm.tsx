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

const formSchema = z.object({
  company_name: z.string().trim().min(2, "Názov firmy musí mať aspoň 2 znaky").max(100, "Názov firmy môže mať maximálne 100 znakov"),
  contact_name: z.string().trim().min(2, "Meno musí mať aspoň 2 znaky").max(100, "Meno môže mať maximálne 100 znakov"),
  email: z.string().trim().email("Neplatná emailová adresa").max(255, "Email môže mať maximálne 255 znakov"),
  phone: z.string().trim().optional(),
  package_type: z.string().min(1, "Vyberte typ balíka"),
  event_type: z.string().trim().optional(),
  expected_attendees: z.coerce.number().int().positive().optional(),
  event_date: z.string().optional(),
  message: z.string().trim().min(10, "Správa musí mať aspoň 10 znakov").max(1000, "Správa môže mať maximálne 1000 znakov"),
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
        title: "Dopyt odoslaný!",
        description: "Čoskoro vás budeme kontaktovať s individuálnou ponukou.",
      });

      form.reset();
    } catch (error: any) {
      console.error("Error submitting inquiry:", error);
      toast({
        title: "Chyba",
        description: error.message || "Nepodarilo sa odoslať dopyt. Skúste to prosím znova.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nezáväzný dopyt</CardTitle>
        <CardDescription>
          Vyplňte formulár a my vás budeme kontaktovať s individuálnou ponukou
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
                    <FormLabel>Názov firmy *</FormLabel>
                    <FormControl>
                      <Input placeholder="Váš názov firmy" {...field} />
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
                    <FormLabel>Kontaktná osoba *</FormLabel>
                    <FormControl>
                      <Input placeholder="Meno a priezvisko" {...field} />
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
                      <Input type="email" placeholder="vas@email.sk" {...field} />
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
                    <FormLabel>Telefón</FormLabel>
                    <FormControl>
                      <Input placeholder="+421 xxx xxx xxx" {...field} />
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
                    <FormLabel>Typ balíka *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Vyberte balík" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="startup">Startup (€15)</SelectItem>
                        <SelectItem value="business">Business (€30)</SelectItem>
                        <SelectItem value="corporate_premium">Corporate Premium (€60)</SelectItem>
                        <SelectItem value="mini_restaurant">Mini Reštaurácia (€5/mesiac)</SelectItem>
                        <SelectItem value="standard_restaurant">Standard Restaurant (€12/mesiac)</SelectItem>
                        <SelectItem value="chain_restaurant">Chain Restaurant (€25/location)</SelectItem>
                        <SelectItem value="wedding_basic">Wedding Basic (€20)</SelectItem>
                        <SelectItem value="wedding_premium">Wedding Premium (€40)</SelectItem>
                        <SelectItem value="event_organizer">Event Organizer</SelectItem>
                        <SelectItem value="custom">Individuálne riešenie</SelectItem>
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
                    <FormLabel>Typ eventu</FormLabel>
                    <FormControl>
                      <Input placeholder="Napr. svadba, firemný event..." {...field} />
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
                    <FormLabel>Počet účastníkov</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Približný počet" {...field} />
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
                    <FormLabel>Dátum eventu</FormLabel>
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
                  <FormLabel>Správa *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Popíšte vaše požiadavky a potreby..."
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
              {isSubmitting ? "Odosielam..." : "Odoslať dopyt"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}