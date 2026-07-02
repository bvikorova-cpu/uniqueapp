import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ThumbsUp, ThumbsDown, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  helpful_count: number;
  not_helpful_count: number;
}

interface Props {
  highlightId?: string | null;
}

export const ContactFAQ = ({ highlightId }: Props) => {
  const [items, setItems] = useState<FAQItem[]>([]);
  const [search, setSearch] = useState("");
  const [voted, setVoted] = useState<Record<string, "up" | "down">>({});

  useEffect(() => {
    supabase
      .from("support_faq")
      .select("id, category, question, answer, helpful_count, not_helpful_count")
      .eq("is_active", true)
      .order("display_order")
      .then(({ data }) => setItems(data ?? []));
  }, []);

  const filtered = items.filter(
    (i) =>
      !search ||
      i.question.toLowerCase().includes(search.toLowerCase()) ||
      i.answer.toLowerCase().includes(search.toLowerCase()),
  );

  const vote = async (id: string, kind: "up" | "down") => {
    if (voted[id]) return;
    setVoted((p) => ({ ...p, [id]: kind }));
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const payload =
      kind === "up"
        ? { helpful_count: item.helpful_count + 1 }
        : { not_helpful_count: item.not_helpful_count + 1 };
    await supabase.from("support_faq").update(payload).eq("id", id);
    toast({ title: "Thanks for your feedback!" });
  };

  return (
    <>
      <FloatingHowItWorks title={"Contact F A Q - How it works"} steps={[{ title: 'Open', desc: 'Access the Contact F A Q section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Contact F A Q.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-5 mb-6 border-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-base">Quick Help — FAQ</h3>
        </div>
        <Badge variant="secondary" className="text-[10px]">{items.length} answers</Badge>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search FAQ…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Accordion type="single" collapsible className="w-full" defaultValue={highlightId ?? undefined}>
        {filtered.map((item) => (
          <AccordionItem key={item.id} value={item.id} className={highlightId === item.id ? "border-primary/50" : ""}>
            <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline py-3">
              <div className="flex items-center gap-2 pr-2">
                <Badge variant="outline" className="text-[9px] uppercase">{item.category}</Badge>
                <span>{item.question}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
              <p className="mb-3">{item.answer}</p>
              <div className="flex items-center gap-2 pt-2 border-t">
                <span className="text-[11px] text-muted-foreground">Was this helpful?</span>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={!!voted[item.id]}
                  onClick={() => vote(item.id, "up")}
                  className="h-7 px-2"
                >
                  <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                  {item.helpful_count}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={!!voted[item.id]}
                  onClick={() => vote(item.id, "down")}
                  className="h-7 px-2"
                >
                  <ThumbsDown className="h-3.5 w-3.5 mr-1" />
                  {item.not_helpful_count}
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">No matching FAQ — send us a message below.</p>
        )}
      </Accordion>
    </Card>
    </>
  );
};
