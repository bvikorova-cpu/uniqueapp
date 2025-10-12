import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { Mail, MessageSquare, User } from "lucide-react";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Meno je povinné").max(100, "Meno je príliš dlhé"),
  email: z.string().trim().email("Neplatná emailová adresa").max(255, "Email je príliš dlhý"),
  subject: z.string().trim().min(1, "Predmet je povinný").max(200, "Predmet je príliš dlhý"),
  message: z.string().trim().min(10, "Správa musí mať aspoň 10 znakov").max(2000, "Správa je príliš dlhá"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from("contact_messages").insert({
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        user_id: user?.id || null,
      });

      if (error) throw error;

      toast({
        title: "Správa odoslaná!",
        description: "Ďakujeme za vašu správu. Čoskoro vás budeme kontaktovať.",
      });

      form.reset();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa odoslať správu. Skúste to prosím znova.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-2xl mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Kontaktujte nás</CardTitle>
            <CardDescription>
              Máte otázku alebo pripomienku? Napíšte nám správu a my sa vám ozveme čo najskôr.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meno</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Vaše meno" className="pl-10" {...field} />
                        </div>
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input type="email" placeholder="vas@email.com" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Predmet</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="O čom je vaša správa?" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Správa</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Napíšte nám vašu správu..."
                          className="min-h-[150px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Odeosielam..." : "Odoslať správu"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;
