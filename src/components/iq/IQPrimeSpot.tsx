import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Hash, Trophy, RotateCcw } from "lucide-react";

const KEY = "iq_primespot_best_streak";

const isPrime = (n: number) => {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
};

const gen = () => {
  const nums = new Set<number>();
  while (nums.size < 9) nums.add(2 + Math.floor(Math.random() * 60));
  return Array.from(nums);
};

const IQPrimeSpot = () => {
  const [nums, setNums] = useState(gen);
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);

  useEffect(() => { const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s, 10) || 0); }, []);

  const tap = (n: number) => {
    const np = new Set(picked); if (np.has(n)) np.delete(n); else np.add(n); setPicked(np);
  };

  const check = () => {
    const allPrimes = nums.filter(isPrime);
    const ok = allPrimes.length === picked.size && allPrimes.every(p => picked.has(p));
    if (ok) {
      const ns = streak + 1; setStreak(ns);
      if (ns > best) { setBest(ns); localStorage.setItem(KEY, String(ns)); }
      setNums(gen()); setPicked(new Set());
    } else {
      setStreak(0); setNums(gen()); setPicked(new Set());
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="w-5 h-5 text-primary" /> Prime Spotter
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground text-center">Pick all primes · Streak: <strong>{streak}</strong></div>
        <div className="grid grid-cols-3 gap-2">
          {nums.map(n => (
            <button key={n} onClick={() => tap(n)}
              className={`aspect-square rounded-lg text-xl font-bold ${picked.has(n) ? "bg-primary text-primary-foreground" : "bg-background/60 border border-border/40 hover:bg-primary/20"}`}>
              {n}
            </button>
          ))}
        </div>
        <Button onClick={check} size="sm" className="w-full">Submit</Button>
        <Button onClick={() => { setStreak(0); setNums(gen()); setPicked(new Set()); }} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> Reset</Button>
      </CardContent>
    </Card>
  );
};

export default IQPrimeSpot;
