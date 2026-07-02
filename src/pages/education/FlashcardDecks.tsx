import { useState } from "react";
import { Link } from "react-router-dom";
import { useFlashcardDecks, useCreateDeck } from "@/hooks/useFlashcards";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Layers, Globe } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const __HIW_FLASHCARDDECKS_STEPS = [
  { title: 'Create a deck', desc: 'Add cards manually or auto-generate from a PDF / notes.' },
  { title: 'Share with friends', desc: 'Public decks are searchable by other learners.' },
  { title: 'Study daily', desc: 'Open a deck to run a spaced-repetition session.' }
];
const __HIW_FLASHCARDDECKS = { title: 'Flashcard Decks', intro: 'Your library of flashcard decks.', steps: __HIW_FLASHCARDDECKS_STEPS };


export default function FlashcardDecks() {
  const { data: decks = [], isLoading } = useFlashcardDecks();
  const create = useCreateDeck();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");

  return (
    <>
      <FloatingHowItWorks title={__HIW_FLASHCARDDECKS.title} intro={__HIW_FLASHCARDDECKS.intro} steps={__HIW_FLASHCARDDECKS.steps} />
      <Helmet><title>Flashcards · Education</title></Helmet>
      <div className="container mx-auto px-4 pt-20 pb-12 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black">My Flashcard Decks</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-1" /> New deck</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create a deck</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <Input placeholder="Subject (e.g. Biology)" value={subject} onChange={(e) => setSubject(e.target.value)} />
                <Button
                  className="w-full"
                  disabled={!title || create.isPending}
                  onClick={async () => {
                    const d = await create.mutateAsync({ title, subject: subject || null as any });
                    setOpen(false);
                    setTitle("");
                    setSubject("");
                    window.location.href = `/education/flashcards/${d.id}`;
                  }}
                >
                  Create
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-muted-foreground">Loading...</div>
        ) : decks.length === 0 ? (
          <Card className="backdrop-blur-xl bg-card/80">
            <CardContent className="p-10 text-center">
              <Layers className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No decks yet. Create your first one!</p>
              <Button onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-1" /> New deck</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {decks.map((d) => (
              <Link key={d.id} to={`/education/flashcards/${d.id}`}>
                <Card className="hover:border-primary/40 transition-all backdrop-blur-xl bg-card/80">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <Layers className="w-6 h-6 text-primary" />
                      {d.is_public && <Globe className="w-4 h-4 text-muted-foreground" />}
                    </div>
                    <h3 className="font-bold mb-1">{d.title}</h3>
                    {d.subject && <p className="text-xs text-muted-foreground mb-2">{d.subject}</p>}
                    <p className="text-xs text-muted-foreground">{d.card_count} cards</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
