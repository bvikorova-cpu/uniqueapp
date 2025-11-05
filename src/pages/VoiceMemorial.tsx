import Navbar from '@/components/Navbar';
import { VoiceCloneUpload } from '@/components/voice-memorial/VoiceCloneUpload';
import { VoiceMemoryPlayer } from '@/components/voice-memorial/VoiceMemoryPlayer';
import { VoiceCloneManager } from '@/components/voice-memorial/VoiceCloneManager';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const VoiceMemorial = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link to="/time-capsule">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Späť na Time Capsule
            </Button>
          </Link>
        </div>

        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Voice Clone Memorial
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Zachovajte hlas vašich blízkych navždy. Vytvorte digitálny klon hlasu a prehrávajte spomienky tak, akoby boli tu.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-1">
            <VoiceCloneUpload />
            <VoiceCloneManager />
            <VoiceMemoryPlayer />
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Ako to funguje?</h3>
            <ol className="space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <span className="font-bold text-primary">1.</span>
                <span>Nahrajte audio nahrávku hlasu osoby (minimálne 30 sekúnd)</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary">2.</span>
                <span>Systém vytvorí digitálny klon hlasu pomocou AI technológie</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary">3.</span>
                <span>Napíšte text spomienky a vyberte klonovaný hlas</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary">4.</span>
                <span>Počúvajte spomienky v pôvodnom hlase kedykoľvek chcete</span>
              </li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VoiceMemorial;
